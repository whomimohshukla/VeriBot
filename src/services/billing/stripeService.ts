import { ensureStripeConfigured, throwStripeError } from './billingService';
import { UpstreamError } from '../../utils/errors';

export interface StripeCustomer {
  customerId: string;
}

export interface StripeSubscriptionResult {
  subscriptionId: string;
}

const STRIPE_API = 'https://api.stripe.com/v1';

const callStripe = async <T>(method: string, path: string, body?: URLSearchParams): Promise<T> => {
  ensureStripeConfigured();
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throwStripeError();
  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body?.toString(),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new UpstreamError(`Stripe API returned ${response.status}`, text.slice(0, 500));
  }
  return response.json() as Promise<T>;
};

export const stripeService = {
  async createCustomer(organizationId: string, email: string): Promise<StripeCustomer> {
    const body = new URLSearchParams();
    body.set('email', email);
    body.set('metadata[organizationId]', organizationId);
    return callStripe<StripeCustomer>('POST', '/customers', body);
  },

  async createSubscription(customerId: string, priceId: string): Promise<StripeSubscriptionResult> {
    const body = new URLSearchParams({
      customer: customerId,
      items: `[{"price":"${priceId}"}]`,
    });
    return callStripe<StripeSubscriptionResult>('POST', '/subscriptions', body);
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await callStripe<unknown>('DELETE', `/subscriptions/${subscriptionId}`);
  },
};
