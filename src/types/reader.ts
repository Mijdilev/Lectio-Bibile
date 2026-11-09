export type ThemeMode = 'white' | 'black';

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
