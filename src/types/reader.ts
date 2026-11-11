export type ThemeMode = 'white' | 'black' | 'glass';

export interface PlaceReference {
  translation: string;
  book: string;
  chapter: number;
  verse: number;
}

export type HighlightStyle = 'pencil' | 'highlighter' | 'wavy' | 'double';
export type HighlightColor = 'monochrome' | 'amber' | 'sage' | 'rose' | 'azure';

export interface HighlightItem {
  id: string;
  translation: string;
  book: string;
  chapter: number;
  verse: number;
  startOffset: number;
  endOffset: number;
  text: string;
  createdAt: number;
  style?: HighlightStyle;
  color?: HighlightColor;
}

export interface ReaderSettings {
  primaryTranslation: string;
  comparisonTranslation: string;
  theme: ThemeMode;
  fontScale: number; // e.g. 100, 115, 130
}

export interface PlanReadingRef {
  book: string;
  chapter: number;
  display: string;
}

export interface PlanDay {
  day: number;
  title: string;
  focus?: string;
  readings: PlanReadingRef[];
  completed?: boolean;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  createdAt: number;
  days: PlanDay[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  planProposal?: ReadingPlan;
}

export interface ChapterNote {
  id: string;
  book: string;
  chapter: number;
  content: string;
  updatedAt: number;
}
