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

export type FontSize = "small" | "medium" | "large" | "xlarge";
