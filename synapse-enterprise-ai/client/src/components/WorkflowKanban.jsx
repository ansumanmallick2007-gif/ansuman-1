import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Calendar,
  Building2,
  ChevronDown,
  Layers
} from 'lucide-react';
import api from '../services/api';

const columns = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-700/60' },
  { id: 'in_progress', label: 'In Progress', color: 'border-indigo-500/50' },
  { id: 'review', label: 'Review & Audit', color: 'border-amber-500/50' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500/50' }
];

const priorityColors = {
  critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  low: 'bg-gray-500/15 text-gray-400 border-gray-500/30'
};

const departmentColors = {
  finance: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  engineering: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  operations: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  hr: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  product: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
};

export const WorkflowKanban = ({ workflows, onWorkflowUpdated, users = [] }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [movingId, setMovingId] = useState(null);

  const moveStatus = async (workflow, targetStatus) => {
    try {
      setMovingId(workflow.id);
      const res = await api.patch(`/workflows/${workflow.id}`, { status: targetStatus });
      if (res.data.success && onWorkflowUpdated) {
        onWorkflowUpdated(res.data.workflow);
      }
    } catch (err) {
      console.error('[Kanban Move Error]:', err);
    } finally {
      setMovingId(null);
    }
  };

  const getNextStatus = (current) => {
    const idx = columns.findIndex(c => c.id === current);
    return idx < columns.length - 1 ? columns[idx + 1].id : null;
  };

  const getPrevStatus = (current) => {
    const idx = columns.findIndex(c => c.id === current);
    return idx > 0 ? columns[idx - 1].id : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(col => {
        const colWorkflows = workflows.filter(w => w.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col bg-[#0F1423] rounded-2xl border ${col.color} p-3.5 min-h-[580px] shadow-lg`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                  {colWorkflows.length}
                </span>
              </div>
            </div>

            {/* Workflow Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {colWorkflows.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center border border-dashed border-gray-800/80 rounded-xl text-center p-4">
                  <p className="text-xs text-gray-500">No initiatives</p>
                </div>
              ) : (
                colWorkflows.map(wf => {
                  const ai = wf.ai_suggestions || {};
                  const subtasks = ai.recommendedSubtasks || [];

                  return (
                    <div
                      key={wf.id}
                      className="group bg-[#13192B] border border-gray-800 hover:border-indigo-500/40 rounded-xl p-3.5 space-y-3 shadow transition-all duration-200"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${priorityColors[wf.priority] || priorityColors.medium}`}>
                          {wf.priority}
                        </span>

                        <span className={`px-2 py-0.5 rounded font-medium border capitalize ${departmentColors[wf.department] || 'text-gray-400'}`}>
                          {wf.department}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                          {wf.title}
                        </h4>
                        {wf.description && (
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                            {wf.description}
                          </p>
                        )}
                      </div>

                      {/* AI Suggestions Pill */}
                      {subtasks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedWorkflow(wf)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition text-left"
                        >
                          <div className="flex items-center gap-1.5 text-indigo-300 text-[11px] font-semibold">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>AI Subtasks ({subtasks.length})</span>
                          </div>
                          <span className="text-[10px] text-indigo-400">View &rarr;</span>
                        </button>
                      )}

                      {/* Risk Flag if present */}
                      {ai.riskAssessment && (
                        <div className="flex items-start gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                          <p className="line-clamp-2">{ai.riskAssessment}</p>
                        </div>
                      )}

                      {/* Metadata Footer */}
                      <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                        {wf.due_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>{new Date(wf.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600">Open-ended</span>
                        )}

                        {/* Move Actions */}
                        <div className="flex items-center gap-1">
                          {getPrevStatus(col.id) && (
                            <button
                              onClick={() => moveStatus(wf, getPrevStatus(col.id))}
                              disabled={movingId === wf.id}
                              title={`Move to ${getPrevStatus(col.id)}`}
                              className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {getNextStatus(col.id) && (
                            <button
                              onClick={() => moveStatus(wf, getNextStatus(col.id))}
                              disabled={movingId === wf.id}
                              title={`Move to ${getNextStatus(col.id)}`}
                              className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* AI Subtasks Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                  Gemini Subtask Decomposition
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedWorkflow.title}</h3>
                <p className="text-xs text-gray-400 capitalize">Department: {selectedWorkflow.department}</p>
              </div>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {selectedWorkflow.ai_suggestions?.riskAssessment && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Cross-Departmental Risk Analysis</span>
                </div>
                <p className="text-xs text-amber-200 leading-relaxed">
                  {selectedWorkflow.ai_suggestions.riskAssessment}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 font-mono">
                Recommended Subtasks & Estimated Hours
              </p>
              <div className="space-y-2">
                {selectedWorkflow.ai_suggestions?.recommendedSubtasks?.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 pr-2">
                      <p className="font-semibold text-white">{st.title}</p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        Routed to: <span className="text-indigo-400 font-medium">{st.suggestedDepartment}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{st.estimatedHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowKanban;

