import React, { useState, useEffect, useRef } from 'react';
import { useReader } from '../context/ReaderContext';
import { findBookBySlug } from '../data/canon';
import { X, Copy, Check, Trash2, BookOpen, Quote, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SideNotesPane: React.FC = () => {
  const {
    isNotesOpen,
    setIsNotesOpen,
    primaryPlace,
    getNote,
    saveNote,
    deleteNote,
    notes,
    setPrimaryPlace
  } = useReader();

  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [content, setContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const currentBookMeta = findBookBySlug(primaryPlace.book);
  const currentBookName =
    primaryPlace.translation === 'segond'
      ? currentBookMeta?.nameFr || primaryPlace.book
      : primaryPlace.translation === 'synodal'
      ? currentBookMeta?.nameRu || primaryPlace.book
      : currentBookMeta?.name || primaryPlace.book;

  // Load note when passage changes or pane opens
  useEffect(() => {
    if (isNotesOpen) {
      const savedText = getNote(primaryPlace.book, primaryPlace.chapter);
      setContent(savedText);
      if (activeTab === 'current') {
        setTimeout(() => textareaRef.current?.focus(), 150);
      }
    }
  }, [primaryPlace.book, primaryPlace.chapter, isNotesOpen, getNote, activeTab]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setContent(next);
    saveNote(primaryPlace.book, primaryPlace.chapter, next);
  };

  const handleInsertVerse = () => {
    const verseQuote = `\n[${currentBookName} ${primaryPlace.chapter}:${primaryPlace.verse}]\n`;
    const next = (content ? content + '\n' : '') + verseQuote;
    setContent(next);
    saveNote(primaryPlace.book, primaryPlace.chapter, next);
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleClear = () => {
    if (window.confirm('Clear your notes for this chapter?')) {
      setContent('');
      deleteNote(primaryPlace.book, primaryPlace.chapter);
    }
  };

  const handleJumpToNote = (key: string) => {
    const parts = key.split('_');
    if (parts.length >= 2) {
      const bookSlug = parts[0];
      const chapterNum = parseInt(parts[1], 10) || 1;
      setPrimaryPlace({
        book: bookSlug,
        chapter: chapterNum
      });
      navigate(`/${primaryPlace.translation}/${bookSlug}/${chapterNum}`);
      setActiveTab('current');
    }
  };

  // Convert notes record to array for "All Notes" view
  const allNotesList = Object.entries(notes)
    .filter(([_, item]) => item.text.trim().length > 0)
    .map(([key, item]) => {
      const [bookSlug, chapterStr] = key.split('_');
      const bMeta = findBookBySlug(bookSlug);
      const bName =
        primaryPlace.translation === 'segond'
          ? bMeta?.nameFr || bookSlug
          : primaryPlace.translation === 'synodal'
          ? bMeta?.nameRu || bookSlug
          : bMeta?.name || bookSlug;
      return {
        key,
        bookSlug,
        chapter: parseInt(chapterStr, 10) || 1,
        bookName: bName,
        text: item.text,
        updatedAt: item.updatedAt
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  if (!isNotesOpen) return null;

  return (
    <>
      {/* Backdrop for mobile closing */}
      <div className="side-notes-backdrop" onClick={() => setIsNotesOpen(false)} />

      {/* 40% side drawer panel */}
      <aside
        className="side-notes-pane"
        role="complementary"
        aria-label="Marginalia and Study Notes"
      >
        {/* Header */}
        <div className="side-notes-header">
          <div className="side-notes-title-group">
            <FileText size={16} className="side-notes-icon" />
            <div className="side-notes-title">
              {activeTab === 'current'
                ? `${currentBookName} ${primaryPlace.chapter}`
                : 'Study Journal'}
            </div>
          </div>

          <div className="side-notes-actions">
            <button
              className="side-notes-btn"
              onClick={() => setActiveTab(t => (t === 'current' ? 'all' : 'current'))}
              title={activeTab === 'current' ? 'View all saved notes' : 'Back to current chapter'}
            >
              {activeTab === 'current' ? 'All Notes' : 'This Chapter'}
            </button>

            <button
              className="side-notes-close"
              onClick={() => setIsNotesOpen(false)}
              aria-label="Close notes pane"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        {activeTab === 'current' ? (
          <div className="side-notes-body">
            {/* Quick toolbar */}
            <div className="side-notes-toolbar">
              <button
                className="side-notes-tool-btn"
                onClick={handleInsertVerse}
                title="Insert current verse marker"
              >
                <Quote size={13} />
                <span>Verse {primaryPlace.verse}</span>
              </button>

              <div className="side-notes-toolbar-right">
                <button
                  className="side-notes-tool-btn"
                  onClick={handleCopy}
                  title="Copy notes"
                  disabled={!content.trim()}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {content.trim() && (
                  <button
                    className="side-notes-tool-btn side-notes-tool-danger"
                    onClick={handleClear}
                    title="Clear chapter notes"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Note Textarea */}
            <textarea
              ref={textareaRef}
              className="side-notes-textarea"
              placeholder={`Jot your thoughts, prayers, reflections, and insights for ${currentBookName} ${primaryPlace.chapter}...\n\nNotes auto-save as you type.`}
              value={content}
              onChange={handleTextChange}
            />

            <div className="side-notes-footer-hint">
              Auto-saved locally • Accessible offline
            </div>
          </div>
        ) : (
          <div className="side-notes-all-list">
            {allNotesList.length === 0 ? (
              <div className="side-notes-empty">
                <FileText size={28} opacity={0.3} />
                <p>No saved notes yet.</p>
                <span>Write reflections on any chapter and they will appear here.</span>
              </div>
            ) : (
              allNotesList.map(item => (
                <div
                  key={item.key}
                  className="side-notes-card"
                  onClick={() => handleJumpToNote(item.key)}
                >
                  <div className="side-notes-card-header">
                    <span className="side-notes-card-title">
                      {item.bookName} {item.chapter}
                    </span>
                    <ChevronRight size={14} className="side-notes-card-arrow" />
                  </div>
                  <p className="side-notes-card-preview">{item.text}</p>
                  <span className="side-notes-card-date">
                    {new Date(item.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </aside>
    </>
  );
};
