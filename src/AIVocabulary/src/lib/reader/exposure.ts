import type { CreateStoryResult, ExposureMap } from '@/types/story';

/**
 * Precompute per-page word occurrences for highlighting
 */
export function computeExposureMap(story: CreateStoryResult): ExposureMap {
  const exposureMap: ExposureMap = {};

  // Initialize map with target words
  story.targets.forEach(target => {
    exposureMap[target.lemma] = [];
  });

  // Count occurrences per page
  story.pages.forEach((page, pageIndex) => {
    const text = page.text.toLowerCase();
    
    story.targets.forEach(target => {
      const lemma = target.lemma.toLowerCase();
      const regex = new RegExp(`\\b${lemma}\\b`, 'gi');
      const matches = text.match(regex);
      const countOnPage = matches ? matches.length : 0;
      
      if (countOnPage > 0) {
        exposureMap[target.lemma].push({
          page: pageIndex,
          countOnPage
        });
      }
    });
  });

  return exposureMap;
}

/**
 * Get word count for current page
 */
export function getPageWordCount(text: string, targetWord: string): number {
  const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
