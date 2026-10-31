import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  Plus, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  UserPlus, 
  X,
  Loader2,
  Building2
} from 'lucide-react';
import api from '../services/api';
import WorkflowKanban from '../components/WorkflowKanban';
import { useAuth } from '../context/AuthContext';

export const Workflows = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'finance',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  });

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'all') params.department = selectedDept;
      if (selectedPriority !== 'all') params.priority = selectedPriority;
      const res = await api.get('/workflows', { params });
      if (res.data.success) {
        setWorkflows(res.data.workflows);
      }
    } catch (err) {
      console.error('[Fetch Workflows Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchUsers();
  }, [selectedDept, selectedPriority]);

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Initiative title is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedTo: formData.assignedTo || undefined
      };

      const res = await api.post('/workflows', payload);
      if (res.data.success) {
        setWorkflows(prev => [res.data.workflow, ...prev]);
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          department: 'finance',
          priority: 'medium',
          dueDate: '',
          assignedTo: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workflow initiative.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkflowUpdated = (updated) => {
    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const prefillInitiatives = [
    {
      title: 'Automate SOC2 Type II Continuous Evidence Collection',
      description: 'Implement automated log aggregation and cryptographic verification for cross-cloud telemetry to eliminate manual audit screenshots.',
      department: 'operations',
      priority: 'high'
    },
    {
      title: 'Reconcile Multi-Currency APAC Invoices with Gemini OCR',
      description: 'Streamline foreign exchange ledger variance checks across Tokyo and Sydney operations using structured JSON schema extraction.',
      department: 'finance',
      priority: 'critical'
    },
    {
      title: 'Deploy Zero-Trust Envoy Sidecars Across Kubernetes Clusters',
      description: 'Roll out automated mutual TLS rotation and circuit breakers targeting <15ms p99 latency for internal model inference calls.',
      department: 'engineering',
      priority: 'medium'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Cross-Departmental Orchestration
            </span>
            <span className="text-xs text-gray-400 font-mono">Automated Gemini Subtask Decomposition</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Enterprise Initiative & Task Board
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Align engineering, finance, HR, and operations with intelligent task delegation, hour estimates, and risk flags.
          </p>
        </div>

        {/* Create Workflow Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>New Initiative (AI Decompose)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-gray-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter Silo:</span>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="all">All Departments</option>
            <option value="finance">Finance</option>
            <option value="engineering">Engineering</option>
            <option value="operations">Operations</option>
            <option value="hr">Human Resources</option>
            <option value="product">Product</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Showing <span className="text-white font-bold">{workflows.length}</span> active initiatives
        </div>
      </div>

      {/* Interactive Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-96 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <WorkflowKanban
          workflows={workflows}
          onWorkflowUpdated={handleWorkflowUpdated}
          users={users}
        />
      )}

      {/* Create Initiative Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Enterprise Initiative</h3>
                  <p className="text-xs text-gray-400">Gemini automatically generates subtasks, hour estimates & risk flags</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Prefill Chips */}
            <div>
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                Quick-Prefill Initiative Template:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {prefillInitiatives.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      title: p.title,
                      description: p.description,
                      department: p.department,
                      priority: p.priority
                    }))}
                    className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/40 text-left text-xs transition"
                  >
                    <p className="font-bold text-white truncate">{p.title}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{p.department} • {p.priority}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Initiative Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Audit & Automate Cross-Border Tax Filings"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Scope & Context (Gemini uses this to generate subtasks)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Provide background context, required deliverables, and collaborating departments..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Lead Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs capitalize"
                  >
                    <option value="finance">Finance</option>
                    <option value="engineering">Engineering</option>
                    <option value="operations">Operations</option>
                    <option value="hr">Human Resources</option>
                    <option value="product">Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs capitalize"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Target Milestone Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Decomposing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create & Generate Subtasks</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;

