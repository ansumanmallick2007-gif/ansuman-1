import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Cpu, 
  Database,
  Building2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [health, setHealth] = useState({
    database: { isPostgresConnected: false, mode: 'Initializing...' },
    aiEngine: { status: 'Checking...' }
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/analytics/health');
        if (res.data) {
          setHealth(res.data);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const departmentColors = {
    finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hr: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    engineering: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    operations: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    product: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  };

  const roleBadgeColors = {
    admin: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    manager: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    employee: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <header className="h-16 bg-[#0E1322]/80 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-sans">
                SYNAPSE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise AI
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono -mt-0.5">Core v2.5 • Unified Ops</p>
          </div>
        </div>

        {/* Global Live Indicators */}
        <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-gray-800">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300 font-mono text-[11px]">Gemini 2.5 Flash</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs">
            <Database className="w-3 h-3 text-cyan-400" />
            <span className="text-gray-400 text-[11px]">
              {health.database?.isPostgresConnected ? 'PostgreSQL Live' : 'Enterprise Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3">
        {/* Department Badge */}
        {user?.department && (
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${departmentColors[user.department] || 'text-gray-400'}`}>
            <Building2 className="w-3.5 h-3.5" />
            <span>{user.department}</span>
          </div>
        )}

        {/* Role Badge */}
        {user?.role && (
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${roleBadgeColors[user.role]}`}>
            {user.role}
          </span>
        )}

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-800/60 transition border border-transparent hover:border-gray-700/60"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-white truncate max-w-[140px]">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl py-2 z-50 text-sm"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-gray-800">
                <p className="text-xs text-gray-400 font-mono">Signed in as</p>
                <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
                <p className="text-xs text-indigo-400 truncate font-mono">{user?.email}</p>
              </div>

              <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-white capitalize font-medium">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="text-white capitalize font-medium">{user?.department}</span>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition text-left text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

