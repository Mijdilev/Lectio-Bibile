import React, { useState, useEffect, useRef } from 'react';
import { ScriptureBlock, VerseItem } from '../data/scriptureLoader';
import { useReader } from '../context/ReaderContext';
import { HighlightItem } from '../types/reader';

interface ScriptureBlocksProps {
  blocks: ScriptureBlock[];
  translation: string;
  bookSlug: string;
  chapter: number;
  paneId: 'primary' | 'comparison';
}

interface ActiveSelection {
  verseNum: number;
  startOffset: number;
  endOffset: number;
  text: string;
  x: number;
  y: number;
}

interface ActiveHighlightMenu {
  highlight: HighlightItem;
  x: number;
  y: number;
}

export const ScriptureBlocks: React.FC<ScriptureBlocksProps> = ({
  blocks,
  translation,
  bookSlug,
  chapter,
  paneId
}) => {
  const { highlights, addHighlight, removeHighlight, fontScale } = useReader();
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null);
  const [activeHighlightMenu, setActiveHighlightMenu] = useState<ActiveHighlightMenu | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Relevant highlights for this chapter
  const chapterHighlights = highlights.filter(
    h => h.translation === translation && h.book === bookSlug && h.chapter === chapter
  );

  // Handle selection (mouse drag or touch drag)
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) return;

    // Check if selection is inside a verse element
    const range = selection.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node && !(node instanceof HTMLElement && node.dataset.verse)) {
      node = node.parentNode;
    }

    if (!node || !(node instanceof HTMLElement)) return;

    const verseNum = parseInt(node.dataset.verse || '0', 10);
    const fullVerseText = node.dataset.versetext || '';

    // Calculate offsets within verse text
    const startOffset = fullVerseText.indexOf(text);
    if (startOffset === -1) return;
    const endOffset = startOffset + text.length;

    const rect = range.getBoundingClientRect();
    setActiveSelection({
      verseNum,
      startOffset,
      endOffset,
      text,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  // Close menus on outside click or scroll
  useEffect(() => {
    const handleScrollOrClick = (e: Event) => {
      if (activeSelection || activeHighlightMenu) {
        // Close if click outside popup
        const target = e.target as HTMLElement;
        if (!target.closest('.highlight-action-popup')) {
          setActiveSelection(null);
          setActiveHighlightMenu(null);
        }
      }
    };

    window.addEventListener('scroll', handleScrollOrClick, true);
    window.addEventListener('mousedown', handleScrollOrClick);
    return () => {
      window.removeEventListener('scroll', handleScrollOrClick, true);
      window.removeEventListener('mousedown', handleScrollOrClick);
    };
  }, [activeSelection, activeHighlightMenu]);

  const saveSelectedPhrase = () => {
    if (!activeSelection) return;
    addHighlight({
      translation,
      book: bookSlug,
      chapter,
      verse: activeSelection.verseNum,
      startOffset: activeSelection.startOffset,
      endOffset: activeSelection.endOffset,
      text: activeSelection.text
    });
    setActiveSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  // Render a verse with sliced highlights
  const renderVerseContent = (v: VerseItem) => {
    const verseHighlights = chapterHighlights.filter(h => h.verse === v.n);

    if (verseHighlights.length === 0) {
      return (
        <span
          key={`v-${v.n}`}
          data-verse={v.n}
          data-versetext={v.text}
          id={`verse-${paneId}-${v.n}`}
          className="verse-container"
        >
          <sup className="verse-num">{v.n}</sup>
          {v.text}{' '}
        </span>
      );
    }

    // Build segments with highlights
    // Sort highlights by startOffset
    const sorted = [...verseHighlights].sort((a, b) => a.startOffset - b.startOffset);
    const segments: React.ReactNode[] = [];
    let cur = 0;

    sorted.forEach((hl, i) => {
      // Preceding normal text
      if (hl.startOffset > cur) {
        segments.push(v.text.slice(cur, hl.startOffset));
      }
      // Highlighted phrase
      const hlText = v.text.slice(hl.startOffset, hl.endOffset) || hl.text;
      segments.push(
        <span
          key={`hl-${hl.id}-${i}`}
          className="word-highlight"
          title="Saved phrase"
          onClick={e => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setActiveHighlightMenu({
              highlight: hl,
              x: rect.left + rect.width / 2,
              y: rect.top
            });
          }}
        >
          {hlText}
        </span>
      );
      cur = Math.max(cur, hl.endOffset);
    });

    if (cur < v.text.length) {
      segments.push(v.text.slice(cur));
    }

    return (
      <span
        key={`v-${v.n}`}
        data-verse={v.n}
        data-versetext={v.text}
        id={`verse-${paneId}-${v.n}`}
        className="verse-container"
      >
        <sup className="verse-num">{v.n}</sup>
        {segments}{' '}
      </span>
    );
  };

  const dynamicFontSize = {
    fontSize: `calc(1.12rem * ${fontScale / 100})`
  };

  return (
    <div
      ref={containerRef}
      className="scripture-blocks-root chapter-enter"
      style={dynamicFontSize}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {blocks.map((block, bIdx) => {
        if (block.type === 's') {
          return (
            <div key={`h-${bIdx}`} className="section-heading">
              {block.heading}
            </div>
          );
        }

        if (block.type === 'd') {
          return (
            <div key={`d-${bIdx}`} className="superscription">
              {block.heading}
            </div>
          );
        }

        if (block.type === 'q') {
          return (
            <div key={`q-${bIdx}`} className="scripture-poetry">
              {block.verses?.map(v => renderVerseContent(v))}
            </div>
          );
        }

        // Prose paragraph
        return (
          <p key={`p-${bIdx}`} className="scripture-prose">
            {block.verses?.map(v => renderVerseContent(v))}
          </p>
        );
      })}

      {/* Floating Save Phrase Tooltip */}
      {activeSelection && (
        <div
          className="highlight-action-popup"
          style={{ left: `${activeSelection.x}px`, top: `${activeSelection.y}px` }}
        >
          <button className="highlight-action-btn" onClick={saveSelectedPhrase}>
            Save phrase
          </button>
        </div>
      )}

      {/* Floating Saved Highlight Actions */}
      {activeHighlightMenu && (
        <div
          className="highlight-action-popup"
          style={{ left: `${activeHighlightMenu.x}px`, top: `${activeHighlightMenu.y}px` }}
        >
          <button
            className="highlight-action-btn"
            onClick={() => {
              removeHighlight(activeHighlightMenu.highlight.id);
              setActiveHighlightMenu(null);
            }}
          >
            Remove highlight
          </button>
        </div>
      )}
    </div>
  );
};
