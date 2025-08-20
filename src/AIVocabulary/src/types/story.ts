export type StoryPage = {
  no: number;
  text: string;
  imageUrl?: string;
  audioUrl?: string | null;
};

export type StoryTargets = {
  lemma: string;
  count: 0 | 1 | 2;
}[];

export type CreateStoryResult = {
  storyId: string;
  title?: string;
  pages: StoryPage[];
  targets: StoryTargets;
  settings: {
    wordsToInclude: number;
    translationLocale: 'none' | string;
    guidanceText?: string;
    styleImageUrl?: string;
  };
};

export type ExposureMap = Record<string, { page: number; countOnPage: number }[]>;

export type ReaderState = {
  pageIndex: number;
  isPlaying: boolean;
  currentParagraphIndex: number;
  activeTarget?: string | null;
  story: CreateStoryResult;
  exposureMap: ExposureMap;
};
