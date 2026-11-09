import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThemeMode, HighlightItem, PlaceReference, ReaderSettings, ReadingPlan, ChatMessage } from '../types/reader';
import { TRANSLATIONS, getTranslation } from '../data/translations';
import { findBookBySlug, CANON } from '../data/canon';
import { mapPsalmReference } from '../data/psalmsMapping';

export type SheetType = 'book-primary' | 'book-comparison' | 'gear' | 'plans' | 'chat' | null;

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
  activeSheet: SheetType;
  setActiveSheet: (sheet: SheetType) => void;

  // Highlights
  highlights: HighlightItem[];
  addHighlight: (item: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  removeHighlight: (id: string) => void;
  updateHighlight: (id: string, updates: Partial<HighlightItem>) => void;

  // Reading Plans
  plans: ReadingPlan[];
  addPlan: (plan: ReadingPlan) => void;
  removePlan: (planId: string) => void;
  togglePlanDayCompleted: (planId: string, dayNumber: number) => void;
  activePlanId: string | null;
  setActivePlanId: (id: string | null) => void;

  // Chatbot
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

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
  SPLIT_RATIO: 'lectio_split_ratio',
  PLANS: 'lectio_plans',
  ACTIVE_PLAN_ID: 'lectio_active_plan_id',
  CHAT: 'lectio_chat_history'
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
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

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

  // Reading Plans state
  const [plans, setPlans] = useState<ReadingPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Starter plan matching user's specific request: Jeremiah & Revelation 30 days
    return [
      {
        id: 'plan-jeremiah-revelation-30',
        title: "Jeremiah & Revelation: 30-Day Prophetic Journey",
        description: "A 30-day contemplative reading plan weaving Jeremiah's prophecies of divine covenant and judgment with Revelation's visions of ultimate renewal and the New Jerusalem.",
        durationDays: 30,
        createdAt: Date.now() - 86400000,
        days: Array.from({ length: 30 }, (_, i) => {
          const d = i + 1;
          const jerCh = Math.min(52, d * 1);
          const revCh = Math.min(22, Math.max(1, Math.round((d / 30) * 22)));
          return {
            day: d,
            title: d === 1
              ? "The Call & The Glorious Christ"
              : d === 30
              ? "The Final Consummation & River of Life"
              : `Prophecy & Vision: Day ${d}`,
            focus: d === 1
              ? "God's sovereignty in calling His prophet; Christ revealed amidst seven lampstands."
              : d === 30
              ? "The New Jerusalem descending; no more tears, curse, or night."
              : `Exploring thematic threads of redemption between Jeremiah ${jerCh} and Revelation ${revCh}.`,
            readings: [
              { book: 'jeremiah', chapter: jerCh, display: `Jeremiah ${jerCh}` },
              { book: 'revelation', chapter: revCh, display: `Revelation ${revCh}` }
            ],
            completed: d === 1
          };
        })
      }
    ];
  });

  const [activePlanId, setActivePlanIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID) || 'plan-jeremiah-revelation-30';
    } catch {
      return 'plan-jeremiah-revelation-30';
    }
  });

  // Gemini Chatbot message history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: "Grace and peace. I am your Lectio Guide. I can help explore scriptural themes, trace historical connections between biblical texts, or design personalized reading plans tailored to your spiritual inquiry.\n\nFor example, ask me: *\"Create a 30-day plan for Jeremiah linked to Revelation\"*, or *\"Give me a 14-day study on Wisdom in the Psalms and Proverbs\"*.",
        timestamp: Date.now()
      }
    ];
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch {}
  }, [plans]);

  useEffect(() => {
    try {
      if (activePlanId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, activePlanId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAN_ID);
      }
    } catch {}
  }, [activePlanId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

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

  // Reading Plan Actions
  const addPlan = useCallback((plan: ReadingPlan) => {
    setPlans(prev => [plan, ...prev.filter(p => p.id !== plan.id)]);
    setActivePlanIdState(plan.id);
  }, []);

  const removePlan = useCallback((planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    setActivePlanIdState(prev => (prev === planId ? null : prev));
  }, []);

  const togglePlanDayCompleted = useCallback((planId: string, dayNumber: number) => {
    setPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        return {
          ...p,
          days: p.days.map(d =>
            d.day === dayNumber ? { ...d, completed: !d.completed } : d
          )
        };
      })
    );
  }, []);

  const setActivePlanId = useCallback((id: string | null) => {
    setActivePlanIdState(id);
  }, []);

  // Chat Actions
  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
  }, []);

  const clearChat = useCallback(() => {
    setChatMessages([
      {
        id: 'msg-welcome-new',
        role: 'model',
        text: "Conversation cleared. How may I assist your reading or study plan today?",
        timestamp: Date.now()
      }
    ]);
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
        plans,
        addPlan,
        removePlan,
        togglePlanDayCompleted,
        activePlanId,
        setActivePlanId,
        chatMessages,
        addChatMessage,
        clearChat,
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
