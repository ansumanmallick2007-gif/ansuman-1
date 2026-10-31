import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  Sparkles, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Tag, 
  Download,
  Copy,
  Check
} from 'lucide-react';
import api from '../services/api';
import DocumentUploadModal from '../components/DocumentUploadModal';
import { useAuth } from '../context/AuthContext';

export const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('extraction'); // 'extraction' | 'raw'
  const [copied, setCopied] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = selectedDept !== 'all' ? { department: selectedDept } : {};
      const res = await api.get('/documents', { params });
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error('[Fetch Documents Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedDept]);

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document from the enterprise repository?')) {
      return;
    }

    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.data.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        if (viewingDoc?.id === docId) {
          setViewingDoc(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete document.');
    }
  };

  const filteredDocs = documents.filter(d => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      d.title?.toLowerCase().includes(term) ||
      d.raw_content?.toLowerCase().includes(term) ||
      d.ai_summary?.toLowerCase().includes(term) ||
      d.file_type?.toLowerCase().includes(term)
    );
  });

  const departmentTabs = [
    { id: 'all', label: 'All Silos' },
    { id: 'finance', label: 'Finance' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'operations', label: 'Operations' },
    { id: 'hr', label: 'HR' },
    { id: 'product', label: 'Product' }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Document Knowledge Base
            </span>
            <span className="text-xs text-gray-400 font-mono">Gemini 2.5 Flash Ingestion</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Enterprise Document Intelligence Repository
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Multimodal extraction of key entities, executive summaries, sentiment metrics, and automated next steps.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition self-start md:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Ingest & Extract with Gemini</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Department Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800 overflow-x-auto w-full sm:w-auto">
          {departmentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDept(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedDept === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or entities..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-gray-900/50 border border-dashed border-gray-800 rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">No documents found matching this criteria.</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Upload a financial statement, HR policy, or technical spec to trigger Gemini structured extraction.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const entities = typeof doc.extracted_entities === 'string'
              ? JSON.parse(doc.extracted_entities || '{}')
              : doc.extracted_entities || {};

            const sentiment = entities.sentiment || 'Neutral';

            return (
              <div
                key={doc.id}
                onClick={() => setViewingDoc(doc)}
                className="group cursor-pointer bg-[#111827] border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 space-y-3 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {doc.file_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      sentiment === 'Positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : sentiment === 'Negative'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {sentiment}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {doc.ai_summary || doc.raw_content}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5 capitalize">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{doc.department}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-1 text-gray-500 hover:text-rose-400 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Detail Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                    {viewingDoc.department} Silo • {viewingDoc.file_type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {viewingDoc.id.slice(0, 8)}...
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{viewingDoc.title}</h2>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-gray-400 hover:text-white text-base px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-900 border border-gray-800">
                <button
                  onClick={() => setActiveTab('extraction')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'extraction'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Extraction</span>
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'raw'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Raw Ingested Text</span>
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(viewingDoc, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'JSON Copied' : 'Export JSON'}</span>
              </button>
            </div>

            {/* Modal Body */}
            {activeTab === 'extraction' ? (
              <div className="space-y-4">
                {/* Executive Summary */}
                <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                      Executive Synthesis
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Verified by Synapse Core
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    {viewingDoc.ai_summary}
                  </p>
                </div>

                {/* Extracted Entities */}
                {viewingDoc.extracted_entities && (
                  <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                      Extracted Structured Entities & Key Metrics
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Array.isArray(viewingDoc.extracted_entities?.keyEntities) ? (
                        viewingDoc.extracted_entities.keyEntities.map((ent, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs"
                          >
                            {ent}
                          </span>
                        ))
                      ) : (
                        <pre className="text-xs font-mono text-gray-300 p-2 bg-black/40 rounded w-full overflow-x-auto">
                          {JSON.stringify(viewingDoc.extracted_entities, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {viewingDoc.extracted_entities?.actionItems && (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
                      Recommended Strategic Next Steps
                    </span>
                    <ul className="text-xs text-gray-200 space-y-1.5 list-disc list-inside">
                      {viewingDoc.extracted_entities.actionItems.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/60 border border-gray-800 max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {viewingDoc.raw_content}
                </pre>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-400">
              <span>Ingested on {new Date(viewingDoc.created_at).toLocaleString()}</span>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          fetchDocuments();
        }}
      />
    </div>
  );
};

export default Documents;

