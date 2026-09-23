import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import { PageLoader, Badge } from '../../components/ui';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  key: string;
  name: string;
  price: number | 'Custom';
  description: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    description: 'For individuals getting started',
    features: ['5 test runs/mo', '1 project', 'Community support'],
  },
  {
    key: 'hobby',
    name: 'Hobby',
    price: 29,
    description: 'For small teams',
    features: ['500 test runs/mo', '10 projects', 'Email support'],
  },
  {
    key: 'team',
    name: 'Team',
    price: 99,
    description: 'For growing teams',
    features: ['5,000 test runs/mo', 'Unlimited projects', 'Priority support', 'AI agents'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large orgs',
    features: ['Unlimited runs', 'SSO', 'Dedicated support'],
  },
];

export default function BillingSettingsPage() {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['billing'],
    queryFn: () => billingApi.subscription(),
  });

  const { data: usage, isLoading: loadingUsage } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: () => billingApi.usage(),
  });

  const updatePlanMutation = useMutation({
    mutationFn: (plan: string) => billingApi.updatePlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Plan updated successfully! 🎉');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const currentPlan = subscription?.plan?.toLowerCase();
  const percent =
    usage && usage.testRunLimit > 0
      ? Math.min(100, Math.round((usage.testRunsUsed / usage.testRunLimit) * 100))
      : 0;

  const priceLabel = (price: number | 'Custom') =>
    price === 'Custom' ? 'Custom' : `$${price}/mo`;

  if (loadingSubscription && !subscription) {
    return <PageLoader label="Loading billing..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">Usage</h2>
            <p className="text-sm text-muted-foreground">
              {usage?.month ? `Usage for ${usage.month}` : 'Test runs this month'}
            </p>
          </div>
        </div>

        {loadingUsage && !usage ? (
          <p className="text-sm text-muted-foreground">Loading usage...</p>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                Tests used this month: {usage?.testRunsUsed ?? 0} / {usage?.testRunLimit ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">{percent}%</p>
            </div>
            <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">Plans</h3>
        <p className="text-sm text-muted-foreground mb-4">Choose the plan that fits your team</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan, index) => {
            const isCurrent = currentPlan === plan.key;
            const isPending = updatePlanMutation.isPending;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`glass p-6 rounded-xl flex flex-col ${isCurrent ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">{plan.name}</h4>
                  {isCurrent && <Badge variant="success">Current</Badge>}
                </div>
                <p className="text-3xl font-bold mb-1">{priceLabel(plan.price)}</p>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="px-4 py-2.5 bg-secondary rounded-lg text-sm font-medium opacity-60 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => updatePlanMutation.mutate(plan.key)}
                    disabled={isPending}
                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Select Plan'
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}