import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Lock, 
  Mail, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

export const Login = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@synapse.ai');
  const [password, setPassword] = useState('Synapse2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(roleKey);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with demo role: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const demoPersonas = [
    { key: 'admin', role: 'Executive Admin', name: 'Sarah Connor', email: 'admin@synapse.ai', badge: 'admin', color: 'border-rose-500/40 hover:bg-rose-950/20 text-rose-400' },
    { key: 'finance', role: 'Finance Lead', name: 'Marcus Vance', email: 'finance.lead@synapse.ai', badge: 'manager', color: 'border-emerald-500/40 hover:bg-emerald-950/20 text-emerald-400' },
    { key: 'engineering', role: 'VP Engineering', name: 'Elena Rostova', email: 'eng.lead@synapse.ai', badge: 'manager', color: 'border-cyan-500/40 hover:bg-cyan-950/20 text-cyan-400' },
    { key: 'employee', role: 'Staff Engineer', name: 'Alex Rivera', email: 'employee@synapse.ai', badge: 'employee', color: 'border-blue-500/40 hover:bg-blue-950/20 text-blue-400' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/30 mb-2">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            SYNAPSE ENTERPRISE AI
          </h1>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Cross-departmental intelligence, document synthesis, and automated task delegation powered by Google Gemini.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-7 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@synapse.ai"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Synapse'}</span>
            </button>
          </form>

          {/* Quick Demo Personas 1-Click */}
          <div className="pt-4 border-t border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                Instant Demo Role Access
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">Auto-Filled</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoPersonas.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleDemoLogin(p.key)}
                  disabled={loading}
                  className={`p-2.5 rounded-xl bg-gray-900 border text-left transition ${p.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold">{p.badge}</span>
                    <UserCheck className="w-3 h-3 opacity-70" />
                  </div>
                  <p className="text-xs font-bold text-white mt-1 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{p.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400">
          New enterprise user?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Onboard new account &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

