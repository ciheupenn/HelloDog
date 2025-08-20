import type { CreateStoryResult } from '@/types/story'

// In-memory storage for demo purposes
// In production, this would use a database like Redis, PostgreSQL, etc.
const storyStorage = new Map<string, CreateStoryResult>()

export function storeStory(story: CreateStoryResult): void {
  console.log('📦 STORAGE: Storing story:', story.storyId)
  storyStorage.set(story.storyId, story)
  console.log('📦 STORAGE: Total stories in storage:', storyStorage.size)
  console.log('📦 STORAGE: Story keys:', Array.from(storyStorage.keys()))
}

export function getStory(storyId: string): CreateStoryResult | undefined {
  console.log('🔍 STORAGE: Looking for story:', storyId)
  console.log('🔍 STORAGE: Available stories:', Array.from(storyStorage.keys()))
  console.log('🔍 STORAGE: Storage size:', storyStorage.size)
  
  const story = storyStorage.get(storyId)
  console.log('🔍 STORAGE: Found story:', !!story)
  
  return story
}

export function deleteStory(storyId: string): boolean {
  return storyStorage.delete(storyId)
}

export function getAllStories(): CreateStoryResult[] {
  return Array.from(storyStorage.values())
}
