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
  const { setDockCollapsed, setPrimaryPlace, syncScrollDelta } = useReader();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const scrollHysteresis = useRef<number>(0);

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

  // Handle synchronized scroll delta from dock/drag tab
  useEffect(() => {
    if (syncScrollDelta !== 0 && containerRef.current) {
      containerRef.current.scrollTop += syncScrollDelta;
    }
  }, [syncScrollDelta]);

  // Scroll listener: handles dock collapse/expand with hysteresis and visible verse detection
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentScrollY = el.scrollTop;
    const delta = currentScrollY - lastScrollY.current;

    // At top of chapter: dock always open
    if (currentScrollY <= 20) {
      setDockCollapsed(false);
      scrollHysteresis.current = 0;
    } else {
      // Hysteresis calculation (threshold 16px) to avoid flickering
      if (delta > 0) {
        // Scrolling down (reading further)
        scrollHysteresis.current = Math.min(30, Math.max(0, scrollHysteresis.current + delta));
        if (scrollHysteresis.current > 16) {
          setDockCollapsed(true);
        }
      } else if (delta < 0) {
        // Scrolling up (moving back)
        scrollHysteresis.current = Math.max(-30, Math.min(0, scrollHysteresis.current + delta));
        if (scrollHysteresis.current < -16) {
          setDockCollapsed(false);
        }
      }
    }

    lastScrollY.current = currentScrollY;

    // Find currently visible verse at the top reading line
    const verseElements = el.querySelectorAll<HTMLElement>('[data-verse]');
    const containerTop = el.getBoundingClientRect().top + 50; // top reading threshold

    for (const vEl of Array.from(verseElements)) {
      const rect = vEl.getBoundingClientRect();
      if (rect.bottom >= containerTop && rect.top <= containerTop + 80) {
        const vNum = parseInt(vEl.dataset.verse || '1', 10);
        if (vNum > 0) {
          setPrimaryPlace({
            translation,
            book: bookSlug,
            chapter,
            verse: vNum
          });
          break;
        }
      }
    }
  }, [bookSlug, chapter, setDockCollapsed, setPrimaryPlace, translation]);

  return (
    <div
      ref={containerRef}
      className={isSplitView ? 'pane-primary' : 'pane-single'}
      onScroll={handleScroll}
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
