import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import Layout from '../../components/Layout';
import {
  Loader2,
  RefreshCw,
  Zap,
  GitBranch,
  ShieldAlert,
  MessageSquare,
  CheckSquare,
  Plug,
  ExternalLink,
  Trash2,
  PlugZap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoader, EmptyState, Badge } from '../../components/ui';
import type { LucideIcon } from 'lucide-react';

interface IntegrationField {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
}

interface IntegrationMeta {
  name: string;
  icon: LucideIcon;
  description: string;
  fields: IntegrationField[];
}

const INTEGRATION_META: Record<string, IntegrationMeta> = {
  GITHUB: {
    name: 'GitHub',
    icon: GitBranch,
    description: 'Sync issues, pull requests and CI status from GitHub.',
    fields: [
      { key: 'token', label: 'Access Token', type: 'password', placeholder: 'ghp_...' },
      { key: 'apiUrl', label: 'API URL', placeholder: 'https://api.github.com' },
    ],
  },
  SLACK: {
    name: 'Slack',
    icon: MessageSquare,
    description: 'Send test run reports and alerts to Slack channels.',
    fields: [{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' }],
  },
  JIRA: {
    name: 'Jira',
    icon: CheckSquare,
    description: 'File and link bugs to Jira issues for tracking.',
    fields: [
      { key: 'baseUrl', label: 'Base URL', placeholder: 'https://your-org.atlassian.net' },
      { key: 'email', label: 'Email' },
      { key: 'apiToken', label: 'API Token', type: 'password' },
    ],
  },
  SENTRY: {
    name: 'Sentry',
    icon: ShieldAlert,
    description: 'Correlate test failures with errors captured in Sentry.',
    fields: [
      { key: 'organization', label: 'Organization Slug', placeholder: 'your-org' },
      { key: 'dsn', label: 'DSN', placeholder: 'https://...ingest.sentry.io/...' },
    ],
  },
  CIRCLE_CI: {
    name: 'CircleCI',
    icon: Zap,
    description: 'Watch CI pipeline results and trigger QA on new builds.',
    fields: [
      { key: 'token', label: 'API Token', type: 'password' },
      { key: 'vcs', label: 'VCS', placeholder: 'github' },
    ],
  },
};

type IntegrationItem = {
  id?: string;
  type: string;
  name: string;
  isActive?: boolean;
  config?: Record<string, unknown>;
  createdAt?: string;
  availability?: { configured?: boolean };
};

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [connectType, setConnectType] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () =>
      integrationsApi.list() as unknown as Promise<IntegrationItem[]>,
  });

  const connectMutation = useMutation({
    mutationFn: (data: { type: string; config: Record<string, unknown> }) => integrationsApi.connect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration connected');
      setConnectType(null);
      setConfigForm({});
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.test(id),
    onSuccess: (res) => {
      toast.success(res?.message || 'Integration test successful');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.disconnect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration disconnected');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const items = integrations ?? [];
  const meta = connectType ? (INTEGRATION_META[connectType] ?? null) : null;

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectType) return;
    connectMutation.mutate({ type: connectType, config: configForm });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Integrations</h1>
            <p className="text-muted-foreground">Connect your workflow tools</p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['integrations'] })}
            className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {isLoading && <PageLoader label="Loading integrations..." />}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={Plug}
            title="No integrations available"
            description="Supported integrations will appear here so you can connect your workflow tools."
          />
        )}

        {/* Integrations Grid */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const integrationMeta = INTEGRATION_META[item.type] ?? {
                name: item.name || item.type,
                icon: Plug,
                description: 'Third-party integration.',
                fields: [],
              };
              const Icon = integrationMeta.icon;
              const isConnected = !!item.id;
              return (
                <motion.div
                  key={item.id ?? item.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-6 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {isConnected ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Not connected</Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{integrationMeta.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{integrationMeta.description}</p>
                  <p className="text-xs text-muted-foreground mb-6">
                    {isConnected
                      ? item.availability?.configured
                        ? 'Configured'
                        : 'Configured'
                      : item.availability?.configured
                        ? 'Configured'
                        : 'Not configured'}
                  </p>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    {isConnected && item.id ? (
                      <>
                        <button
                          onClick={() => testMutation.mutate(item.id as string)}
                          disabled={testMutation.isPending}
                          className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Test
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Disconnect ${integrationMeta.name}?`)) {
                              disconnectMutation.mutate(item.id as string);
                            }
                          }}
                          disabled={disconnectMutation.isPending}
                          className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 text-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setConnectType(item.type);
                          setConfigForm({});
                        }}
                        className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <PlugZap className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Connect Integration Modal */}
      {meta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">Connect {meta.name}</h2>
            <p className="text-muted-foreground text-sm mb-6">{meta.description}</p>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              {meta.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-2">{field.label}</label>
                  <input
                    type={field.type ?? 'text'}
                    value={configForm[field.key] ?? ''}
                    onChange={(e) => setConfigForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={field.placeholder}
                    required
                    disabled={connectMutation.isPending}
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setConnectType(null)}
                  className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  disabled={connectMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectMutation.isPending}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}