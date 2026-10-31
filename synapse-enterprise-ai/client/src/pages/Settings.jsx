import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Cpu, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  RefreshCw,
  Server
} from 'lucide-react';
import api from '../services/api';

export const Settings = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingStatus, setPingStatus] = useState('');

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/health');
      setHealth(res.data);
    } catch (err) {
      console.error('[Health Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handlePing = async () => {
    setPingStatus('Pinging Synapse Core API...');
    const start = Date.now();
    try {
      await api.get('/analytics/health');
      const duration = Date.now() - start;
      setPingStatus(`Healthy (Roundtrip Latency: ${duration}ms)`);
      setTimeout(() => setPingStatus(''), 4000);
    } catch (err) {
      setPingStatus('Ping failed: ' + err.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
            Platform Settings & System Telemetry
          </span>
          <span className="text-xs text-gray-400 font-mono">v1.0.0-production</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Enterprise Security & System Diagnostics
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Review cryptographic security configurations, active tenant boundaries, and Google Gemini API status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile & Organization */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{user?.name}</h3>
                <p className="text-xs text-indigo-400 font-mono">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-gray-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Assigned Role:</span>
                <span className="font-semibold text-white capitalize bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Department Silo:</span>
                <span className="font-semibold text-white capitalize bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {user?.department}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account ID:</span>
                <span className="font-mono text-gray-400 text-[10px]">
                  {user?.id ? user.id.slice(0, 14) + '...' : 'System'}
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Information Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Multi-Tenant Boundaries</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Row-Level Security (RLS) restricts Standard Employees to their department. Managers and Admins possess cross-silo delegation privileges.
            </p>
          </div>
        </div>

        {/* Right Column: AI Model, DB, & Security Engine Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tri-System Cloud Architecture: Client (Vercel), Server (Render), Backend (Supabase) */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tri-System Architecture Status</h3>
                  <p className="text-[11px] text-gray-400 font-mono">Client (Vercel) • Server (Render) • Backend (Supabase)</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Tri-System Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-bold font-mono text-[11px]">1. CLIENT SYSTEM</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black text-gray-300 font-mono">Vercel</span>
                </div>
                <p className="font-semibold text-white">React + Vite SPA</p>
                <p className="text-[11px] text-gray-400">Uses <code className="text-emerald-400 font-mono">VITE_SUPABASE_ANON_KEY</code></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-bold font-mono text-[11px]">2. SERVER SYSTEM</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black text-cyan-400 font-mono">Render</span>
                </div>
                <p className="font-semibold text-white">Express + Gemini AI</p>
                <p className="text-[11px] text-gray-400">Orchestrates RAG, JWT & RBAC</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-bold font-mono text-[11px]">3. BACKEND SYSTEM</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black text-emerald-400 font-mono">Supabase</span>
                </div>
                <p className="font-semibold text-white">PostgreSQL & Auth</p>
                <p className="text-[11px] text-gray-400">Uses <code className="text-indigo-400 font-mono">SERVICE_ROLE_KEY</code></p>
              </div>
            </div>
          </div>

          {/* AI Engine Telemetry Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Gemini Inference Engine</h3>
                  <p className="text-[11px] text-gray-400 font-mono">@google/genai SDK Integration</p>
                </div>
              </div>

              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                health?.aiEngine?.configured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {health?.aiEngine?.configured ? 'Direct Live SDK' : 'Heuristic Simulation Fallback'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                <span className="text-gray-400 text-[11px]">Active Production Model</span>
                <p className="font-mono text-white font-bold">gemini-2.5-flash</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                <span className="text-gray-400 text-[11px]">Structured Schemas Registered</span>
                <p className="font-mono text-white font-bold">Document + Workflow + Copilot</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 p-3 rounded-2xl bg-black/40 border border-gray-800 space-y-1">
              <div className="flex items-center justify-between">
                <span>GEMINI_API_KEY Configured:</span>
                <span className={health?.aiEngine?.configured ? 'text-emerald-400 font-mono font-bold' : 'text-amber-400 font-mono'}>
                  {health?.aiEngine?.configured ? 'TRUE (Verified)' : 'UNSET (Local Fallback Active)'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                To connect your live Gemini API key, supply <code className="text-indigo-400">GEMINI_API_KEY</code> in <code className="text-gray-300">backend/.env</code>.
              </p>
            </div>
          </div>

          {/* Database & Infrastructure Diagnostics */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Database & Persistence Layer</h3>
                  <p className="text-[11px] text-gray-400 font-mono">PostgreSQL / Resilient Connection Pool</p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {health?.database?.mode || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 text-center">
                <span className="text-gray-500 text-[10px] uppercase">Users</span>
                <p className="text-base font-bold text-white mt-1">{health?.database?.recordCounts?.users || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 text-center">
                <span className="text-gray-500 text-[10px] uppercase">Documents</span>
                <p className="text-base font-bold text-white mt-1">{health?.database?.recordCounts?.documents || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 text-center">
                <span className="text-gray-500 text-[10px] uppercase">Workflows</span>
                <p className="text-base font-bold text-white mt-1">{health?.database?.recordCounts?.workflows || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 text-center">
                <span className="text-gray-500 text-[10px] uppercase">Audit Logs</span>
                <p className="text-base font-bold text-white mt-1">{health?.database?.recordCounts?.audit_logs || 0}</p>
              </div>
            </div>

            {/* Security Cryptography Overview */}
            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2 text-xs">
              <span className="text-gray-400 uppercase font-mono font-bold text-[11px]">
                Cryptographic & Security Controls
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bcrypt (12 Salt Rounds)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>JWT Expiration (24h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rate Limiting (Zod Guard)</span>
                </div>
              </div>
            </div>

            {/* Health Ping Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-indigo-400 font-mono">{pingStatus}</span>
              <button
                onClick={handlePing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ping System Core</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

