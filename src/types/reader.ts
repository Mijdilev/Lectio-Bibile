export type ThemeMode = 'white' | 'black';

export interface PlaceReference {
  translation: string;
  book: string;
  chapter: number;
  verse: number;
}

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
}

export interface ReaderSettings {
  primaryTranslation: string;
  comparisonTranslation: string;
  theme: ThemeMode;
  fontScale: number; // e.g. 100, 115, 130
}
