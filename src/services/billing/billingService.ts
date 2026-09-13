import { createHmac, timingSafeEqual } from 'crypto';
import type { Subscription, SubscriptionPlan, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, UpstreamError, ConflictError, UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { usageService } from './usageService';
import { logger } from '../../config/logger';

export interface PlanChangeParams {
  organizationId: string;
  plan: SubscriptionPlan;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      customer?: string;
      status?: string;
      current_period_start?: number;
      current_period_end?: number;
      cancel_at_period_end?: boolean;
      plan?: { id?: string };
    };
  };
}

const PLAN_BY_STRIPE_PRODUCT: Record<string, SubscriptionPlan> = {
  'prod_pro': 'PRO',
  'prod_business': 'BUSINESS',
  'prod_enterprise': 'ENTERPRISE',
};

const STRIPE_TIME_TOLERANCE_SECONDS = 3600;

const verifyStripeSignature = (rawBody: string, signature: string, secret: string): void => {
  const entries = new Map(
    signature.split(',').map((part) => {
      const idx = part.indexOf('=');
      return [part.slice(0, idx), part.slice(idx + 1)];
    })
  );
  const timestamp = entries.get('t');
  const provided = entries.get('v1');
  if (!timestamp || !provided) {
    throw new UnauthorizedError('Invalid Stripe signature header.');
  }
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > STRIPE_TIME_TOLERANCE_SECONDS) {
    throw new UnauthorizedError('Stripe webhook timestamp is outside the tolerance window.');
  }
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const providedBuf = Buffer.from(provided, 'hex');
  if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
    throw new UnauthorizedError('Invalid Stripe webhook signature.');
  }
};

export const billingService = {
  async getSubscription(organizationId: string): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({ where: { organizationId } });
    if (!subscription) {
      throw new NotFoundError(Messages.BILLING.NOT_FOUND);
    }
    return subscription;
  },

  async getOrCreate(organizationId: string): Promise<Subscription> {
    const existing = await prisma.subscription.findUnique({ where: { organizationId } });
    if (existing) return existing;
    return prisma.subscription.create({
      data: {
        organizationId,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  },

  async changePlan(params: PlanChangeParams): Promise<Subscription> {
    await billingService.getSubscription(params.organizationId);
    return prisma.subscription.update({
      where: { organizationId: params.organizationId },
      data: { plan: params.plan },
    });
  },

  async updateSubscription(organizationId: string, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
    await billingService.getSubscription(organizationId);
    return prisma.subscription.update({ where: { organizationId }, data });
  },

  async getUsage(organizationId: string): Promise<unknown> {
    const [subscription, current, history, latest] = await Promise.all([
      billingService.getSubscription(organizationId),
      usageService.getForOrg(organizationId),
      usageService.getHistory(organizationId),
      prisma.usage.findMany({ where: { organizationId }, orderBy: { month: 'desc' }, take: 1 }),
    ]);
    return { subscription, current, history, latest: latest[0] ?? null };
  },

  async handleStripeWebhook(signature: string, rawBody: string): Promise<{ received: true }> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new UpstreamError('Stripe is not configured on this instance.');
    }

    verifyStripeSignature(rawBody, signature, secret);

    let event: StripeEvent;
    try {
      event = JSON.parse(rawBody) as StripeEvent;
    } catch {
      throw new UpstreamError('Invalid webhook payload.');
    }

    void billingService.applyStripeEvent(event);
    return { received: true };
  },

  async applyStripeEvent(event: StripeEvent): Promise<void> {
    const { prisma: db } = await import('../../config/database');
    try {
      switch (event.type) {
        case 'checkout.session.completed':
        case 'customer.subscription.updated':
        case 'customer.subscription.created': {
          const sub = event.data.object as unknown as {
            id?: string;
            customer?: string;
            status?: string;
            current_period_start?: number;
            current_period_end?: number;
            cancel_at_period_end?: boolean;
            plan?: { id?: string };
            items?: { data?: Array<{ price?: { product?: string } }> };
          };
          if (!sub.customer) return;
          const subscription = await db.subscription.findFirst({ where: { stripeCustomerId: sub.customer } });
          if (!subscription) return;
          const productId = sub.items?.data?.[0]?.price?.product;
          const plan = productId ? (PLAN_BY_STRIPE_PRODUCT[productId] ?? subscription.plan) : subscription.plan;
          await db.subscription.update({
            where: { id: subscription.id },
            data: {
              plan,
              stripeSubscriptionId: sub.id ?? subscription.stripeSubscriptionId,
              status: 'ACTIVE',
              currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : undefined,
              currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
              cancelledAt: sub.cancel_at_period_end ? new Date() : null,
            },
          });
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as unknown as { customer?: string };
          if (!sub.customer) return;
          const subscription = await db.subscription.findFirst({ where: { stripeCustomerId: sub.customer } });
          if (!subscription) return;
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: 'CANCELED', cancelledAt: new Date() },
          });
          break;
        }
        case 'invoice.payment_failed': {
          const obj = event.data.object as unknown as { customer?: string };
          logger.warn({ customer: obj.customer, eventId: event.id }, 'stripe invoice payment failed');
          break;
        }
        default:
          logger.debug({ type: event.type }, 'stripe webhook event noop');
      }
    } catch (error) {
      logger.error({ eventId: event.id, err: error }, 'failed to apply stripe webhook event');
    }
  },
};

export const throwStripeError = (): never => {
  throw new UpstreamError('Stripe is not configured on this instance.');
};

export const ensureStripeConfigured = (): void => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throwStripeError();
  }
  void key;
};

export { ConflictError as BillingConflictError };