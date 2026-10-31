import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Database, 
  CheckCircle,
  Building2,
  FileText,
  Kanban
} from 'lucide-react';
import CopilotChat from '../components/CopilotChat';
import api from '../services/api';

export const Copilot = () => {
  const [departmentScope, setDepartmentScope] = useState('all');
  const [contextStats, setContextStats] = useState({
    documents: 0,
    workflows: 0,
    health: 'Online'
  });

  useEffect(() => {
    const fetchContextStats = async () => {
      try {
        const res = await api.get('/analytics/summary');
        if (res.data?.success) {
          setContextStats({
            documents: res.data.kpis?.totalDocuments || 0,
            workflows: res.data.kpis?.totalWorkflows || 0,
            health: 'Grounded & Synchronized'
          });
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchContextStats();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Conversational Executive Copilot
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Retrieval-Augmented Generation (RAG)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Natural Language Enterprise Intelligence
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time querying across financial reports, HR policies, technical specs, and active Kanban bottlenecks.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2 bg-[#111827] border border-gray-800 p-1.5 rounded-2xl">
          <span className="text-xs text-gray-400 pl-2">Grounding Scope:</span>
          <select
            value={departmentScope}
            onChange={(e) => setDepartmentScope(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="all">Enterprise-Wide (All Silos)</option>
            <option value="finance">Finance Only</option>
            <option value="engineering">Engineering Only</option>
            <option value="operations">Operations Only</option>
            <option value="hr">Human Resources Only</option>
            <option value="product">Product Only</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Knowledge Sidebar + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Grounding Knowledge State */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Grounded Knowledge</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-gray-300">Indexed Docs</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{contextStats.documents}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Kanban className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-300">Tracked Tasks</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{contextStats.workflows}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-300">Grounding Mesh</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Synchronized</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 leading-relaxed">
              <p>
                Synapse Core answers queries by retrieving relevant semantic chunks from PostgreSQL and passing verified grounding context to <strong className="text-indigo-400">Gemini 2.5 Flash</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span>Zero-Hallucination Policy</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Every metric, latency target, and compliance date is strictly cited from verified internal documents and database states.
            </p>
          </div>
        </div>

        {/* Right Side: Copilot Interactive Chat */}
        <div className="lg:col-span-3">
          <CopilotChat departmentScope={departmentScope} />
        </div>
      </div>
    </div>
  );
};

export default Copilot;

