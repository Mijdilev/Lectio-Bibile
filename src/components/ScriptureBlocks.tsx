import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ScriptureBlock, VerseItem } from '../data/scriptureLoader';
import { useReader } from '../context/ReaderContext';
import { HighlightItem, HighlightStyle, HighlightColor } from '../types/reader';
import { Pencil, Highlighter, Trash2, Copy, X } from 'lucide-react';

interface ScriptureBlocksProps {
  blocks: ScriptureBlock[];
  translation: string;
  bookSlug: string;
  chapter: number;
  paneId: 'primary' | 'comparison';
}

interface ActiveSelection {
  verseNum: number;
  startIdx: number;
  endIdx: number;
  startOffset: number;
  endOffset: number;
  text: string;
  x: number;
  y: number;
  isAbove: boolean;
}

interface ActiveHighlightMenu {
  highlight: HighlightItem;
  x: number;
  y: number;
  isAbove: boolean;
}

interface WordToken {
  idx: number;
  text: string;
  startOffset: number;
  endOffset: number;
  trailingSpace: string;
}

// 5 reading palette colors calibrated for both White and AMOLED Black themes
export const PALETTE_COLORS: { id: HighlightColor; label: string; dotVar: string }[] = [
  { id: 'monochrome', label: 'Ink', dotVar: 'var(--hl-monochrome-dot)' },
  { id: 'amber', label: 'Amber', dotVar: 'var(--hl-amber-dot)' },
  { id: 'sage', label: 'Sage', dotVar: 'var(--hl-sage-dot)' },
  { id: 'rose', label: 'Rose', dotVar: 'var(--hl-rose-dot)' },
  { id: 'azure', label: 'Azure', dotVar: 'var(--hl-azure-dot)' }
];

// Tokenize verse text into selectable words with exact character offsets
function tokenizeVerseText(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  const regex = /(\S+)(\s*)/g;
  let match: RegExpExecArray | null;
  let wordIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    const wordText = match[1];
    const trailingSpace = match[2];
    const startOffset = match.index;
    const endOffset = startOffset + wordText.length;
    tokens.push({
      idx: wordIdx++,
      text: wordText,
      startOffset,
      endOffset,
      trailingSpace
    });
  }

  return tokens;
}

// Visual icons for marking styles
const PenIcon = () => <Pencil size={12} />;
const WashIcon = () => <Highlighter size={12} />;
const WavyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2 9 Q5 5 8 9 T14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const DoubleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <line x1="2" y1="5.5" x2="14" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="2" y1="10.5" x2="14" y2="10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const ScriptureBlocks: React.FC<ScriptureBlocksProps> = ({
  blocks,
  translation,
  bookSlug,
  chapter,
  paneId
}) => {
  const { highlights, addHighlight, removeHighlight, updateHighlight, fontScale } = useReader();
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null);
  const [activeHighlightMenu, setActiveHighlightMenu] = useState<ActiveHighlightMenu | null>(null);
  const [preferredColor, setPreferredColor] = useState<HighlightColor>('amber');
  const containerRef = useRef<HTMLDivElement>(null);

  // Pointer tracking for drag selection
  const pointerState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    verseNum: number;
    wordIdx: number;
    currentWordIdx: number;
    isDragging: boolean;
    hasMoved: boolean;
  } | null>(null);

  // Relevant highlights for this chapter
  const chapterHighlights = useMemo(() => {
    return highlights.filter(
      h => h.translation === translation && h.book === bookSlug && h.chapter === chapter
    );
  }, [highlights, translation, bookSlug, chapter]);

  // Pre-tokenize all verses for fast lookup
  const tokenizedVerses = useMemo(() => {
    const map = new Map<number, { text: string; tokens: WordToken[] }>();
    blocks.forEach(block => {
      block.verses?.forEach(v => {
        if (!map.has(v.n)) {
          map.set(v.n, {
            text: v.text,
            tokens: tokenizeVerseText(v.text)
          });
        }
      });
    });
    return map;
  }, [blocks]);

  // Calculate coordinates for popup above or below selected words
  const calculatePopupPosition = useCallback((verseNum: number): { x: number; y: number; isAbove: boolean } => {
    if (!containerRef.current) {
      return { x: window.innerWidth / 2, y: 150, isAbove: true };
    }

    const wordEls = containerRef.current.querySelectorAll<HTMLElement>(
      `[data-verse="${verseNum}"].word-selected`
    );

    if (wordEls.length === 0) {
      return { x: window.innerWidth / 2, y: 150, isAbove: true };
    }

    let minLeft = Infinity;
    let maxRight = -Infinity;
    let minTop = Infinity;
    let maxBottom = -Infinity;

    wordEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.left < minLeft) minLeft = r.left;
      if (r.right > maxRight) maxRight = r.right;
      if (r.top < minTop) minTop = r.top;
      if (r.bottom > maxBottom) maxBottom = r.bottom;
    });

    const isAbove = minTop >= 110;
    const x = Math.max(120, Math.min(window.innerWidth - 120, (minLeft + maxRight) / 2));
    const y = isAbove ? minTop - 12 : maxBottom + 12;

    return { x, y, isAbove };
  }, []);

  // Update selection range between two word indices in a verse
  const setWordSelectionRange = useCallback((verseNum: number, idxA: number, idxB: number) => {
    const verseData = tokenizedVerses.get(verseNum);
    if (!verseData || verseData.tokens.length === 0) return;

    const startIdx = Math.max(0, Math.min(idxA, idxB));
    const endIdx = Math.min(verseData.tokens.length - 1, Math.max(idxA, idxB));

    const firstToken = verseData.tokens[startIdx];
    const lastToken = verseData.tokens[endIdx];

    const startOffset = firstToken.startOffset;
    const endOffset = lastToken.endOffset;
    const selectedText = verseData.text.slice(startOffset, endOffset);

    // Close any open highlight action menu
    setActiveHighlightMenu(null);

    // Compute geometry after DOM update
    requestAnimationFrame(() => {
      const pos = calculatePopupPosition(verseNum);
      setActiveSelection({
        verseNum,
        startIdx,
        endIdx,
        startOffset,
        endOffset,
        text: selectedText,
        x: pos.x,
        y: pos.y,
        isAbove: pos.isAbove
      });
    });
  }, [tokenizedVerses, calculatePopupPosition]);

  // Handle single tap on a word
  const handleWordClick = useCallback((verseNum: number, wordIdx: number) => {
    if (activeSelection && activeSelection.verseNum === verseNum) {
      // If clicking same single word, toggle off
      if (activeSelection.startIdx === wordIdx && activeSelection.endIdx === wordIdx) {
        setActiveSelection(null);
        return;
      }
      // Expand selection between previous start/end and this newly tapped word!
      const newStart = Math.min(activeSelection.startIdx, wordIdx);
      const newEnd = Math.max(activeSelection.endIdx, wordIdx);
      setWordSelectionRange(verseNum, newStart, newEnd);
    } else {
      // Fresh selection on this single word
      setWordSelectionRange(verseNum, wordIdx, wordIdx);
    }
  }, [activeSelection, setWordSelectionRange]);

  // Pointer down on a word
  const handleWordPointerDown = (e: React.PointerEvent<HTMLSpanElement>, verseNum: number, wordIdx: number) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    pointerState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      verseNum,
      wordIdx,
      currentWordIdx: wordIdx,
      isDragging: false,
      hasMoved: false
    };

    if (activeSelection && activeSelection.verseNum !== verseNum) {
      setActiveSelection(null);
    }
  };

  // Global pointer move to track dragging along words
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!pointerState.current) return;
      const state = pointerState.current;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dist = Math.hypot(dx, dy);

      // Cancel word drag if user is scrolling vertically before dragging across words
      if (!state.isDragging && Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx) * 1.6) {
        pointerState.current = null;
        return;
      }

      // Drag threshold met
      if (dist > 7) {
        state.hasMoved = true;
        state.isDragging = true;

        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.scripture-word');
        if (el && el.dataset.verse === String(state.verseNum)) {
          const curIdx = parseInt(el.dataset.wordIdx || '0', 10);
          if (curIdx !== state.currentWordIdx) {
            state.currentWordIdx = curIdx;
            setWordSelectionRange(state.verseNum, state.wordIdx, curIdx);
          }
        }
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (!pointerState.current) return;
      const state = pointerState.current;
      pointerState.current = null;

      if (state.isDragging && state.hasMoved) {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.scripture-word');
        const finalIdx = el && el.dataset.verse === String(state.verseNum)
          ? parseInt(el.dataset.wordIdx || '0', 10)
          : state.currentWordIdx;
        setWordSelectionRange(state.verseNum, state.wordIdx, finalIdx);
      } else if (!state.hasMoved) {
        handleWordClick(state.verseNum, state.wordIdx);
      }
    };

    const handleGlobalPointerCancel = () => {
      pointerState.current = null;
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    };
  }, [setWordSelectionRange, handleWordClick]);

  // Native text selection fallback
  useEffect(() => {
    const handleNativeSelectionChange = () => {
      if (pointerState.current) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return;

      const text = sel.toString().trim();
      if (!text || text.length < 1) return;

      const range = sel.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      if (!containerRef.current || !node || !containerRef.current.contains(node)) return;

      const verseEl = (node as HTMLElement).closest<HTMLElement>('[data-verse]');
      if (!verseEl) return;

      const verseNum = parseInt(verseEl.dataset.verse || '0', 10);
      const fullVerseText = verseEl.dataset.versetext || '';
      let startOffset = fullVerseText.indexOf(text);
      if (startOffset === -1) startOffset = 0;
      const endOffset = startOffset + text.length;

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const isAbove = rect.top >= 110;
      const yPos = isAbove ? rect.top - 12 : rect.bottom + 12;
      const xPos = Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2));

      const verseData = tokenizedVerses.get(verseNum);
      let startIdx = 0;
      let endIdx = 0;
      if (verseData) {
        const s = verseData.tokens.findIndex(t => t.startOffset >= startOffset);
        startIdx = s >= 0 ? s : 0;
        const e = verseData.tokens.findIndex(t => t.endOffset >= endOffset);
        endIdx = e >= 0 ? e : verseData.tokens.length - 1;
      }

      setActiveSelection({
        verseNum,
        startIdx,
        endIdx,
        startOffset,
        endOffset,
        text,
        x: xPos,
        y: yPos,
        isAbove
      });
    };

    document.addEventListener('selectionchange', handleNativeSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleNativeSelectionChange);
    };
  }, [tokenizedVerses]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.highlight-action-popup') || target.closest('.scripture-word')) {
        return;
      }
      setActiveSelection(null);
      setActiveHighlightMenu(null);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('touchstart', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Save selected phrase with chosen style and color
  const saveSelectedPhrase = (style: HighlightStyle, color: HighlightColor = preferredColor) => {
    if (!activeSelection) return;
    addHighlight({
      translation,
      book: bookSlug,
      chapter,
      verse: activeSelection.verseNum,
      startOffset: activeSelection.startOffset,
      endOffset: activeSelection.endOffset,
      text: activeSelection.text,
      style,
      color
    });

    setActiveSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  // Render verse with interactive selectable words and highlights
  const renderVerseContent = (v: VerseItem) => {
    const verseData = tokenizedVerses.get(v.n);
    const tokens = verseData ? verseData.tokens : tokenizeVerseText(v.text);
    const verseHighlights = chapterHighlights.filter(h => h.verse === v.n);

    const isCurrentVerseSelected = activeSelection?.verseNum === v.n;

    return (
      <span
        key={`v-${v.n}`}
        data-verse={v.n}
        data-versetext={v.text}
        id={`verse-${paneId}-${v.n}`}
        className="verse-container"
      >
        <sup className="verse-num">{v.n}</sup>
        {tokens.map((token, tIdx) => {
          const isSelected =
            isCurrentVerseSelected &&
            token.idx >= (activeSelection?.startIdx ?? -1) &&
            token.idx <= (activeSelection?.endIdx ?? -1);

          const activeHl = verseHighlights.find(
            h => token.startOffset < h.endOffset && token.endOffset > h.startOffset
          );

          const hlClass = activeHl
            ? `word-highlight style-${activeHl.style || 'pencil'} color-${activeHl.color || 'monochrome'}`
            : '';

          const selectedClass = isSelected ? 'word-selected' : '';

          return (
            <React.Fragment key={`tok-${v.n}-${tIdx}`}>
              <span
                className={`scripture-word ${hlClass} ${selectedClass}`}
                data-verse={v.n}
                data-word-idx={token.idx}
                onPointerDown={e => handleWordPointerDown(e, v.n, token.idx)}
                onClick={e => {
                  e.stopPropagation();
                  if (activeHl && !isSelected) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const isAbove = rect.top >= 110;
                    setActiveSelection(null);
                    setActiveHighlightMenu({
                      highlight: activeHl,
                      x: Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2)),
                      y: isAbove ? rect.top - 12 : rect.bottom + 12,
                      isAbove
                    });
                  }
                }}
              >
                {token.text}
              </span>
              {token.trailingSpace}
            </React.Fragment>
          );
        })}
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

      {/* Floating Selection Tooltip: Color Palette + Style Selector */}
      {activeSelection && createPortal(
        <div
          className="highlight-action-popup"
          style={{
            left: `${activeSelection.x}px`,
            top: `${activeSelection.y}px`,
            transform: activeSelection.isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
          }}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
        >
          {/* Row 1: Color Palette */}
          <div className="popup-color-palette">
            <span className="palette-label">Color</span>
            {PALETTE_COLORS.map(col => (
              <button
                key={col.id}
                className={`color-dot-btn ${preferredColor === col.id ? 'active' : ''}`}
                onClick={() => setPreferredColor(col.id)}
                title={col.label}
              >
                <span
                  className="color-dot-inner"
                  style={{ backgroundColor: col.dotVar }}
                />
              </button>
            ))}
          </div>

          {/* Row 2: Marking Brush Styles & Close */}
          <div className="popup-row">
            <div className="popup-styles-row">
              <button
                className="style-selector-btn"
                onClick={() => saveSelectedPhrase('pencil', preferredColor)}
                title="Single pen underline"
              >
                <PenIcon />
                <span>Pen</span>
              </button>
              <button
                className="style-selector-btn"
                onClick={() => saveSelectedPhrase('highlighter', preferredColor)}
                title="Translucent highlighter wash"
              >
                <WashIcon />
                <span>Wash</span>
              </button>
              <button
                className="style-selector-btn"
                onClick={() => saveSelectedPhrase('wavy', preferredColor)}
                title="Wavy brush ink line"
              >
                <WavyIcon />
                <span>Wavy</span>
              </button>
              <button
                className="style-selector-btn"
                onClick={() => saveSelectedPhrase('double', preferredColor)}
                title="Double pen rule"
              >
                <DoubleIcon />
                <span>Double</span>
              </button>
            </div>

            <button
              className="highlight-action-btn"
              onClick={() => setActiveSelection(null)}
              title="Dismiss"
              style={{ padding: '2px 4px', opacity: 0.6 }}
            >
              <X size={14} />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Saved Highlight Actions: Live Color Palette & Style Switcher */}
      {activeHighlightMenu && createPortal(
        <div
          className="highlight-action-popup"
          style={{
            left: `${activeHighlightMenu.x}px`,
            top: `${activeHighlightMenu.y}px`,
            transform: activeHighlightMenu.isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
          }}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
        >
          {/* Row 1: Live Color Palette Switcher */}
          <div className="popup-color-palette">
            <span className="palette-label">Color</span>
            {PALETTE_COLORS.map(col => {
              const currentColor = activeHighlightMenu.highlight.color || 'monochrome';
              const isActive = currentColor === col.id;
              return (
                <button
                  key={col.id}
                  className={`color-dot-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    updateHighlight(activeHighlightMenu.highlight.id, { color: col.id });
                    setActiveHighlightMenu(prev => prev ? {
                      ...prev,
                      highlight: { ...prev.highlight, color: col.id }
                    } : null);
                  }}
                  title={col.label}
                >
                  <span
                    className="color-dot-inner"
                    style={{ backgroundColor: col.dotVar }}
                  />
                </button>
              );
            })}
          </div>

          {/* Row 2: Live Style Switcher + Remove + Copy */}
          <div className="popup-row">
            <div className="popup-styles-row">
              {(['pencil', 'highlighter', 'wavy', 'double'] as HighlightStyle[]).map(st => {
                const currentStyle = activeHighlightMenu.highlight.style || 'pencil';
                const isActive = currentStyle === st;
                const label = st === 'pencil' ? 'Pen' : st === 'highlighter' ? 'Wash' : st === 'wavy' ? 'Wavy' : 'Double';
                const Icon = st === 'pencil' ? PenIcon : st === 'highlighter' ? WashIcon : st === 'wavy' ? WavyIcon : DoubleIcon;
                return (
                  <button
                    key={st}
                    className={`style-selector-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      updateHighlight(activeHighlightMenu.highlight.id, { style: st });
                      setActiveHighlightMenu(prev => prev ? {
                        ...prev,
                        highlight: { ...prev.highlight, style: st }
                      } : null);
                    }}
                    title={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
              <button
                className="highlight-action-btn"
                onClick={() => {
                  removeHighlight(activeHighlightMenu.highlight.id);
                  setActiveHighlightMenu(null);
                }}
                title="Remove highlight"
              >
                <Trash2 size={13} />
              </button>
              <button
                className="highlight-action-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(activeHighlightMenu.highlight.text);
                  setActiveHighlightMenu(null);
                }}
                title="Copy phrase"
              >
                <Copy size={13} />
              </button>
              <button
                className="highlight-action-btn"
                onClick={() => setActiveHighlightMenu(null)}
                title="Close"
                style={{ padding: '2px 4px', opacity: 0.6 }}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
