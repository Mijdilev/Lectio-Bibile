import React from 'react';
import { useReader } from '../context/ReaderContext';
import { TRANSLATIONS } from '../data/translations';
import { findBookBySlug } from '../data/canon';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Columns, Sun, Moon } from 'lucide-react';

export const GearSheet: React.FC = () => {
  const {
    activeSheet,
    setActiveSheet,
    primaryTranslation,
    setPrimaryTranslation,
    comparisonTranslation,
    setComparisonTranslation,
    theme,
    setTheme,
    fontScale,
    setFontScale,
    highlights,
    removeHighlight,
    setPrimaryPlace,
    primaryPlace,
    isSplit,
    setIsSplit
  } = useReader();

  const navigate = useNavigate();

  if (activeSheet !== 'gear') return null;

  const handleFontChange = (delta: number) => {
    const next = Math.max(80, Math.min(150, fontScale + delta));
    setFontScale(next);
  };

  const handleSelectPrimaryTrans = (id: string) => {
    setPrimaryTranslation(id);
    navigate(`/${id}/${primaryPlace.book}/${primaryPlace.chapter}`);
  };

  const handleJumpToPhrase = (hl: typeof highlights[0]) => {
    setPrimaryPlace({
      translation: hl.translation,
      book: hl.book,
      chapter: hl.chapter,
      verse: hl.verse
    });
    setPrimaryTranslation(hl.translation);
    setActiveSheet(null);
    navigate(`/${hl.translation}/${hl.book}/${hl.chapter}`);
    // Scroll to verse after navigation
    setTimeout(() => {
      const el = document.getElementById(`verse-primary-${hl.verse}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="sheet-backdrop" onClick={() => setActiveSheet(null)}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          <div className="sheet-title">Reading Settings</div>
          <button
            className="sheet-close-btn"
            onClick={() => setActiveSheet(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sheet-body">
          {/* Theme Option: Flat White & AMOLED Black */}
          <div className="gear-section">
            <div className="gear-section-label">Theme</div>
            <div className="gear-row">
              <button
                className={`gear-toggle-btn ${theme === 'white' ? 'active' : ''}`}
                onClick={() => setTheme('white')}
              >
                <Sun size={16} />
                <span>White</span>
              </button>
              <button
                className={`gear-toggle-btn ${theme === 'black' ? 'active' : ''}`}
                onClick={() => setTheme('black')}
              >
                <Moon size={16} />
                <span>AMOLED Black</span>
              </button>
            </div>
          </div>

          {/* Type Size Stepper */}
          <div className="gear-section">
            <div className="gear-section-label">Type Size</div>
            <div className="font-size-stepper">
              <button className="stepper-btn" onClick={() => handleFontChange(-10)}>
                A−
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {fontScale}%
              </span>
              <button className="stepper-btn" onClick={() => handleFontChange(10)}>
                A+
              </button>
            </div>
          </div>

          {/* Primary Translation */}
          <div className="gear-section">
            <div className="gear-section-label">Primary Translation</div>
            <div className="gear-row" style={{ flexWrap: 'wrap' }}>
              {TRANSLATIONS.map(t => (
                <button
                  key={t.id}
                  className={`gear-toggle-btn ${primaryTranslation === t.id ? 'active' : ''}`}
                  onClick={() => handleSelectPrimaryTrans(t.id)}
                  style={{ minWidth: '45%' }}
                >
                  <span style={{ fontWeight: 600 }}>{t.shortName}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{t.language}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Translation */}
          <div className="gear-section">
            <div className="gear-section-label">Comparison Translation (Split View)</div>
            <div className="gear-row" style={{ flexWrap: 'wrap' }}>
              {TRANSLATIONS.map(t => (
                <button
                  key={`comp-${t.id}`}
                  className={`gear-toggle-btn ${comparisonTranslation === t.id ? 'active' : ''}`}
                  onClick={() => setComparisonTranslation(t.id)}
                  style={{ minWidth: '45%' }}
                >
                  <span style={{ fontWeight: 600 }}>{t.shortName}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{t.language}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Mode Toggle Button */}
          <div className="gear-section">
            <div className="gear-section-label">Reading Panes</div>
            <button
              className={`gear-toggle-btn ${isSplit ? 'active' : ''}`}
              onClick={() => setIsSplit(!isSplit)}
              style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Columns size={16} />
              <span>{isSplit ? 'Close Split View' : 'Open Split View'}</span>
            </button>
          </div>

          {/* Saved Phrases */}
          <div className="gear-section">
            <div className="gear-section-label">
              Saved Phrases ({highlights.length})
            </div>
            {highlights.length === 0 ? (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  padding: '0.5rem 0'
                }}
              >
                Select words in the text to save phrases with a clean underline.
              </div>
            ) : (
              <div className="saved-phrases-list">
                {highlights.map(hl => {
                  const book = findBookBySlug(hl.book);
                  const bookName = book?.name || hl.book;
                  return (
                    <div
                      key={hl.id}
                      className="saved-phrase-item"
                      onClick={() => handleJumpToPhrase(hl)}
                    >
                      <div className="saved-phrase-text">
                        "{hl.text}"
                      </div>
                      <div className="saved-phrase-ref">
                        {bookName} {hl.chapter}:{hl.verse} ({hl.translation.toUpperCase()})
                      </div>
                      <button
                        className="saved-phrase-delete"
                        onClick={e => {
                          e.stopPropagation();
                          removeHighlight(hl.id);
                        }}
                        title="Delete highlight"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
