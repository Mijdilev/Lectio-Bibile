import React, { useRef } from 'react';
import { useReader } from '../context/ReaderContext';
import { findBookBySlug } from '../data/canon';
import { getTranslation } from '../data/translations';
import { Settings, Columns2 } from 'lucide-react';

export const BottomDock: React.FC = () => {
  const {
    isSplit,
    setIsSplit,
    dockCollapsed,
    setDockCollapsed,
    primaryPlace,
    comparisonPlace,
    setActiveSheet,
    triggerSyncScroll
  } = useReader();

  const dockDragStartY = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const pendingDelta = useRef<number>(0);

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

  // 90Hz/120Hz requestAnimationFrame batching for vertical dock drag
  const applyPendingScroll = () => {
    if (Math.abs(pendingDelta.current) > 0.5) {
      triggerSyncScroll(pendingDelta.current);
      pendingDelta.current = 0;
    }
    rafId.current = null;
  };

  // Vertical drag on dock scrolls both panes together
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dockDragStartY.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dockDragStartY.current === null) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dockDragStartY.current;
    if (Math.abs(deltaY) > 2) {
      pendingDelta.current += deltaY * 1.5;
      dockDragStartY.current = clientY;
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(applyPendingScroll);
      }
    }
  };

  const handleTouchEnd = () => {
    dockDragStartY.current = null;
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    applyPendingScroll();
  };

  const handlePillClick = (target: 'primary' | 'comparison') => {
    if (dockCollapsed) {
      setDockCollapsed(false);
      return;
    }
    setActiveSheet(target === 'primary' ? 'book-primary' : 'book-comparison');
  };

  const primaryTransMeta = getTranslation(primaryPlace.translation);
  const comparisonTransMeta = getTranslation(comparisonPlace.translation);

  return (
    <div
      className="bottom-dock-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
    >
      {!isSplit ? (
        // Single Reading Pill (Matching Sketch 1 & 2 with Split Button added near Gear)
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
              {/* Split Screen button placed right in the dock near the settings gear symbol */}
              <button
                className="dock-pill-btn"
                onClick={e => {
                  e.stopPropagation();
                  setIsSplit(true);
                }}
                title="Open Split View"
                aria-label="Open Split View"
              >
                <Columns2 size={17} strokeWidth={2} />
              </button>

              <button
                className="dock-pill-btn"
                onClick={e => {
                  e.stopPropagation();
                  setActiveSheet('gear');
                }}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={17} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Two Pills (Matching Sketch 3 - Landscape/Split view)
        <>
          {/* Primary Pill: J 3:16 ENG + Split Toggle + Gear */}
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

            <div className="dock-pill-actions" style={{ marginLeft: '0.4rem', gap: '2px' }}>
              {/* Split screen toggle near gear icon to close split view */}
              <button
                className="dock-pill-btn active"
                onClick={e => {
                  e.stopPropagation();
                  setIsSplit(false);
                }}
                title="Close Split View"
                aria-label="Close Split View"
              >
                <Columns2 size={15} strokeWidth={2} />
              </button>

              <button
                className="dock-pill-btn"
                onClick={e => {
                  e.stopPropagation();
                  setActiveSheet('gear');
                }}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={15} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Comparison Pill: J 3:16 FR */}
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
      )}
    </div>
  );
};
