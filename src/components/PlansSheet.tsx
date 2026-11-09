import React, { useState } from 'react';
import { useReader } from '../context/ReaderContext';
import { useNavigate } from 'react-router-dom';
import { X, Check, Sparkles, Trash2, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { ReadingPlan, PlanDay } from '../types/reader';

export const PlansSheet: React.FC = () => {
  const {
    activeSheet,
    setActiveSheet,
    plans,
    activePlanId,
    setActivePlanId,
    removePlan,
    togglePlanDayCompleted,
    primaryTranslation,
    setPrimaryPlace
  } = useReader();

  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (activeSheet !== 'plans') return null;

  const currentPlan =
    plans.find(p => p.id === (selectedPlanId || activePlanId)) || plans[0] || null;

  const handleOpenReading = (book: string, chapter: number) => {
    setPrimaryPlace({
      translation: primaryTranslation,
      book,
      chapter,
      verse: 1
    });
    setActiveSheet(null);
    navigate(`/${primaryTranslation}/${book}/${chapter}`);
  };

  const calculateProgress = (plan: ReadingPlan) => {
    if (!plan || !plan.days || plan.days.length === 0) return 0;
    const completedCount = plan.days.filter(d => d.completed).length;
    return Math.round((completedCount / plan.days.length) * 100);
  };

  return (
    <div className="sheet-backdrop" onClick={() => setActiveSheet(null)}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            <div className="sheet-title">Reading Plans</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="dock-pill-btn"
              onClick={() => setActiveSheet('chat')}
              title="Create new plan with Gemini"
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '9999px',
                border: '1px solid var(--divider)'
              }}
            >
              <Sparkles size={13} />
              <span>New with AI</span>
            </button>
            <button
              className="sheet-close-btn"
              onClick={() => setActiveSheet(null)}
              aria-label="Close plans"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="sheet-body">
          {plans.length === 0 ? (
            <div className="empty-plans-state">
              <Calendar size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                No active reading plans
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textAlign: 'center', maxWidth: '320px' }}>
                Ask Lectio Guide to build a personalized study journey connecting any books or themes (e.g. Jeremiah & Revelation).
              </div>
              <button
                className="gear-toggle-btn active"
                onClick={() => setActiveSheet('chat')}
                style={{ flexDirection: 'row', gap: '6px', padding: '0.6rem 1.2rem', width: 'auto' }}
              >
                <Sparkles size={15} />
                <span>Create with Gemini</span>
              </button>
            </div>
          ) : (
            <>
              {/* Plan Switcher Pills if multiple plans exist */}
              {plans.length > 1 && (
                <div className="plan-tabs-bar">
                  {plans.map(p => (
                    <button
                      key={p.id}
                      className={`plan-tab-btn ${currentPlan?.id === p.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPlanId(p.id);
                        setActivePlanId(p.id);
                      }}
                    >
                      <span className="plan-tab-title">{p.title}</span>
                      <span className="plan-tab-pct">{calculateProgress(p)}%</span>
                    </button>
                  ))}
                </div>
              )}

              {currentPlan && (
                <div className="active-plan-container">
                  {/* Active Plan Meta */}
                  <div className="plan-meta-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div className="plan-hero-title">{currentPlan.title}</div>
                        <div className="plan-hero-desc">{currentPlan.description}</div>
                      </div>
                      <button
                        className="saved-phrase-delete"
                        onClick={() => {
                          if (window.confirm(`Delete plan "${currentPlan.title}"?`)) {
                            removePlan(currentPlan.id);
                          }
                        }}
                        title="Delete plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="plan-progress-section">
                      <div className="plan-progress-header">
                        <span>
                          {currentPlan.days.filter(d => d.completed).length} of {currentPlan.durationDays} days completed
                        </span>
                        <span style={{ fontWeight: 600 }}>{calculateProgress(currentPlan)}%</span>
                      </div>
                      <div className="plan-progress-track">
                        <div
                          className="plan-progress-fill"
                          style={{ width: `${calculateProgress(currentPlan)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Day-by-Day Journey */}
                  <div className="plan-days-list">
                    {currentPlan.days.map((day: PlanDay) => (
                      <div
                        key={`day-${day.day}`}
                        className={`plan-day-card ${day.completed ? 'completed' : ''}`}
                      >
                        <div className="plan-day-header">
                          <button
                            className={`plan-check-btn ${day.completed ? 'checked' : ''}`}
                            onClick={() => togglePlanDayCompleted(currentPlan.id, day.day)}
                            title={day.completed ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {day.completed ? <Check size={13} strokeWidth={3} /> : day.day}
                          </button>
                          <div className="plan-day-title-wrap">
                            <div className="plan-day-title">
                              Day {day.day}: {day.title}
                            </div>
                            {day.focus && (
                              <div className="plan-day-focus">{day.focus}</div>
                            )}
                          </div>
                        </div>

                        {/* Reading Passages Chips */}
                        <div className="plan-readings-row">
                          {day.readings.map((r, rIdx) => (
                            <button
                              key={`r-${day.day}-${rIdx}`}
                              className="plan-reading-chip"
                              onClick={() => handleOpenReading(r.book, r.chapter)}
                              title={`Read ${r.display} in Lectio`}
                            >
                              <BookOpen size={12} style={{ opacity: 0.7 }} />
                              <span>{r.display}</span>
                              <ChevronRight size={12} style={{ opacity: 0.5 }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
