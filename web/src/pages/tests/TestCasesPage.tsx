import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testCasesApi, projectsApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import Layout from '../../components/Layout';
import {
  Plus,
  Loader2,
  Copy,
  Archive,
  Trash2,
  CircleDot,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Badge,
  PriorityBadge,
  EmptyState,
  PageLoader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui';
import type { TestCase, TestCaseType } from '../../types';

const TEST_TYPES: TestCaseType[] = ['FUNCTIONAL', 'HAPPY_PATH', 'NEGATIVE', 'EDGE_CASE', 'REGRESSION', 'SMOKE'];

const TYPE_LABELS: Record<string, string> = {
  FUNCTIONAL: 'Functional',
  HAPPY_PATH: 'Happy Path',
  NEGATIVE: 'Negative',
  EDGE_CASE: 'Edge Case',
  REGRESSION: 'Regression',
  SMOKE: 'Smoke',
};

const TYPE_COLORS: Record<string, string> = {
  FUNCTIONAL: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  HAPPY_PATH: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  NEGATIVE: 'text-red-400 bg-red-500/10 border-red-500/20',
  EDGE_CASE: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  REGRESSION: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  SMOKE: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

export default function TestCasesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newTestCase, setNewTestCase] = useState({
    title: '',
    description: '',
    type: 'FUNCTIONAL' as TestCaseType,
    priority: 'P2',
    projectId: '',
  });

  const { data: testCaseList, isLoading } = useQuery({
    queryKey: ['test-cases', selectedProjectId],
    queryFn: () =>
      testCasesApi.list({
        pageSize: 100,
        ...(selectedProjectId ? { projectId: selectedProjectId } : {}),
      }),
  });

  const { data: projectList } = useQuery({
    queryKey: ['projects', 'select'],
    queryFn: () => projectsApi.list({ pageSize: 100 }),
  });

  const createTestCaseMutation = useMutation({
    mutationFn: (data: { title: string; description: string; type: TestCaseType; priority: string; projectId: string }) =>
      testCasesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case created successfully! 🎉');
      setShowCreateModal(false);
      setNewTestCase({ title: '', description: '', type: 'FUNCTIONAL', priority: 'P2', projectId: '' });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const duplicateTestCaseMutation = useMutation({
    mutationFn: (id: string) => testCasesApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case duplicated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const archiveTestCaseMutation = useMutation({
    mutationFn: (id: string) => testCasesApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case archived');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteTestCaseMutation = useMutation({
    mutationFn: (id: string) => testCasesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleCreateTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    createTestCaseMutation.mutate(newTestCase);
  };

  const testCases = testCaseList?.items ?? [];

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
            <h1 className="text-4xl font-bold mb-2 gradient-text">Test Cases</h1>
            <p className="text-muted-foreground">Manage and organize your QA test cases</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Test Case
          </button>
        </div>

        {/* Project Filter */}
        <div className="mb-8 max-w-sm">
          <label className="block text-sm font-medium mb-2">Filter by Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Projects</option>
            {(projectList?.items ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && <PageLoader label="Loading test cases..." />}

        {/* Empty State */}
        {!isLoading && testCases.length === 0 && (
          <EmptyState
            icon={CircleDot}
            title="No test cases yet"
            description={
              selectedProjectId
                ? 'No test cases found for the selected project.'
                : 'Create your first test case to get started.'
            }
            action={
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                New Test Case
              </button>
            }
          />
        )}

        {/* Test Cases Table */}
        {!isLoading && testCases.length > 0 && (
          <div className="glass rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase: TestCase) => (
                  <TableRow key={testCase.id}>
                    <TableCell>
                      <p className="font-medium">{testCase.title}</p>
                      {testCase.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1 max-w-md">
                          {testCase.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[testCase.type] ?? 'text-muted-foreground bg-secondary border-border'}`}>
                        {TYPE_LABELS[testCase.type] ?? testCase.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={testCase.priority} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{testCase.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(testCase.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => duplicateTestCaseMutation.mutate(testCase.id)}
                          className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => archiveTestCaseMutation.mutate(testCase.id)}
                          className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete test case "${testCase.title}"?`)) {
                              deleteTestCaseMutation.mutate(testCase.id);
                            }
                          }}
                          className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg transition-colors text-red-500 flex items-center gap-1.5"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Create Test Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">Create New Test Case</h2>
            <p className="text-muted-foreground text-sm mb-6">Add a test case to your suite</p>

            <form onSubmit={handleCreateTestCase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={newTestCase.title}
                  onChange={(e) => setNewTestCase({ ...newTestCase, title: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Verify user can checkout"
                  required
                  disabled={createTestCaseMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTestCase.description}
                  onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Steps and expected behavior..."
                  rows={3}
                  disabled={createTestCaseMutation.isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newTestCase.type}
                    onChange={(e) => setNewTestCase({ ...newTestCase, type: e.target.value as TestCaseType })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={createTestCaseMutation.isPending}
                  >
                    {TEST_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTestCase.priority}
                    onChange={(e) => setNewTestCase({ ...newTestCase, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={createTestCaseMutation.isPending}
                  >
                    {['P0', 'P1', 'P2', 'P3'].map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project *</label>
                <select
                  value={newTestCase.projectId}
                  onChange={(e) => setNewTestCase({ ...newTestCase, projectId: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={createTestCaseMutation.isPending}
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
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  disabled={createTestCaseMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTestCaseMutation.isPending}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createTestCaseMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Test Case'
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