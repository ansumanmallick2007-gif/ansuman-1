import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import api from '../services/api';
import AuditLogTable from '../components/AuditLogTable';

export const Reports = () => {
  const [briefing, setBriefing] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDate, setGeneratedDate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleGenerateBriefing = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/reports/generate');
      if (res.data.success) {
        setBriefing(res.data.briefing);
        setGeneratedDate(res.data.generatedAt);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate briefing.');
    } finally {
      setGenerating(false);
    }
  };

  const copyBriefing = () => {
    navigator.clipboard.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printBriefing = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Synapse Enterprise AI - Executive Briefing</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; color: #3730a3; }
            pre { background: #f4f4f5; padding: 12px; border-radius: 8px; font-family: monospace; }
            ul { margin-bottom: 16px; }
            li { margin-bottom: 6px; }
            .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <h1>Synapse Enterprise AI — Executive Operational Briefing</h1>
          <div class="meta">Generated: ${new Date(generatedDate || Date.now()).toLocaleString()} | Model: Google Gemini 2.5 Flash</div>
          <div>${briefing.replace(/\n/g, '<br/>')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportCSV = async (type) => {
    try {
      setExportLoading(true);
      let res;
      let filename = '';
      let csvContent = '';

      if (type === 'documents') {
        res = await api.get('/documents');
        filename = `synapse_documents_${Date.now()}.csv`;
        const headers = ['ID', 'Title', 'Department', 'FileType', 'Summary', 'CreatedAt'];
        const rows = res.data.documents.map(d => [
          d.id,
          `"${(d.title || '').replace(/"/g, '""')}"`,
          d.department,
          d.file_type,
          `"${(d.ai_summary || '').replace(/"/g, '""')}"`,
          d.created_at
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      } else {
        res = await api.get('/workflows');
        filename = `synapse_workflows_${Date.now()}.csv`;
        const headers = ['ID', 'Title', 'Department', 'Status', 'Priority', 'DueDate', 'CreatedAt'];
        const rows = res.data.workflows.map(w => [
          w.id,
          `"${(w.title || '').replace(/"/g, '""')}"`,
          w.department,
          w.status,
          w.priority,
          w.due_date || '',
          w.created_at
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Executive Briefings & Audit Reporting
            </span>
            <span className="text-xs text-gray-400 font-mono">Automated Synthesis</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Enterprise Reporting & Verifiable Audit Trails
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Synthesize organizational milestones into PDF executive briefings and export operational records to CSV.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportCSV('documents')}
            disabled={exportLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 text-white text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Docs (CSV)</span>
          </button>

          <button
            onClick={() => exportCSV('workflows')}
            disabled={exportLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 text-white text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Tasks (CSV)</span>
          </button>
        </div>
      </div>

      {/* Automated Executive Briefing Section */}
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Automated Weekly Executive Briefing Generator
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Gemini synthesizes all document disclosures, completion metrics, and risk flags into a cohesive leadership summary.
            </p>
          </div>

          <button
            onClick={handleGenerateBriefing}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 self-start sm:self-auto"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Enterprise Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate New Executive Briefing</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Briefing Display */}
        {briefing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Generated at: <strong className="text-white font-mono">{new Date(generatedDate).toLocaleString()}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyBriefing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={printBriefing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-gray-800 text-xs text-gray-200 leading-relaxed font-sans space-y-4 whitespace-pre-wrap">
              {briefing}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-900/50 border border-dashed border-gray-800 rounded-2xl space-y-2">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto opacity-70" />
            <p className="text-sm font-semibold text-white">No executive briefing generated yet for this period.</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Click the button above to have Google Gemini 2.5 Flash analyze current documents, tasks, and sentiment.
            </p>
          </div>
        )}
      </div>

      {/* Audit Log Table Section */}
      <AuditLogTable />
    </div>
  );
};

export default Reports;

