import React, { useRef, useState, useEffect } from 'react';
import { useReader } from '../context/ReaderContext';
import { findBookBySlug, getNextChapter, getPrevChapter } from '../data/canon';
import { TRANSLATIONS, getTranslation } from '../data/translations';
import {
  Columns2,
  Calendar,
  Sparkles,
  FileText,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BottomDock: React.FC = () => {
  const {
    isSplit,
    setIsSplit,
    dockCollapsed,
    setDockCollapsed,
    primaryPlace,
    setPrimaryPlace,
    comparisonPlace,
    setActiveSheet,
    triggerSyncScroll,
    isDockExpanded,
    setIsDockExpanded,
    toggleDockExpanded,
    isNotesOpen,
    toggleNotes,
    theme,
    setTheme,
    fontScale,
    setFontScale,
    primaryTranslation,
    setPrimaryTranslation,
    comparisonTranslation,
    setComparisonTranslation,
    highlights,
    removeHighlight
  } = useReader();

  const navigate = useNavigate();
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);
  const swipeHintTimerRef = useRef<number | null>(null);

  // Trigger chapter change across books with tactile toast
  const triggerChapterChange = (direction: 'next' | 'prev') => {
    const target =
      direction === 'next'
        ? getNextChapter(primaryPlace.book, primaryPlace.chapter)
        : getPrevChapter(primaryPlace.book, primaryPlace.chapter);

    if (target) {
      const meta = findBookBySlug(target.bookSlug);
      let name = meta?.name || target.bookSlug;
      if (primaryPlace.translation === 'segond' && meta?.nameFr) name = meta.nameFr;
      if (primaryPlace.translation === 'synodal' && meta?.nameRu) name = meta.nameRu;

      const label = direction === 'next' ? `${name} ${target.chapter} →` : `← ${name} ${target.chapter}`;
      setSwipeHint(label);
      if (swipeHintTimerRef.current) clearTimeout(swipeHintTimerRef.current);
      swipeHintTimerRef.current = window.setTimeout(() => setSwipeHint(null), 1200);

      setPrimaryPlace({
        book: target.bookSlug,
        chapter: target.chapter,
        verse: 1
      });
      navigate(`/${primaryPlace.translation}/${target.bookSlug}/${target.chapter}`);
    }
  };

  // Listen to scrolling state dispatched by reading panes
  useEffect(() => {
    const handleScrollEvent = (e: Event) => {
      const custom = e as CustomEvent<{ isScrolling: boolean }>;
      setIsScrolling(Boolean(custom.detail?.isScrolling));
    };
    window.addEventListener('lucent:scrolling', handleScrollEvent);
    return () => window.removeEventListener('lucent:scrolling', handleScrollEvent);
  }, []);

  // Format reference for single mode: e.g. "John 3:16"
  const getFormattedPlace = (place: typeof primaryPlace) => {
    const book = findBookBySlug(place.book);
    let bookName = book?.name || place.book;
    if (place.translation === 'segond' && book?.nameFr) bookName = book.nameFr;
    if (place.translation === 'synodal' && book?.nameRu) bookName = book.nameRu;
    return `${bookName} ${place.chapter}:${place.verse}`;
  };

  // Format reference for split mode: e.g. "J 3:16"
  const getShortPlace = (place: typeof primaryPlace) => {
    const book = findBookBySlug(place.book);
    const shortCode = book?.short || place.book.substring(0, 3);
    return `${shortCode} ${place.chapter}:${place.verse}`;
  };

  // Gesture handling:
  // - Dragging UP when collapsed expands settings
  // - Swiping LEFT/RIGHT on dock moves between chapters
  // - Dragging DOWN when expanded collapses back to dock pill
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = endY - touchStartY.current;
    const deltaX = endX - touchStartX.current;

    // If dock card is expanded: downward swipe collapses it
    if (isDockExpanded) {
      if (deltaY > 35) {
        setIsDockExpanded(false);
      }
      touchStartY.current = null;
      touchStartX.current = null;
      return;
    }

    // When collapsed:
    // 1. Upward drag: expands settings card
    if (deltaY < -38 && Math.abs(deltaY) > Math.abs(deltaX) * 1.25) {
      setIsDockExpanded(true);
    }
    // 2. Horizontal swipe left: Next Chapter
    else if (deltaX < -45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      triggerChapterChange('next');
    }
    // 3. Horizontal swipe right: Previous Chapter
    else if (deltaX > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      triggerChapterChange('prev');
    }

    touchStartY.current = null;
    touchStartX.current = null;
  };

  const handlePillClick = (target: 'primary' | 'comparison') => {
    if (dockCollapsed) {
      setDockCollapsed(false);
      return;
    }
    setActiveSheet(target === 'primary' ? 'book-primary' : 'book-comparison');
  };

  const handleFontChange = (delta: number) => {
    const next = Math.max(80, Math.min(150, fontScale + delta));
    setFontScale(next);
  };

  const handleSelectPrimaryTrans = (id: string) => {
    setPrimaryTranslation(id);
    navigate(`/${id}/${primaryPlace.book}/${primaryPlace.chapter}`);
  };

  const handleJumpToPhrase = (hl: typeof highlights[0]) => {
    setPrimaryPlace({
      translation: hl.translation,
      book: hl.book,
      chapter: hl.chapter,
      verse: hl.verse
    });
    setPrimaryTranslation(hl.translation);
    setIsDockExpanded(false);
    navigate(`/${hl.translation}/${hl.book}/${hl.chapter}`);
    setTimeout(() => {
      const el = document.getElementById(`verse-primary-${hl.verse}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const primaryTransMeta = getTranslation(primaryPlace.translation);
  const comparisonTransMeta = getTranslation(comparisonPlace.translation);

  return (
    <>
      {/* Dimmed backdrop when dock is expanded into vertical settings card */}
      {isDockExpanded && (
        <div
          className="dock-expanded-backdrop"
          onClick={() => setIsDockExpanded(false)}
        />
      )}

      <div
        className={`bottom-dock-container ${isDockExpanded ? 'dock-container-expanded' : ''} ${isScrolling && !isDockExpanded ? 'is-scrolling' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {swipeHint && (
          <div className="chapter-swipe-hint-pill">
            {swipeHint}
          </div>
        )}
        {!isDockExpanded ? (
          /* COLLAPSED FLOATING DOCK */
          !isSplit ? (
            <div
              className={`dock-pill ${dockCollapsed ? 'dock-pill-collapsed' : 'dock-pill-open'}`}
              onClick={() => handlePillClick('primary')}
              role="button"
              aria-label={dockCollapsed ? 'Expand dock' : 'Open book selection'}
            >
              <div className="dock-pill-place">
                {getFormattedPlace(primaryPlace)}
              </div>

              {!dockCollapsed && (
                <div className="dock-pill-actions">
                  {/* Reading Plans */}
                  <button
                    className="dock-pill-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveSheet('plans');
                    }}
                    title="Reading Plans"
                    aria-label="Reading Plans"
                  >
                    <Calendar size={16} strokeWidth={2} />
                  </button>

                  {/* Gemini Chatbot */}
                  <button
                    className="dock-pill-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveSheet('chat');
                    }}
                    title="Lucent Guide (Gemini)"
                    aria-label="Lucent Guide (Gemini)"
                  >
                    <Sparkles size={16} strokeWidth={2} />
                  </button>

                  {/* Side Notes */}
                  <button
                    className={`dock-pill-btn ${isNotesOpen ? 'active' : ''}`}
                    onClick={e => {
                      e.stopPropagation();
                      toggleNotes();
                    }}
                    title="Side Notes & Marginalia"
                    aria-label="Side Notes & Marginalia"
                  >
                    <FileText size={16} strokeWidth={2} />
                  </button>

                  {/* Split Screen button */}
                  <button
                    className="dock-pill-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setIsSplit(true);
                    }}
                    title="Open Split View"
                    aria-label="Open Split View"
                  >
                    <Columns2 size={16} strokeWidth={2} />
                  </button>

                  {/* Upward Expand to Settings Rectangle */}
                  <button
                    className="dock-pill-btn dock-expand-trigger"
                    onClick={e => {
                      e.stopPropagation();
                      setIsDockExpanded(true);
                    }}
                    title="Drag or tap to open settings"
                    aria-label="Open Settings"
                  >
                    <ChevronUp size={16} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Split View Pills */
            <>
              <div
                className="dock-pill dock-pill-split"
                onClick={() => handlePillClick('primary')}
                role="button"
                aria-label="Primary pane book picker"
              >
                <div className="dock-pill-place">
                  {getShortPlace(primaryPlace)}
                  <span className="dock-pill-lang-badge">{primaryTransMeta.pillCode}</span>
                </div>

                <div className="dock-pill-actions" style={{ marginLeft: '0.35rem', gap: '3px' }}>
                  <button
                    className="dock-pill-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveSheet('plans');
                    }}
                    title="Reading Plans"
                    aria-label="Reading Plans"
                  >
                    <Calendar size={14} strokeWidth={2} />
                  </button>

                  <button
                    className="dock-pill-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveSheet('chat');
                    }}
                    title="Lucent Guide (Gemini)"
                    aria-label="Lucent Guide (Gemini)"
                  >
                    <Sparkles size={14} strokeWidth={2} />
                  </button>

                  <button
                    className={`dock-pill-btn ${isNotesOpen ? 'active' : ''}`}
                    onClick={e => {
                      e.stopPropagation();
                      toggleNotes();
                    }}
                    title="Side Notes & Marginalia"
                    aria-label="Side Notes & Marginalia"
                  >
                    <FileText size={14} strokeWidth={2} />
                  </button>

                  <button
                    className="dock-pill-btn active"
                    onClick={e => {
                      e.stopPropagation();
                      setIsSplit(false);
                    }}
                    title="Close Split View"
                    aria-label="Close Split View"
                  >
                    <Columns2 size={14} strokeWidth={2} />
                  </button>

                  <button
                    className="dock-pill-btn dock-expand-trigger"
                    onClick={e => {
                      e.stopPropagation();
                      setIsDockExpanded(true);
                    }}
                    title="Drag or tap to open settings"
                    aria-label="Open Settings"
                  >
                    <ChevronUp size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Comparison Pill */}
              <div
                className="dock-pill dock-pill-split"
                onClick={() => handlePillClick('comparison')}
                role="button"
                aria-label="Comparison pane book picker"
              >
                <div className="dock-pill-place">
                  {getShortPlace(comparisonPlace)}
                  <span className="dock-pill-lang-badge">{comparisonTransMeta.pillCode}</span>
                </div>
              </div>
            </>
          )
        ) : (
          /* EXPANDED VERTICAL RECTANGLE WITH ROUNDED CORNERS */
          <div className="dock-card-expanded">
            {/* Top drag handle indicator */}
            <div
              className="dock-drag-bar-area"
              onClick={() => setIsDockExpanded(false)}
              title="Drag down or tap to collapse dock"
            >
              <div className="dock-drag-bar" />
            </div>

            {/* TOP ROW: Basic Dock Content */}
            <div className="dock-expanded-header">
              <div
                className="dock-expanded-place"
                onClick={() => {
                  setIsDockExpanded(false);
                  setActiveSheet('book-primary');
                }}
                role="button"
                title="Tap to change book or chapter"
              >
                <span>{getFormattedPlace(primaryPlace)}</span>
                <span className="dock-pill-lang-badge">{primaryTransMeta.pillCode}</span>
              </div>

              <div className="dock-expanded-actions">
                <button
                  className="dock-pill-btn"
                  onClick={() => {
                    setIsDockExpanded(false);
                    setActiveSheet('plans');
                  }}
                  title="Reading Plans"
                >
                  <Calendar size={16} strokeWidth={2} />
                </button>

                <button
                  className="dock-pill-btn"
                  onClick={() => {
                    setIsDockExpanded(false);
                    setActiveSheet('chat');
                  }}
                  title="Lucent Guide (Gemini)"
                >
                  <Sparkles size={16} strokeWidth={2} />
                </button>

                <button
                  className={`dock-pill-btn ${isNotesOpen ? 'active' : ''}`}
                  onClick={() => {
                    toggleNotes();
                  }}
                  title="Side Notes"
                >
                  <FileText size={16} strokeWidth={2} />
                </button>

                <button
                  className={`dock-pill-btn ${isSplit ? 'active' : ''}`}
                  onClick={() => setIsSplit(!isSplit)}
                  title={isSplit ? 'Close Split View' : 'Open Split View'}
                >
                  <Columns2 size={16} strokeWidth={2} />
                </button>

                <button
                  className="dock-pill-btn"
                  onClick={() => setIsDockExpanded(false)}
                  title="Collapse Settings"
                  aria-label="Collapse Settings"
                >
                  <ChevronDown size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* EXPANDED SETTINGS CONTENT BELOW */}
            <div className="dock-expanded-settings">
              {/* Theme: Flat White & AMOLED Black */}
              <div className="dock-settings-row">
                <div className="dock-settings-label">Theme</div>
                <div className="dock-settings-group">
                  <button
                    className={`dock-toggle-btn ${theme === 'white' ? 'active' : ''}`}
                    onClick={() => setTheme('white')}
                  >
                    <Sun size={15} />
                    <span>White</span>
                  </button>
                  <button
                    className={`dock-toggle-btn ${theme === 'black' ? 'active' : ''}`}
                    onClick={() => setTheme('black')}
                  >
                    <Moon size={15} />
                    <span>AMOLED Black</span>
                  </button>
                  <button
                    className={`dock-toggle-btn ${theme === 'glass' ? 'active' : ''}`}
                    onClick={() => setTheme('glass')}
                  >
                    <Sparkles size={15} />
                    <span>Liquid Glass</span>
                  </button>
                </div>
              </div>

              {/* Type Size Stepper */}
              <div className="dock-settings-row">
                <div className="dock-settings-label">Type Size</div>
                <div className="dock-font-stepper">
                  <button className="dock-stepper-btn" onClick={() => handleFontChange(-10)}>
                    A−
                  </button>
                  <span className="dock-font-val">{fontScale}%</span>
                  <button className="dock-stepper-btn" onClick={() => handleFontChange(10)}>
                    A+
                  </button>
                </div>
              </div>

              {/* Primary Translation */}
              <div className="dock-settings-col">
                <div className="dock-settings-label">Primary Translation</div>
                <div className="dock-trans-grid">
                  {TRANSLATIONS.map(t => (
                    <button
                      key={t.id}
                      className={`dock-trans-btn ${primaryTranslation === t.id ? 'active' : ''}`}
                      onClick={() => handleSelectPrimaryTrans(t.id)}
                    >
                      <span className="dock-trans-name">{t.shortName}</span>
                      <span className="dock-trans-desc">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comparison Translation (if Split Screen active) */}
              {isSplit && (
                <div className="dock-settings-col">
                  <div className="dock-settings-label">Comparison Translation</div>
                  <div className="dock-trans-grid">
                    {TRANSLATIONS.map(t => (
                      <button
                        key={t.id}
                        className={`dock-trans-btn ${comparisonTranslation === t.id ? 'active' : ''}`}
                        onClick={() => setComparisonTranslation(t.id)}
                      >
                        <span className="dock-trans-name">{t.shortName}</span>
                        <span className="dock-trans-desc">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Highlights */}
              {highlights.length > 0 && (
                <div className="dock-settings-col">
                  <div className="dock-settings-label">Highlights ({highlights.length})</div>
                  <div className="dock-highlights-list">
                    {highlights.slice(0, 5).map(hl => {
                      const b = findBookBySlug(hl.book);
                      const bName = b?.name || hl.book;
                      return (
                        <div
                          key={hl.id}
                          className="dock-highlight-item"
                          onClick={() => handleJumpToPhrase(hl)}
                        >
                          <div className="dock-hl-info">
                            <span className="dock-hl-ref">
                              {bName} {hl.chapter}:{hl.verse}
                            </span>
                            <span className="dock-hl-text">"{hl.text}"</span>
                          </div>
                          <button
                            className="dock-hl-delete"
                            onClick={e => {
                              e.stopPropagation();
                              removeHighlight(hl.id);
                            }}
                            title="Remove highlight"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
