import React, { useState, useRef, useEffect } from 'react';
import { useReader } from '../context/ReaderContext';
import { X, Send, Sparkles, RotateCcw, Calendar, Check, BookOpen, Loader2 } from 'lucide-react';
import { ChatMessage, ReadingPlan } from '../types/reader';

export const ChatSheet: React.FC = () => {
  const {
    activeSheet,
    setActiveSheet,
    chatMessages,
    addChatMessage,
    clearChat,
    addPlan,
    plans
  } = useReader();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedPlanIds, setSavedPlanIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (activeSheet === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSheet, loading]);

  // Focus input when opened
  useEffect(() => {
    if (activeSheet === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activeSheet]);

  if (activeSheet !== 'chat') return null;

  // Helper to extract JSON reading plan from model response
  const extractPlanFromText = (text: string): ReadingPlan | null => {
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (!match) return null;
      const parsed = JSON.parse(match[1]);
      if (parsed.title && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return {
          id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: parsed.title,
          description: parsed.description || '',
          durationDays: parsed.durationDays || parsed.days.length,
          createdAt: Date.now(),
          days: parsed.days.map((d: any, idx: number) => ({
            day: d.day || idx + 1,
            title: d.title || `Day ${idx + 1}`,
            focus: d.focus || '',
            readings: Array.isArray(d.readings)
              ? d.readings.map((r: any) => ({
                  book: (r.book || 'john').toLowerCase(),
                  chapter: Number(r.chapter) || 1,
                  display: r.display || `${r.book} ${r.chapter}`
                }))
              : [],
            completed: false
          }))
        };
      }
    } catch (e) {
      // not a valid JSON plan block
    }
    return null;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');

    // Add user message to conversation history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now()
    };
    addChatMessage(userMsg);
    setLoading(true);

    try {
      // Send conversation history
      const historyPayload = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      let modelText = '';
      const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

      if (clientApiKey) {
        // Direct call to Gemini REST API when compiled with client key (e.g. in mobile APK)
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${clientApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [
                  {
                    text:
                      'You are Lucent Guide, a contemplative, scholarly biblical guide and reading curriculum architect inside the Lucent Bible Reader app. You help users understand scriptures, thematic connections, historical context, and create personalized reading plans.'
                  }
                ]
              },
              contents: historyPayload.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.text }]
              }))
            })
          }
        );

        if (!geminiRes.ok) {
          const errData = await geminiRes.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini API returned ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // Route to local server endpoint
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyPayload })
        });

        const contentType = res.headers.get('content-type') || '';
        const rawBody = await res.text();

        // Detect if the server returned HTML (e.g., local 404/SPA index.html on mobile localhost or auth redirect)
        if (!contentType.includes('application/json') || rawBody.trim().startsWith('<')) {
          throw new Error(
            'Standalone Android APK requires GEMINI_API_KEY set in your GitHub repository Secrets so the GitHub build can connect directly to Gemini.'
          );
        }

        let data: any = {};
        try {
          data = JSON.parse(rawBody);
        } catch {
          throw new Error('Invalid response from server.');
        }

        if (!res.ok) {
          throw new Error(data.error || `Server responded with ${res.status}`);
        }

        modelText = data.text || '';
      }

      // Check for structured plan proposal in response
      const plan = extractPlanFromText(modelText);

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: modelText,
        timestamp: Date.now(),
        planProposal: plan || undefined
      };

      addChatMessage(modelMsg);
    } catch (err: any) {
      console.error('Chat error:', err);
      addChatMessage({
        id: `err-${Date.now()}`,
        role: 'model',
        text: `I encountered an issue connecting to Gemini: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = (plan: ReadingPlan) => {
    addPlan(plan);
    setSavedPlanIds(prev => new Set(prev).add(plan.id));
  };

  const promptSuggestions = [
    "Create a 30-day plan for Jeremiah linked to Revelation",
    "14-day Gospel of John & Psalms journey",
    "7-day deep dive into Wisdom in Proverbs",
    "Why does Jeremiah call God the 'fountain of living waters'?"
  ];

  return (
    <div className="sheet-backdrop" onClick={() => setActiveSheet(null)}>
      <div className="sheet-card chat-sheet-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} />
            <div>
              <div className="sheet-title">Lucent Guide</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                Powered by Gemini 3.8 Flash
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="sheet-close-btn"
              onClick={clearChat}
              title="Clear conversation"
              style={{ fontSize: '0.8rem', padding: '4px' }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="sheet-close-btn"
              onClick={() => setActiveSheet(null)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="sheet-body chat-thread-body">
          {/* Prompt Suggestions */}
          <div className="chat-suggestions-container">
            <div className="chat-suggestions-label">Suggested Inquiries & Plans:</div>
            <div className="chat-suggestions-scroll">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={`sug-${idx}`}
                  className="chat-suggestion-chip"
                  onClick={() => handleSend(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages-list">
            {chatMessages.map(msg => {
              const isUser = msg.role === 'user';
              // Check if model message has an embedded or parsed plan
              const plan = msg.planProposal || extractPlanFromText(msg.text);
              const isPlanSaved = plan && (savedPlanIds.has(plan.id) || plans.some(p => p.title === plan.title));

              // Clean text without raw JSON block if plan card is rendered
              const displayText = plan
                ? msg.text.replace(/```(?:json)?\s*[\s\S]*?\s*```/, '').trim()
                : msg.text;

              return (
                <div
                  key={msg.id}
                  className={`chat-bubble-wrap ${isUser ? 'user-wrap' : 'model-wrap'}`}
                >
                  <div className={`chat-bubble ${isUser ? 'user-bubble' : 'model-bubble'}`}>
                    <div className="chat-bubble-text">{displayText}</div>

                    {/* Interactive Plan Proposal Card */}
                    {plan && (
                      <div className="chat-plan-card">
                        <div className="chat-plan-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} />
                            <span className="chat-plan-card-title">{plan.title}</span>
                          </div>
                          <span className="chat-plan-card-duration">
                            {plan.durationDays} Days
                          </span>
                        </div>

                        {plan.description && (
                          <div className="chat-plan-card-desc">{plan.description}</div>
                        )}

                        <div className="chat-plan-card-preview">
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.7, marginBottom: '4px' }}>
                            Schedule Preview ({plan.days.length} entries):
                          </div>
                          {plan.days.slice(0, 3).map(d => (
                            <div key={`prev-${d.day}`} className="chat-plan-preview-day">
                              <span style={{ fontWeight: 600, minWidth: '46px' }}>Day {d.day}:</span>
                              <span>{d.title}</span>
                              <span style={{ opacity: 0.6, fontSize: '0.68rem', marginLeft: 'auto' }}>
                                {d.readings.map(r => r.display).join(' & ')}
                              </span>
                            </div>
                          ))}
                          {plan.days.length > 3 && (
                            <div style={{ fontSize: '0.68rem', opacity: 0.6, fontStyle: 'italic', marginTop: '2px' }}>
                              + {plan.days.length - 3} more days...
                            </div>
                          )}
                        </div>

                        {/* 1-Tap Save Plan Button */}
                        <div className="chat-plan-card-actions">
                          {isPlanSaved ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                              <button
                                className="chat-plan-saved-badge"
                                disabled
                              >
                                <Check size={14} strokeWidth={3} />
                                <span>Saved to Plans</span>
                              </button>
                              <button
                                className="chat-plan-view-btn"
                                onClick={() => setActiveSheet('plans')}
                              >
                                <span>View in Plans</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="chat-plan-save-btn"
                              onClick={() => handleSavePlan(plan)}
                            >
                              <Calendar size={14} />
                              <span>Add to My Reading Plans</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-bubble-wrap model-wrap">
                <div className="chat-bubble model-bubble chat-loading-bubble">
                  <Loader2 size={16} className="spin-icon" />
                  <span>Lectio Guide is formulating your personalized plan...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Footer */}
        <div className="chat-input-footer">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question or request a reading plan..."
              className="chat-text-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="chat-send-btn"
              title="Send to Gemini"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
