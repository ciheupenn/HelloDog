import { create } from 'zustand'
import { Word, StorySettings } from '@/types'

interface VocabularyState {
  words: Word[]
  recentActions: Array<{ type: 'toggle' | 'define'; word: Word; previousStatus?: 'unknown' | 'known' }>
  storySettings: StorySettings
  
  // Actions
  setWords: (words: Word[]) => void
  toggleWordStatus: (wordId: string) => void
  undoLastAction: () => void
  updateStorySettings: (settings: Partial<StorySettings>) => void
  clearRecentActions: () => void
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  words: [],
  recentActions: [],
  storySettings: {
    wordsToInclude: 18,
    translationLocale: 'none',
  },

  setWords: (words) => set({ words, recentActions: [] }),

  toggleWordStatus: (wordId) => set((state) => {
    const wordIndex = state.words.findIndex(w => w.id === wordId)
    if (wordIndex === -1) return state

    const word = state.words[wordIndex]
    const newStatus = word.status === 'unknown' ? 'known' : 'unknown'
    
    const updatedWords = [...state.words]
    updatedWords[wordIndex] = { ...word, status: newStatus }

    const newAction = {
      type: 'toggle' as const,
      word: { ...word },
      previousStatus: word.status,
    }

    return {
      words: updatedWords,
      recentActions: [newAction, ...state.recentActions.slice(0, 9)] // Keep last 10 actions
    }
  }),

  undoLastAction: () => set((state) => {
    if (state.recentActions.length === 0) return state

    const [lastAction, ...remainingActions] = state.recentActions
    
    if (lastAction.type === 'toggle' && lastAction.previousStatus) {
      const wordIndex = state.words.findIndex(w => w.id === lastAction.word.id)
      if (wordIndex === -1) return { recentActions: remainingActions }

      const updatedWords = [...state.words]
      updatedWords[wordIndex] = { ...updatedWords[wordIndex], status: lastAction.previousStatus }

      return {
        words: updatedWords,
        recentActions: remainingActions
      }
    }

    return { recentActions: remainingActions }
  }),

  updateStorySettings: (settings) => set((state) => ({
    storySettings: { ...state.storySettings, ...settings }
  })),

  clearRecentActions: () => set({ recentActions: [] }),
}))
