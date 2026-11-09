import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThemeMode, HighlightItem, PlaceReference, ReaderSettings } from '../types/reader';
import { TRANSLATIONS, getTranslation } from '../data/translations';
import { findBookBySlug, CANON } from '../data/canon';
import { mapPsalmReference } from '../data/psalmsMapping';

interface ReaderContextType {
  // Settings
  primaryTranslation: string;
  setPrimaryTranslation: (trans: string) => void;
  comparisonTranslation: string;
  setComparisonTranslation: (trans: string) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;

  // Split state
  isSplit: boolean;
  setIsSplit: (split: boolean) => void;
  toggleSplit: () => void;
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;

  // Dock state
  dockCollapsed: boolean;
  setDockCollapsed: (collapsed: boolean) => void;

  // References & Places
  primaryPlace: PlaceReference;
  setPrimaryPlace: (place: Partial<PlaceReference>) => void;
  comparisonPlace: PlaceReference;
  setComparisonPlace: (place: Partial<PlaceReference>) => void;

  // Sheets
  activeSheet: 'book-primary' | 'book-comparison' | 'gear' | null;
  setActiveSheet: (sheet: 'book-primary' | 'book-comparison' | 'gear' | null) => void;

  // Highlights
  highlights: HighlightItem[];
  addHighlight: (item: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  removeHighlight: (id: string) => void;
  updateHighlight: (id: string, updates: Partial<HighlightItem>) => void;

  // Synchronized scroll trigger
  syncScrollDelta: number;
  triggerSyncScroll: (deltaY: number) => void;
}

const STORAGE_KEYS = {
  SETTINGS: 'lectio_settings',
  PRIMARY_PLACE: 'lectio_place_primary',
  COMPARISON_PLACE: 'lectio_place_comparison',
  HIGHLIGHTS: 'lectio_highlights',
  IS_SPLIT: 'lectio_is_split',
  SPLIT_RATIO: 'lectio_split_ratio'
};

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
    return {
      primaryTranslation: 'kjv',
      comparisonTranslation: 'segond',
      theme: 'white',
      fontScale: 100
    };
  });

  const [isSplit, setIsSplitState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_SPLIT) === 'true';
    } catch {
      return false;
    }
  });

  const [splitRatio, setSplitRatioState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPLIT_RATIO);
      return saved ? parseFloat(saved) : 60;
    } catch {
      return 60;
    }
  });

  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [activeSheet, setActiveSheet] = useState<'book-primary' | 'book-comparison' | 'gear' | null>(null);

  const [primaryPlace, setPrimaryPlaceState] = useState<PlaceReference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY_PLACE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { translation: 'kjv', book: 'john', chapter: 3, verse: 16 };
  });

  const [comparisonPlace, setComparisonPlaceState] = useState<PlaceReference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPARISON_PLACE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { translation: 'segond', book: 'john', chapter: 3, verse: 16 };
  });

  const [highlights, setHighlights] = useState<HighlightItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [syncScrollDelta, setSyncScrollDelta] = useState<number>(0);

  // Sync settings to localStorage and document element
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_SPLIT, String(isSplit));
    } catch {}
  }, [isSplit]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SPLIT_RATIO, String(splitRatio));
    } catch {}
  }, [splitRatio]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRIMARY_PLACE, JSON.stringify(primaryPlace));
    } catch {}
  }, [primaryPlace]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPARISON_PLACE, JSON.stringify(comparisonPlace));
    } catch {}
  }, [comparisonPlace]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
    } catch {}
  }, [highlights]);

  const setPrimaryTranslation = useCallback((trans: string) => {
    setSettings(prev => ({ ...prev, primaryTranslation: trans }));
    setPrimaryPlaceState(prev => ({ ...prev, translation: trans }));
  }, []);

  const setComparisonTranslation = useCallback((trans: string) => {
    setSettings(prev => ({ ...prev, comparisonTranslation: trans }));
    setComparisonPlaceState(prev => {
      // If Psalms, check mapping
      if (prev.book === 'psalms') {
        const mapped = mapPsalmReference(prev.translation, trans, prev.chapter, prev.verse);
        return { ...prev, translation: trans, chapter: mapped.psalm, verse: mapped.verse };
      }
      return { ...prev, translation: trans };
    });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setFontScale = useCallback((fontScale: number) => {
    setSettings(prev => ({ ...prev, fontScale }));
  }, []);

  const setIsSplit = useCallback((split: boolean) => {
    setIsSplitState(split);
    if (split) {
      // When opening split, synchronize comparison translation place with primary
      setComparisonPlaceState(prev => {
        const targetTrans = settings.comparisonTranslation;
        if (primaryPlace.book === 'psalms') {
          const mapped = mapPsalmReference(primaryPlace.translation, targetTrans, primaryPlace.chapter, primaryPlace.verse);
          return {
            translation: targetTrans,
            book: 'psalms',
            chapter: mapped.psalm,
            verse: mapped.verse
          };
        } else {
          return {
            translation: targetTrans,
            book: primaryPlace.book,
            chapter: primaryPlace.chapter,
            verse: primaryPlace.verse
          };
        }
      });
    }
  }, [primaryPlace, settings.comparisonTranslation]);

  const toggleSplit = useCallback(() => {
    setIsSplit(!isSplit);
  }, [isSplit, setIsSplit]);

  const setSplitRatio = useCallback((ratio: number) => {
    setSplitRatioState(Math.max(25, Math.min(75, ratio)));
  }, []);

  const setPrimaryPlace = useCallback((place: Partial<PlaceReference>) => {
    setPrimaryPlaceState(prev => {
      if (
        (place.verse === undefined || place.verse === prev.verse) &&
        (place.chapter === undefined || place.chapter === prev.chapter) &&
        (place.book === undefined || place.book === prev.book) &&
        (place.translation === undefined || place.translation === prev.translation)
      ) {
        return prev;
      }
      return { ...prev, ...place };
    });
  }, []);

  const setComparisonPlace = useCallback((place: Partial<PlaceReference>) => {
    setComparisonPlaceState(prev => {
      if (
        (place.verse === undefined || place.verse === prev.verse) &&
        (place.chapter === undefined || place.chapter === prev.chapter) &&
        (place.book === undefined || place.book === prev.book) &&
        (place.translation === undefined || place.translation === prev.translation)
      ) {
        return prev;
      }
      return { ...prev, ...place };
    });
  }, []);

  const addHighlight = useCallback((item: Omit<HighlightItem, 'id' | 'createdAt'>) => {
    const newHighlight: HighlightItem = {
      ...item,
      id: `${item.translation}-${item.book}-${item.chapter}-${item.verse}-${item.startOffset}-${Date.now()}`,
      createdAt: Date.now()
    };
    setHighlights(prev => [newHighlight, ...prev]);
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  }, []);

  const updateHighlight = useCallback((id: string, updates: Partial<HighlightItem>) => {
    setHighlights(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const triggerSyncScroll = useCallback((deltaY: number) => {
    window.dispatchEvent(new CustomEvent('lectio:sync-scroll', { detail: { deltaY } }));
  }, []);

  return (
    <ReaderContext.Provider
      value={{
        primaryTranslation: settings.primaryTranslation,
        setPrimaryTranslation,
        comparisonTranslation: settings.comparisonTranslation,
        setComparisonTranslation,
        theme: settings.theme,
        setTheme,
        fontScale: settings.fontScale,
        setFontScale,
        isSplit,
        setIsSplit,
        toggleSplit,
        splitRatio,
        setSplitRatio,
        dockCollapsed,
        setDockCollapsed,
        primaryPlace,
        setPrimaryPlace,
        comparisonPlace,
        setComparisonPlace,
        activeSheet,
        setActiveSheet,
        highlights,
        addHighlight,
        removeHighlight,
        updateHighlight,
        syncScrollDelta,
        triggerSyncScroll
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
}
