import React, { useState } from 'react';
import { useReader } from '../context/ReaderContext';
import { CANON, BookMeta } from '../data/canon';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft } from 'lucide-react';

interface BookSheetProps {
  target: 'primary' | 'comparison';
}

export const BookSheet: React.FC<BookSheetProps> = ({ target }) => {
  const {
    activeSheet,
    setActiveSheet,
    primaryTranslation,
    comparisonTranslation,
    setPrimaryPlace,
    setComparisonPlace
  } = useReader();

  const navigate = useNavigate();
  const currentTrans = target === 'primary' ? primaryTranslation : comparisonTranslation;

  const [testament, setTestament] = useState<'OT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null);

  if (activeSheet !== (target === 'primary' ? 'book-primary' : 'book-comparison')) {
    return null;
  }

  const books = CANON.filter(b => b.testament === testament);

  const getLocalizedBookName = (b: BookMeta) => {
    if (currentTrans === 'segond') return b.nameFr;
    if (currentTrans === 'synodal') return b.nameRu;
    return b.name;
  };

  const handleSelectChapter = (chapterNum: number) => {
    if (!selectedBook) return;

    if (target === 'primary') {
      setPrimaryPlace({
        translation: primaryTranslation,
        book: selectedBook.slug,
        chapter: chapterNum,
        verse: 1
      });
      navigate(`/${primaryTranslation}/${selectedBook.slug}/${chapterNum}`);
    } else {
      setComparisonPlace({
        translation: comparisonTranslation,
        book: selectedBook.slug,
        chapter: chapterNum,
        verse: 1
      });
    }

    setActiveSheet(null);
  };

  return (
    <div className="sheet-backdrop" onClick={() => setActiveSheet(null)}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          {selectedBook ? (
            <button
              className="sheet-close-btn"
              onClick={() => setSelectedBook(null)}
              aria-label="Back to books"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="sheet-title">Select Book</div>
          )}

          {selectedBook && (
            <div className="sheet-title">{getLocalizedBookName(selectedBook)}</div>
          )}

          <button
            className="sheet-close-btn"
            onClick={() => setActiveSheet(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sheet-body">
          {!selectedBook ? (
            <>
              {/* Testament Tabs */}
              <div className="testament-tab-bar">
                <button
                  className={`testament-tab ${testament === 'OT' ? 'active' : ''}`}
                  onClick={() => setTestament('OT')}
                >
                  Old Testament
                </button>
                <button
                  className={`testament-tab ${testament === 'NT' ? 'active' : ''}`}
                  onClick={() => setTestament('NT')}
                >
                  New Testament
                </button>
              </div>

              {/* Books Grid */}
              <div className="books-grid">
                {books.map(b => (
                  <button
                    key={b.id}
                    className="book-btn"
                    onClick={() => {
                      if (b.chapters === 1) {
                        handleSelectChapter(1);
                      } else {
                        setSelectedBook(b);
                      }
                    }}
                  >
                    <span>{getLocalizedBookName(b)}</span>
                    <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>{b.chapters}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Chapters Grid */
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                Select Chapter
              </div>
              <div className="chapters-grid">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => (
                  <button
                    key={c}
                    className="chapter-btn"
                    onClick={() => handleSelectChapter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
