import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileCode,
  Tag,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const sampleDocuments = [
  {
    label: 'Financial Earnings Report',
    title: 'Q3 Enterprise Revenue & Operating Margin Breakdown',
    department: 'finance',
    fileType: 'Financial Report',
    content: `Executive Summary: Q3 consolidated revenue expanded 34% YoY to $58.2M. Net operating cash flow achieved $19.4M, driven by strong uptake in our Synapse Enterprise AI tier.
Cost of Goods Sold (COGS) decreased by 180 basis points due to automated Gemini inference routing and model distillation.
Key Initiatives:
1. Complete international tax audit across Dublin and Singapore entities before November 30.
2. Cap non-technical hiring at 4% for Q4 to preserve margin expansion.
3. Accelerate cloud reserve instance commitments to lock in a 22% compute discount.`
  },
  {
    label: 'Engineering Architecture Spec',
    title: 'High-Throughput Gemini Ingestion Mesh v2',
    department: 'engineering',
    fileType: 'Technical Spec',
    content: `Architecture Overview: Synapse Core requires real-time streaming ingestion capable of handling 50,000 document tokens per second with p99 latency under 250ms.
Specifications:
- Envoy-based gateway with mutual TLS and circuit-breaking.
- Regional Google GenAI SDK failover between us-central1 and europe-west4.
- Redis cluster for token usage caching and rate-limiting enforcement.
Security Mandate: All customer payloads must have PII redacted before sending to external model endpoints.`
  },
  {
    label: 'HR Remote Work Policy',
    title: '2026 Global Asynchronous Collaboration & Data Ethics Policy',
    department: 'hr',
    fileType: 'HR Policy',
    content: `Scope: Applies to all full-time employees, contractors, and executives operating in 18 countries.
Mandates:
1. Multi-factor authentication via FIDO2 hardware keys is mandatory by December 15.
2. AI-assisted code generation or internal document summarization must use approved enterprise gateways only.
3. Annual data privacy recertification course must be completed by November 20.`
  }
];

export const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('finance');
  const [fileType, setFileType] = useState('Financial Report');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const [extractionResult, setExtractionResult] = useState(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const loadSample = (sample) => {
    setTitle(sample.title);
    setDepartment(sample.department);
    setFileType(sample.fileType);
    setContent(sample.content);
    setFileName(`${sample.label.toLowerCase().replace(/\s+/g, '_')}.txt`);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both document title and content.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setExtractionResult(null);

    try {
      setProcessingStep('Sanitizing and chunking document...');
      await new Promise(r => setTimeout(r, 400));

      setProcessingStep('Invoking Gemini 2.5 Flash for multimodal entity extraction...');
      
      const response = await api.post('/documents', {
        title,
        department,
        fileType,
        content
      });

      if (response.data.success) {
        setProcessingStep('Extraction verified and indexed.');
        setExtractionResult(response.data.extraction);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.document);
        }
      }
    } catch (err) {
      console.error('[Upload Error]:', err);
      setError(err.response?.data?.error || 'Failed to analyze document with Gemini.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setFileName('');
    setExtractionResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Document Ingestion & Extraction</h3>
              <p className="text-xs text-gray-400">Powered by Google Gemini 2.5 Flash Structured Schema</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Prefill Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                Prefill Enterprise Samples
              </span>
              <span className="text-[11px] text-indigo-400">1-Click Test Data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleDocuments.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(s)}
                  className="px-3 py-2 text-left rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/40 hover:bg-indigo-950/20 text-xs transition"
                >
                  <p className="font-semibold text-white truncate">{s.label}</p>
                  <p className="text-[11px] text-gray-400 capitalize">{s.department} • {s.fileType}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Target Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500 capitalize"
                >
                  <option value="finance">Finance</option>
                  <option value="engineering">Engineering</option>
                  <option value="operations">Operations</option>
                  <option value="hr">Human Resources</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Document Type *
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Financial Report">Financial Report</option>
                  <option value="HR Policy">HR Policy</option>
                  <option value="Technical Spec">Technical Spec</option>
                  <option value="Project Roadmap">Project Roadmap</option>
                  <option value="Customer Feedback">Customer Feedback</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Upload File (TXT, CSV, PDF)
                </label>
                <label className="flex items-center justify-center px-3 py-2 rounded-xl bg-gray-900 border border-dashed border-gray-700 hover:border-indigo-500 cursor-pointer text-xs text-gray-300 transition">
                  <UploadCloud className="w-4 h-4 mr-2 text-indigo-400" />
                  <span className="truncate">{fileName || 'Choose file'}</span>
                  <input
                    type="file"
                    accept=".txt,.csv,.json,.pdf,.md"
                    onChange={handleFileDrop}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Financial Statement & EBITDA Reconciliation"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Raw Content / Document Text *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                placeholder="Paste the document text, financial report, policy or operational log here for AI analysis..."
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                required
              />
            </div>

            {/* Ingestion & AI Status */}
            {isSubmitting && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-300">Processing with Google Gemini 2.5 Flash</p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{processingStep}</p>
                </div>
              </div>
            )}

            {/* Live Extraction Preview */}
            {extractionResult && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Extraction Successful</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    extractionResult.sentiment === 'Positive'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : extractionResult.sentiment === 'Negative'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    Sentiment: {extractionResult.sentiment}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-gray-400 font-semibold mb-1">Executive Summary:</p>
                  <p className="text-xs text-gray-200 leading-relaxed bg-black/30 p-2.5 rounded-lg">
                    {extractionResult.summary}
                  </p>
                </div>

                {extractionResult.keyEntities && extractionResult.keyEntities.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold mb-1">Extracted Key Entities:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {extractionResult.keyEntities.map((ent, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-indigo-300 border border-gray-700">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {extractionResult.actionItems && extractionResult.actionItems.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold mb-1">Action Items Generated:</p>
                    <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                      {extractionResult.actionItems.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                {extractionResult ? 'Done' : 'Cancel'}
              </button>
              {!extractionResult ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? 'Analyzing with Gemini...' : 'Ingest & Process with AI'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  View in Repository
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;

