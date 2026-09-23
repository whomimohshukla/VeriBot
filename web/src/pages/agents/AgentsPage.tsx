import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi, projectsApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import Layout from '../../components/Layout';
import {
  Plus,
  Loader2,
  RefreshCw,
  Zap,
  Bot,
  GitBranch,
  Bug,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoader, EmptyState } from '../../components/ui';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui';
import type { AgentRun } from '../../types';
import type { LucideIcon } from 'lucide-react';

const AGENT_PROFILES: Record<string, { label: string; icon: LucideIcon; description: string }> = {
  TEST_EXPLORER: {
    label: 'Test Explorer',
    icon: Bot,
    description: 'Explores your app and generates test cases automatically.',
  },
  BUG_HUNTER: {
    label: 'Bug Hunter',
    icon: Bug,
    description: 'Heads-up bug detection during exploratory runs; files bugs with evidence.',
  },
  REGRESSION_ANALYST: {
    label: 'Regression Analyst',
    icon: GitBranch,
    description: 'Analyzes regressions and flaky tests, identifies root cause.',
  },
  PERFORMANCE_AUDITOR: {
    label: 'Performance Auditor',
    icon: Zap,
    description: 'Audits response times across critical user flows.',
  },
};

const AGENT_TYPE_ORDER = ['TEST_EXPLORER', 'BUG_HUNTER', 'REGRESSION_ANALYST', 'PERFORMANCE_AUDITOR'];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400' },
  RUNNING: { label: 'Running', className: 'bg-sky-500/15 text-sky-400' },
  FAILED: { label: 'Failed', className: 'bg-red-500/15 text-red-400' },
  PENDING: { label: 'Pending', className: 'bg-amber-500/15 text-amber-400' },
  PAUSED: { label: 'Paused', className: 'bg-amber-500/15 text-amber-400' },
  QUEUED: { label: 'Queued', className: 'bg-zinc-500/15 text-zinc-400' },
  CANCELLED: { label: 'Cancelled', className: 'bg-zinc-500/15 text-zinc-400' },
};

function AgentStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, className: 'bg-zinc-500/15 text-zinc-400' };
  return (
    <span
      className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('TEST_EXPLORER');
  const [selectedProject, setSelectedProject] = useState('');

  const { data: runList, isLoading } = useQuery({
    queryKey: ['agent-runs'],
    queryFn: () => agentsApi.runs({ pageSize: 100 }),
  });

  const { data: projectList } = useQuery({
    queryKey: ['projects', 'agent-trigger'],
    queryFn: () => projectsApi.list({ pageSize: 100 }),
  });

  const triggerMutation = useMutation({
    mutationFn: (data: { agentType: string; projectId: string }) => agentsApi.trigger(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
      toast.success('Agent run triggered');
      setShowTriggerModal(false);
      setSelectedProject('');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const cancelRunMutation = useMutation({
    mutationFn: (id: string) => agentsApi.cancelRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
      toast.success('Agent run cancelled');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const runs = runList?.items ?? [];
  const isCancelable = (run: AgentRun) => !['COMPLETED', 'FAILED', 'CANCELLED'].includes(run.status);

  const agentLabel = (agentId: string) => {
    const type = AGENT_TYPE_ORDER.find((t) => agentId.includes(t));
    return type ? AGENT_PROFILES[type].label : agentId;
  };

  const handleTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    triggerMutation.mutate({ agentType: selectedAgent, projectId: selectedProject });
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
            <h1 className="text-4xl font-bold mb-2 gradient-text">AI Agents</h1>
            <p className="text-muted-foreground">Trigger autonomous QA agents and monitor their runs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['agent-runs'] })}
              className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
            <button
              onClick={() => setShowTriggerModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Trigger Agent
            </button>
          </div>
        </div>

        {/* Agent Info Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {AGENT_TYPE_ORDER.map((type) => {
            const profile = AGENT_PROFILES[type];
            const Icon = profile.icon;
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-5 rounded-xl"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{profile.label}</h3>
                <p className="text-sm text-muted-foreground">{profile.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && <PageLoader label="Loading agent runs..." />}

        {/* Empty State */}
        {!isLoading && runs.length === 0 && (
          <EmptyState
            icon={Bot}
            title="No agent runs yet"
            description="Trigger an agent to start exploring your app, hunting bugs or auditing performance."
            action={
              <button
                onClick={() => setShowTriggerModal(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Trigger Agent
              </button>
            }
          />
        )}

        {/* Runs Table */}
        {!isLoading && runs.length > 0 && (
          <div className="glass rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      #{run.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">{agentLabel(run.agentId)}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {(run.projectId ?? '').slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <AgentStatusBadge status={run.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {run.completedAt ? new Date(run.completedAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      {isCancelable(run) && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel agent run #${run.id.slice(0, 8)}?`)) {
                              cancelRunMutation.mutate(run.id);
                            }
                          }}
                          disabled={cancelRunMutation.isPending}
                          className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg transition-colors flex items-center gap-2 text-red-500 disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Trigger Agent Modal */}
      {showTriggerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">Trigger Agent</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose an agent type and a target project</p>

            <form onSubmit={handleTrigger} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Agent Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AGENT_TYPE_ORDER.map((type) => {
                    const profile = AGENT_PROFILES[type];
                    const Icon = profile.icon;
                    const isSelected = selectedAgent === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedAgent(type)}
                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/50 hover:bg-secondary/80'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>
                          <span className="block text-sm font-semibold">{profile.label}</span>
                          <span className="block text-xs text-muted-foreground mt-1">{profile.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={triggerMutation.isPending}
                >
                  <option value="">Select a project</option>
                  {(projectList?.items ?? []).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTriggerModal(false)}
                  className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  disabled={triggerMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={triggerMutation.isPending || !selectedProject}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {triggerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Triggering...
                    </>
                  ) : (
                    'Trigger'
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