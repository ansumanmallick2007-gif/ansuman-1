import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Kanban, 
  Bot, 
  BarChart3, 
  Settings, 
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Executive Cockpit', icon: LayoutDashboard },
    { to: '/documents', label: 'Document Intelligence', icon: FileText, badge: 'Gemini' },
    { to: '/workflows', label: 'Cross-Dept Workflows', icon: Kanban },
    { to: '/copilot', label: 'Enterprise Copilot', icon: Bot, highlight: true },
    { to: '/reports', label: 'Briefings & Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings & Telemetry', icon: Settings }
  ];

  const departmentPills = [
    { name: 'Finance', color: 'bg-emerald-500' },
    { name: 'Engineering', color: 'bg-cyan-500' },
    { name: 'Operations', color: 'bg-purple-500' },
    { name: 'Human Resources', color: 'bg-amber-500' },
    { name: 'Product', color: 'bg-pink-500' },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-gray-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Group */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 font-mono">
            Platform Capabilities
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                    } ${item.highlight && !item.active ? 'border border-indigo-500/20' : ''}`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Connected Departments */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 font-mono">
            Active Silos Unified
          </p>
          <div className="space-y-1 px-2">
            {departmentPills.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-900/50"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${d.color}`} />
                  <span className="text-[11px]">{d.name}</span>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">Connected</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tenant Information Card */}
      <div className="p-4 border-t border-gray-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-900 to-indigo-950/40 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Tenant Scope
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Enterprise
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Multi-department data isolation and cryptographic audit trails active.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

