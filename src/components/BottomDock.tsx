import React, { useRef } from 'react';
import { useReader } from '../context/ReaderContext';
import { findBookBySlug } from '../data/canon';
import { getTranslation } from '../data/translations';
import { Settings } from 'lucide-react';

export const BottomDock: React.FC = () => {
  const {
    isSplit,
    dockCollapsed,
    setDockCollapsed,
    primaryPlace,
    comparisonPlace,
    setActiveSheet,
    triggerSyncScroll
  } = useReader();

  const dockDragStartY = useRef<number | null>(null);

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

  // Vertical drag on dock scrolls both panes together
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dockDragStartY.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dockDragStartY.current === null) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dockDragStartY.current;
    if (Math.abs(deltaY) > 4) {
      triggerSyncScroll(deltaY * 1.5);
      dockDragStartY.current = clientY;
    }
  };

  const handleTouchEnd = () => {
    dockDragStartY.current = null;
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
        // Single Reading Pill (Matching Sketch 1 & 2)
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
            <button
              className="dock-pill-gear"
              onClick={e => {
                e.stopPropagation();
                setActiveSheet('gear');
              }}
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      ) : (
        // Two Pills (Matching Sketch 3 - Landscape/Split view)
        <>
          {/* Primary Pill: J 3:16 ENG + Gear */}
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

            <button
              className="dock-pill-gear"
              style={{ marginLeft: '0.4rem' }}
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
