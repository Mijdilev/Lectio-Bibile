import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReader } from '../context/ReaderContext';
import { loadChapter, ChapterData } from '../data/scriptureLoader';
import { ScriptureBlocks } from './ScriptureBlocks';

interface ChapterViewProps {
  translation: string;
  bookSlug: string;
  chapter: number;
  initialVerse?: number;
  isSplitView?: boolean;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  translation,
  bookSlug,
  chapter,
  initialVerse = 1,
  isSplitView = false
}) => {
  const { setDockCollapsed, setPrimaryPlace, isSplit } = useReader();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const scrollHysteresis = useRef<number>(0);

  // Master/follower flag: true when user is actively interacting with this pane
  const isUserInteractingRef = useRef<boolean>(false);
  const interactionTimerRef = useRef<number | null>(null);

  // Load chapter data on demand
  useEffect(() => {
    let active = true;
    setLoading(true);
    loadChapter(translation, bookSlug, chapter)
      .then(({ chapterData: data }) => {
        if (active) {
          setChapterData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load chapter', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [translation, bookSlug, chapter]);

  // Handle initial verse scrolling
  useEffect(() => {
    if (!loading && initialVerse > 1) {
      const timer = setTimeout(() => {
        const verseEl = document.getElementById(`verse-primary-${initialVerse}`);
        if (verseEl && containerRef.current) {
          verseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, initialVerse]);

  // Synchronized scroll listener from other triggers (e.g. comparison pane or dock)
  useEffect(() => {
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<{ deltaY: number; source?: string }>;
      if (custom.detail?.source === 'primary') return;
      if (containerRef.current && custom.detail?.deltaY) {
        containerRef.current.scrollTop += custom.detail.deltaY;
      }
    };
    window.addEventListener('lectio:sync-scroll', handleSync);
    return () => window.removeEventListener('lectio:sync-scroll', handleSync);
  }, []);

  const startUserInteraction = () => {
    isUserInteractingRef.current = true;
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
  };

  const endUserInteractionDebounced = () => {
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = window.setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 180);
  };

  // Helper to accurately locate the verse currently at the top reading line
  const findTopVisibleVerse = (container: HTMLElement): number => {
    const containerRect = container.getBoundingClientRect();
    const readingLine = containerRect.top + 35; // reading threshold just below top edge

    const verseElements = Array.from(container.querySelectorAll<HTMLElement>('[data-verse]'));
    if (verseElements.length === 0) return 1;

    for (const vEl of verseElements) {
      const rect = vEl.getBoundingClientRect();
      if (rect.bottom >= readingLine && rect.top <= readingLine + 40) {
        return parseInt(vEl.dataset.verse || '1', 10);
      }
    }

    for (const vEl of verseElements) {
      const rect = vEl.getBoundingClientRect();
      if (rect.bottom >= readingLine) {
        return parseInt(vEl.dataset.verse || '1', 10);
      }
    }

    return 1;
  };

  // Scroll listener: performs synchronized dual scrolling and updates top active verse
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentScrollY = el.scrollTop;
    const delta = currentScrollY - lastScrollY.current;
    lastScrollY.current = currentScrollY;

    // Dock collapse hysteresis
    if (currentScrollY <= 20) {
      setDockCollapsed(false);
      scrollHysteresis.current = 0;
    } else {
      if (delta > 0) {
        scrollHysteresis.current = Math.min(30, Math.max(0, scrollHysteresis.current + delta));
        if (scrollHysteresis.current > 16) {
          setDockCollapsed(true);
        }
      } else if (delta < 0) {
        scrollHysteresis.current = Math.max(-30, Math.min(0, scrollHysteresis.current + delta));
        if (scrollHysteresis.current < -16) {
          setDockCollapsed(false);
        }
      }
    }

    // Detect top visible verse and synchronize place
    const topVerse = findTopVisibleVerse(el);
    if (topVerse > 0) {
      setPrimaryPlace({
        translation,
        book: bookSlug,
        chapter,
        verse: topVerse
      });
    }

    endUserInteractionDebounced();
  }, [bookSlug, chapter, isSplitView, setDockCollapsed, setPrimaryPlace, translation]);

  return (
    <div
      ref={containerRef}
      className={isSplitView ? 'pane-primary' : 'pane-single'}
      onScroll={handleScroll}
      onTouchStart={startUserInteraction}
      onTouchEnd={endUserInteractionDebounced}
      onMouseDown={startUserInteraction}
      onMouseUp={endUserInteractionDebounced}
      onWheel={startUserInteraction}
      id="primary-reading-pane"
    >
      {loading ? (
        <div style={{ padding: '2rem 0', opacity: 0.5, fontStyle: 'italic' }}>
          Loading...
        </div>
      ) : chapterData ? (
        <ScriptureBlocks
          blocks={chapterData.blocks}
          translation={translation}
          bookSlug={bookSlug}
          chapter={chapter}
          paneId="primary"
        />
      ) : null}
    </div>
  );
};
