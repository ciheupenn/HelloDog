/**
 * Direct Story Access - Bypass Storage Issues
 * 
 * This creates a direct path from story generation to reader display,
 * ensuring character-based images are immediately available.
 */

import type { CreateStoryResult } from '@/types/story'

// Memory cache for immediate story access
const immediateStoryCache = new Map<string, CreateStoryResult>()

export function cacheStoryImmediate(story: CreateStoryResult): void {
  console.log('🚀 IMMEDIATE: Caching story for instant access:', story.storyId)
  immediateStoryCache.set(story.storyId, story)
  
  // Auto-cleanup after 10 minutes to prevent memory leaks
  setTimeout(() => {
    immediateStoryCache.delete(story.storyId)
    console.log('🧹 IMMEDIATE: Cleaned up story cache:', story.storyId)
  }, 10 * 60 * 1000)
}

export function getStoryImmediate(storyId: string): CreateStoryResult | undefined {
  console.log('⚡ IMMEDIATE: Getting story:', storyId)
  const story = immediateStoryCache.get(storyId)
  console.log('⚡ IMMEDIATE: Found:', !!story)
  return story
}

export function clearStoryCache(): void {
  immediateStoryCache.clear()
  console.log('🧹 IMMEDIATE: Cleared all story cache')
}
