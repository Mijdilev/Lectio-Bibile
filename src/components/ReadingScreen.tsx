import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReader } from '../context/ReaderContext';
import { ChapterView } from './ChapterView';
import { ComparisonPane } from './ComparisonPane';
import { SplitDivider } from './SplitDivider';
import { BottomDock } from './BottomDock';
import { BookSheet } from './BookSheet';
import { GearSheet } from './GearSheet';
import { PlansSheet } from './PlansSheet';
import { ChatSheet } from './ChatSheet';
import { findBookBySlug } from '../data/canon';
import { mapPsalmReference } from '../data/psalmsMapping';

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
    setComparisonPlace,
    comparisonTranslation,
    isSplit,
    splitRatio
  } = useReader();

  const splitWrapperRef = useRef<HTMLDivElement>(null);
  const lastSyncedVerseRef = useRef<number | null>(null);

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

  // Split-screen synchronized scrolling hook:
  // Detects split-screen mode, listens to scroll events in the primary pane,
  // calculates equivalent verse position in the secondary pane, and programmatically sets scrollTop
  useEffect(() => {
    if (!isSplit) return;

    let rafId: number | null = null;
    let primaryPane: HTMLElement | null = null;
    let compPane: HTMLElement | null = null;

    // Helper to find top visible verse in a container
    const getTopVerse = (container: HTMLElement): { verseNum: number; el: HTMLElement } | null => {
      const containerRect = container.getBoundingClientRect();
      const readingLine = containerRect.top + 35; // reading line near top

      const verses = Array.from(container.querySelectorAll<HTMLElement>('[data-verse]'));
      if (verses.length === 0) return null;

      for (const vEl of verses) {
        const rect = vEl.getBoundingClientRect();
        if (rect.bottom >= readingLine) {
          const num = parseInt(vEl.dataset.verse || '1', 10);
          return { verseNum: num, el: vEl };
        }
      }
      return { verseNum: parseInt(verses[0].dataset.verse || '1', 10), el: verses[0] };
    };

    const syncComparisonToPrimary = () => {
      if (!primaryPane || !compPane) {
        primaryPane = document.getElementById('primary-reading-pane');
        compPane = document.getElementById('comparison-reading-pane');
      }
      if (!primaryPane || !compPane) return;

      const topVerseInfo = getTopVerse(primaryPane);
      if (!topVerseInfo) return;

      const { verseNum: primaryVerseNum, el: primaryVerseEl } = topVerseInfo;

      // Calculate equivalent verse for the comparison translation
      let targetVerse = primaryVerseNum;
      let targetChapter = effectiveChapter;

      if (effectiveBook === 'psalms') {
        const mapped = mapPsalmReference(
          effectiveTrans,
          comparisonTranslation,
          effectiveChapter,
          primaryVerseNum
        );
        targetVerse = mapped.verse;
        targetChapter = mapped.psalm;
      }

      // Only update React place state when verse actually changes to prevent render thrashing during 120Hz scrolling
      if (lastSyncedVerseRef.current !== primaryVerseNum) {
        lastSyncedVerseRef.current = primaryVerseNum;
        setPrimaryPlace({
          translation: effectiveTrans,
          book: effectiveBook,
          chapter: effectiveChapter,
          verse: primaryVerseNum
        });

        setComparisonPlace({
          translation: comparisonTranslation,
          book: effectiveBook,
          chapter: targetChapter,
          verse: targetVerse
        });
      }

      // Find the equivalent verse in the comparison pane
      const targetVerseEl = document.getElementById(`verse-comparison-${targetVerse}`);
      if (targetVerseEl && compPane) {
        const compRect = compPane.getBoundingClientRect();
        const targetRect = targetVerseEl.getBoundingClientRect();

        // Calculate progress within primary verse for smooth intra-verse tracking
        const pRect = primaryVerseEl.getBoundingClientRect();
        const pReadingLine = primaryPane.getBoundingClientRect().top + 35;
        const pProgress = pRect.height > 0 ? (pReadingLine - pRect.top) / pRect.height : 0;
        const clampedProgress = Math.max(0, Math.min(1, pProgress));

        // Exact desired position of target verse
        const compReadingLine = compRect.top + 16;
        const desiredTargetTop = compReadingLine - (clampedProgress * targetRect.height);
        const diff = targetRect.top - desiredTargetTop;

        if (Math.abs(diff) > 0.5) {
          compPane.scrollTop += diff;
        }
      }
    };

    const handlePrimaryScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncComparisonToPrimary);
    };

    // Attach listener with a slight initial delay to let DOM render
    const initTimer = setTimeout(() => {
      primaryPane = document.getElementById('primary-reading-pane');
      compPane = document.getElementById('comparison-reading-pane');

      if (primaryPane) {
        primaryPane.addEventListener('scroll', handlePrimaryScroll, { passive: true });
        syncComparisonToPrimary();
      }
    }, 80);

    return () => {
      clearTimeout(initTimer);
      if (primaryPane) {
        primaryPane.removeEventListener('scroll', handlePrimaryScroll);
      }
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    isSplit,
    effectiveTrans,
    effectiveBook,
    effectiveChapter,
    comparisonTranslation,
    setPrimaryPlace,
    setComparisonPlace
  ]);

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
                  overflow: 'hidden',
                  position: 'relative'
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
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <ComparisonPane
                  translation={comparisonTranslation}
                  bookSlug={comparisonPlace.book || effectiveBook}
                  chapter={comparisonPlace.chapter || effectiveChapter}
                  verse={comparisonPlace.verse || primaryPlace.verse}
                />
              </div>
            </div>
          )}
        </div>

        {/* Floating Bottom Dock */}
        <BottomDock />

        {/* Modal Sheets */}
        <BookSheet target="primary" />
        <BookSheet target="comparison" />
        <GearSheet />
        <PlansSheet />
        <ChatSheet />
      </div>
    </div>
  );
};
