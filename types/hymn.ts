export interface Hymn {
  id: string;
  number: number;
  title: string;
  titleBemba?: string;
  lyrics?: string;
  lyricsBemba?: string;
  verses: string[];
  versesBemba?: string[];
  category?: string;
  author?: string;
}

export type TextScale = 0.85 | 1.0 | 1.2 | 1.4;
