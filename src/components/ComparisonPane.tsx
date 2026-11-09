import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReader } from '../context/ReaderContext';
import { loadChapter, ChapterData } from '../data/scriptureLoader';
import { ScriptureBlocks } from './ScriptureBlocks';
import { mapPsalmReference } from '../data/psalmsMapping';

interface ComparisonPaneProps {
  translation: string;
  bookSlug: string;
  chapter: number;
  verse: number;
}

export const ComparisonPane: React.FC<ComparisonPaneProps> = ({
  translation,
  bookSlug,
  chapter,
  verse
}) => {
  const { setComparisonPlace, syncScrollDelta, primaryPlace } = useReader();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute aligned chapter and verse
  const alignedChapter = bookSlug === 'psalms'
    ? mapPsalmReference(primaryPlace.translation, translation, chapter, verse).psalm
    : chapter;

  const alignedVerse = bookSlug === 'psalms'
    ? mapPsalmReference(primaryPlace.translation, translation, chapter, verse).verse
    : verse;

  // Load comparison chapter
  useEffect(() => {
    let active = true;
    setLoading(true);
    loadChapter(translation, bookSlug, alignedChapter)
      .then(({ chapterData: data }) => {
        if (active) {
          setChapterData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load comparison chapter', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [translation, bookSlug, alignedChapter]);

  // Align to verse on initial load or chapter change
  useEffect(() => {
    if (!loading && alignedVerse) {
      const timer = setTimeout(() => {
        const verseEl = document.getElementById(`verse-comparison-${alignedVerse}`);
        if (verseEl && containerRef.current) {
          verseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, alignedVerse]);

  // Synchronized scroll from dock or side handle
  useEffect(() => {
    if (syncScrollDelta !== 0 && containerRef.current) {
      containerRef.current.scrollTop += syncScrollDelta;
    }
  }, [syncScrollDelta]);

  // Scroll listener for comparison pane: tracks its own visible verse for its pill
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const verseElements = el.querySelectorAll<HTMLElement>('[data-verse]');
    const containerTop = el.getBoundingClientRect().top + 30;

    for (const vEl of Array.from(verseElements)) {
      const rect = vEl.getBoundingClientRect();
      if (rect.bottom >= containerTop && rect.top <= containerTop + 60) {
        const vNum = parseInt(vEl.dataset.verse || '1', 10);
        if (vNum > 0) {
          setComparisonPlace({
            translation,
            book: bookSlug,
            chapter: alignedChapter,
            verse: vNum
          });
          break;
        }
      }
    }
  }, [alignedChapter, bookSlug, setComparisonPlace, translation]);

  return (
    <div
      ref={containerRef}
      className="pane-comparison"
      onScroll={handleScroll}
      id="comparison-reading-pane"
    >
      {loading ? (
        <div style={{ padding: '1.5rem 0', opacity: 0.5, fontStyle: 'italic' }}>
          Loading comparison...
        </div>
      ) : chapterData ? (
        <ScriptureBlocks
          blocks={chapterData.blocks}
          translation={translation}
          bookSlug={bookSlug}
          chapter={alignedChapter}
          paneId="comparison"
        />
      ) : null}
    </div>
  );
};
