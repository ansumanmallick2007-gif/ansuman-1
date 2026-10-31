import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Kanban, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  UploadCloud, 
  Plus, 
  Building2, 
  ArrowUpRight,
  Zap,
  Activity
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DocumentUploadModal from '../components/DocumentUploadModal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/summary');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[Dashboard Summary Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-900 rounded-2xl border border-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const deptMetrics = data?.departmentMetrics || [];
  const urgentWorkflows = data?.urgentWorkflows || [];
  const recentDocs = data?.recentDocuments || [];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Unified Executive Cockpit
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Cross-Departmental Intelligence Overview
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Synthesizing silos across Finance, Engineering, Operations, HR, and Product via Google Gemini 2.5 Flash.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest Document</span>
          </button>

          <button
            onClick={() => navigate('/workflows')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Initiative</span>
          </button>

          <button
            onClick={() => navigate('/copilot')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Launch Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingested Documents"
          value={kpis.totalDocuments || 0}
          change={14}
          isPositive={true}
          icon={FileText}
          color="indigo"
          badge="Multimodal"
        />
        <StatCard
          title="Active Workflows"
          value={kpis.totalWorkflows || 0}
          subtitle={`${kpis.inProgressWorkflows || 0} In Progress • ${kpis.reviewWorkflows || 0} In Review`}
          icon={Kanban}
          color="cyan"
          badge="Kanban"
        />
        <StatCard
          title="Workflow Completion"
          value={`${kpis.completionRate || 0}%`}
          change={8}
          isPositive={true}
          icon={CheckCircle2}
          color="emerald"
          badge="Velocity"
        />
        <StatCard
          title="Admin Hours Saved"
          value={`~${kpis.automationSavingsHours || 42} hrs`}
          subtitle="Via automated AI subtask delegation"
          icon={Zap}
          color="amber"
          badge="ROI"
        />
      </div>

      {/* Cross-Department Health & Sentiment Grid */}
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Departmental Silo Synchronization & Sentiment
            </h3>
            <p className="text-xs text-gray-400">
              Aggregated KPI velocity and tone extraction across active organizational branches.
            </p>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
          >
            Full Briefing &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {deptMetrics.map((dept) => {
            const pos = dept.sentiment?.positive || 0;
            const neg = dept.sentiment?.negative || 0;
            const neu = dept.sentiment?.neutral || 0;
            const totalSentiment = pos + neg + neu;
            const dominantSentiment = neg > 0 ? 'Negative Flag' : pos > 0 ? 'Positive Growth' : 'Stable';

            return (
              <div
                key={dept.department}
                className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 space-y-3 hover:border-indigo-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white capitalize">{dept.department}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    dominantSentiment === 'Negative Flag'
                      ? 'bg-rose-500/20 text-rose-300'
                      : dominantSentiment === 'Positive Growth'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-gray-800 text-gray-300'
                  }`}>
                    {dominantSentiment}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-gray-400">
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="text-white font-mono">{dept.documentsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tasks:</span>
                    <span className="text-white font-mono">{dept.workflowsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-emerald-400 font-mono">{dept.completedCount}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${dept.completionRate || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Urgent Risk Flags & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Workflow Blockers */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Critical & High Priority Bottlenecks
              </h3>
            </div>
            <button
              onClick={() => navigate('/workflows')}
              className="text-xs text-indigo-400 hover:underline"
            >
              Open Kanban &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {urgentWorkflows.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No high-risk bottlenecks identified.</p>
            ) : (
              urgentWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {wf.priority}
                    </span>
                    <span className="capitalize text-gray-400 text-[11px]">{wf.department}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{wf.title}</h4>
                  {wf.ai_suggestions?.riskAssessment && (
                    <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg leading-relaxed">
                      ⚠️ {wf.ai_suggestions.riskAssessment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent AI Ingested Documents */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Recent Gemini Document Extractions
              </h3>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-indigo-400 hover:underline"
            >
              All Documents &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentDocs.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No documents uploaded yet.</p>
            ) : (
              recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/40 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-indigo-400 font-medium capitalize bg-indigo-500/10 px-2 py-0.5 rounded">
                      {doc.department} • {doc.file_type}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {doc.ai_summary}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default Dashboard;

