import React, { useEffect, useRef, useState } from 'react';
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
  const { primaryPlace } = useReader();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute aligned chapter based on primary place
  const primaryVerse = primaryPlace.verse || 1;
  const primaryChap = primaryPlace.chapter || chapter;

  const alignedChapter = bookSlug === 'psalms'
    ? mapPsalmReference(primaryPlace.translation, translation, primaryChap, primaryVerse).psalm
    : primaryChap;

  const alignedVerse = bookSlug === 'psalms'
    ? mapPsalmReference(primaryPlace.translation, translation, primaryChap, primaryVerse).verse
    : primaryVerse;

  // Load comparison chapter data
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

  // Initial alignment on chapter load
  useEffect(() => {
    if (!loading && alignedVerse) {
      const timer = setTimeout(() => {
        const el = containerRef.current;
        const verseEl = document.getElementById(`verse-comparison-${alignedVerse}`);
        if (el && verseEl) {
          const containerRect = el.getBoundingClientRect();
          const verseRect = verseEl.getBoundingClientRect();
          const diff = verseRect.top - containerRect.top - 16;
          if (Math.abs(diff) > 2) {
            el.scrollTop += diff;
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, alignedVerse]);

  return (
    <div
      ref={containerRef}
      className="pane-comparison"
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
