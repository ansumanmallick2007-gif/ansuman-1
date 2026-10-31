import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  BookOpen, 
  CheckCircle, 
  Copy, 
  Check, 
  Loader2, 
  Trash2,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import api from '../services/api';

const suggestedPrompts = [
  "What are our top operational bottlenecks this quarter?",
  "Summarize our latest financial results & EBITDA margins",
  "Are there any compliance deadlines approaching in HR?",
  "What is our microservices mesh p99 latency target?",
  "Compare task completion velocity across Finance and Engineering"
];

export const CopilotChat = ({ departmentScope = 'all' }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "Greetings. I am Synapse Core, your enterprise intelligence copilot. I am grounded directly in your organization's ingested financial statements, engineering specs, HR policies, and active Kanban workflows. How may I assist executive decision-making today?",
      citations: [
        {
          sourceTitle: "Synapse Enterprise Grounding Engine",
          department: "all",
          relevance: "Real-time vector synchronization with PostgreSQL records"
        }
      ],
      actions: [
        "Audit Q3 EBITDA reconciliation",
        "Inspect high-priority engineering blockers",
        "Review upcoming compliance milestones"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText = input) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/copilot', {
        query: trimmed,
        departmentFilter: departmentScope
      });

      if (response.data.success) {
        const resData = response.data.response;
        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: resData.answer,
          citations: resData.groundingCitations || [],
          actions: resData.recommendedActions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('[Copilot Error]:', err);
      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered an issue querying the enterprise knowledge base. Please ensure backend services and Gemini API credentials are valid.",
        citations: [],
        actions: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset-1',
        sender: 'ai',
        text: "Conversation cleared. Ready for your next enterprise query.",
        citations: [],
        actions: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#0E1322] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Copilot Header */}
      <div className="px-6 py-4 bg-[#111827] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans">Synapse Core Enterprise Copilot</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RAG Active
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Context scope: <span className="text-indigo-400 capitalize">{departmentScope === 'all' ? 'All Departments' : departmentScope}</span></p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition text-xs flex items-center gap-1.5"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-[75%] space-y-3 ${msg.sender === 'user' ? 'items-end' : ''}`}>
              {/* Main Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-[#151C30] border border-gray-800 text-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/10">
                  <span className="font-mono">{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="hover:text-white transition flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Grounding Citations Card (if AI and has citations) */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Grounded Citations ({msg.citations.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{cite.sourceTitle}</span>
                          <span className="text-[10px] capitalize px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {cite.department}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 italic truncate">{cite.relevance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Next Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                    Suggested Executive Next Steps
                  </span>
                  <div className="space-y-1">
                    {msg.actions.map((act, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#151C30] border border-gray-800 flex items-center gap-3 text-xs text-gray-300">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Synthesizing enterprise documents & workflows via Gemini 2.5 Flash...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2.5 bg-[#0C101D] border-t border-gray-800 overflow-x-auto whitespace-nowrap space-x-2">
        <span className="text-[10px] font-mono text-gray-500 uppercase mr-1">Quick Inquiries:</span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="inline-block px-3 py-1 rounded-full bg-gray-900 border border-gray-800 hover:border-indigo-500 hover:bg-indigo-950/30 text-[11px] text-gray-300 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#111827] border-t border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about financial health, engineering spec targets, HR deadlines, or workflow bottlenecks..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Inquire</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CopilotChat;

