export interface Word {
  id: string;
  lemma: string;
  status: 'unknown' | 'known';
  pos?: string;
}

export interface VocabSet {
  unknown: Word[];
  known: Word[];
}

export interface StorySettings {
  wordsToInclude: number;
  translationLocale: 'none' | string;
  guidanceText?: string;
  styleImageUrl?: string;
}

export interface StoryPage {
  no: number;
  text: string;
  imageUrl?: string;
}

export interface Story {
  id: string;
  pages: StoryPage[];
  targets: { lemma: string; count: number }[];
}

export interface Definition {
  word: string;
  definitionEN: string;
  pos?: string;
}
