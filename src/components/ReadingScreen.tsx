import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReader } from '../context/ReaderContext';
import { ChapterView } from './ChapterView';
import { ComparisonPane } from './ComparisonPane';
import { SplitDivider } from './SplitDivider';
import { BottomDock } from './BottomDock';
import { BookSheet } from './BookSheet';
import { GearSheet } from './GearSheet';
import { MiddleDragGesture } from './MiddleDragGesture';
import { DualScrollZone } from './DualScrollZone';
import { findBookBySlug } from '../data/canon';

export const ReadingScreen: React.FC = () => {
  const {
    translation: routeTrans,
    book: routeBook,
    chapter: routeChapter
  } = useParams<{ translation?: string; book?: string; chapter?: string }>();

  const navigate = useNavigate();
  const {
    primaryTranslation,
    setPrimaryTranslation,
    primaryPlace,
    setPrimaryPlace,
    comparisonPlace,
    comparisonTranslation,
    isSplit,
    splitRatio
  } = useReader();

  const splitWrapperRef = useRef<HTMLDivElement>(null);

  // Synchronize route with reader state
  const effectiveTrans = (routeTrans || primaryTranslation || 'kjv').toLowerCase();
  const effectiveBook = (routeBook || primaryPlace.book || 'john').toLowerCase();
  const effectiveChapter = parseInt(routeChapter || String(primaryPlace.chapter || 3), 10);

  useEffect(() => {
    // If no route params or invalid, redirect to canonical /trans/book/chapter
    if (!routeTrans || !routeBook || !routeChapter) {
      navigate(`/${effectiveTrans}/${effectiveBook}/${effectiveChapter}`, { replace: true });
      return;
    }

    if (effectiveTrans !== primaryTranslation) {
      setPrimaryTranslation(effectiveTrans);
    }

    setPrimaryPlace({
      translation: effectiveTrans,
      book: effectiveBook,
      chapter: effectiveChapter
    });
  }, [routeTrans, routeBook, routeChapter, effectiveTrans, effectiveBook, effectiveChapter, primaryTranslation, setPrimaryTranslation, setPrimaryPlace, navigate]);

  // Current time for status bar simulation
  const [timeStr, setTimeStr] = React.useState<string>('9:41');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lectio-root">
      <div className="lectio-frame">
        {/* Status bar band: text runs through it, icons/text follow theme */}
        <div className="status-bar-band">
          <span>{timeStr}</span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem' }}>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Reading Viewport */}
        <div className="reading-viewport">
          {!isSplit ? (
            <>
              {/* Single pane view */}
              <ChapterView
                translation={effectiveTrans}
                bookSlug={effectiveBook}
                chapter={effectiveChapter}
                initialVerse={primaryPlace.verse}
                isSplitView={false}
              />

              {/* Horizontal drag parting wave in the middle (Sketch 2) */}
              <MiddleDragGesture />
            </>
          ) : (
            /* Split panes view (Sketch 3) */
            <div
              ref={splitWrapperRef}
              className="split-container"
            >
              {/* Top Primary Pane */}
              <div
                style={{
                  height: `${splitRatio}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <ChapterView
                  translation={effectiveTrans}
                  bookSlug={effectiveBook}
                  chapter={effectiveChapter}
                  initialVerse={primaryPlace.verse}
                  isSplitView={true}
                />
              </div>

              {/* Split Divider */}
              <SplitDivider containerRef={splitWrapperRef} />

              {/* Bottom Comparison Pane (shows about half as many verses, shorter window) */}
              <div
                style={{
                  height: `${100 - splitRatio}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <ComparisonPane
                  translation={comparisonTranslation}
                  bookSlug={comparisonPlace.book || effectiveBook}
                  chapter={comparisonPlace.chapter || effectiveChapter}
                  verse={comparisonPlace.verse || primaryPlace.verse}
                />
              </div>

              {/* Synchronized dual scroll touch handle on right side */}
              <DualScrollZone />
            </div>
          )}
        </div>

        {/* Floating Bottom Dock */}
        <BottomDock />

        {/* Modal Sheets */}
        <BookSheet target="primary" />
        <BookSheet target="comparison" />
        <GearSheet />
      </div>
    </div>
  );
};
