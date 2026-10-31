import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Clock, 
  User, 
  Terminal 
} from 'lucide-react';
import api from '../services/api';

const actionBadges = {
  USER_LOGIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  USER_REGISTER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  INGEST_DOCUMENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  CREATE_WORKFLOW: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UPDATE_WORKFLOW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELETE_WORKFLOW: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  DELETE_DOCUMENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  COPILOT_QUERY: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  INIT_SYSTEM: 'bg-gray-500/10 text-gray-300 border-gray-500/20'
};

export const AuditLogTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterAction !== 'all') {
        params.action = filterAction;
      }
      const res = await api.get('/analytics/audit-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('[Audit Logs Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction]);

  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(term) ||
      l.user_name?.toLowerCase().includes(term) ||
      l.user_email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Cryptographic Enterprise Audit Logs
          </h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user or event..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="INGEST_DOCUMENT">INGEST_DOCUMENT</option>
            <option value="CREATE_WORKFLOW">CREATE_WORKFLOW</option>
            <option value="UPDATE_WORKFLOW">UPDATE_WORKFLOW</option>
            <option value="COPILOT_QUERY">COPILOT_QUERY</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Action Event</th>
              <th className="py-2.5 px-3">Operator</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Loading verified audit trail...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No audit log entries matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 px-3 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${actionBadges[log.action] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white truncate">{log.user_name || 'System Actor'}</span>
                      <span className="text-[10px] text-gray-400 font-mono truncate">{log.user_email || 'internal@synapse.ai'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize text-gray-300 text-[11px]">
                      {log.user_department || 'Operations'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-indigo-500 text-indigo-400 hover:text-white transition text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs text-gray-400">
        <span>Page {page} of {totalPages}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail JSON Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white font-mono">{selectedLog.action} Record</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1 text-gray-400">
              <p>Log UUID: <span className="font-mono text-gray-200">{selectedLog.id}</span></p>
              <p>Timestamp: <span className="font-mono text-gray-200">{new Date(selectedLog.created_at).toISOString()}</span></p>
            </div>

            <div>
              <p className="text-[11px] font-mono text-gray-400 uppercase mb-1">Payload Metadata:</p>
              <pre className="p-3 rounded-xl bg-black/60 border border-gray-800 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;

