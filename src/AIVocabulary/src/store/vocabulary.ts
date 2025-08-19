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
  words: [
    // Demo words - 28 unknown, 2 known = 30 total (25 visible + 5 scrollable)
    { id: 'word-1', lemma: 'catalyst', status: 'unknown', pos: 'noun' },
    { id: 'word-2', lemma: 'ambiguous', status: 'unknown', pos: 'adjective' },
    { id: 'word-3', lemma: 'paradigm', status: 'unknown', pos: 'noun' },
    { id: 'word-4', lemma: 'synthesis', status: 'unknown', pos: 'noun' },
    { id: 'word-5', lemma: 'phenomenon', status: 'unknown', pos: 'noun' },
    { id: 'word-6', lemma: 'comprehensive', status: 'unknown', pos: 'adjective' },
    { id: 'word-7', lemma: 'empirical', status: 'unknown', pos: 'adjective' },
    { id: 'word-8', lemma: 'hypothesis', status: 'unknown', pos: 'noun' },
    { id: 'word-9', lemma: 'substantial', status: 'unknown', pos: 'adjective' },
    { id: 'word-10', lemma: 'unprecedented', status: 'unknown', pos: 'adjective' },
    { id: 'word-11', lemma: 'configuration', status: 'unknown', pos: 'noun' },
    { id: 'word-12', lemma: 'correlation', status: 'unknown', pos: 'noun' },
    { id: 'word-13', lemma: 'inevitable', status: 'unknown', pos: 'adjective' },
    { id: 'word-14', lemma: 'fluctuation', status: 'unknown', pos: 'noun' },
    { id: 'word-15', lemma: 'plausible', status: 'unknown', pos: 'adjective' },
    { id: 'word-16', lemma: 'coherent', status: 'unknown', pos: 'adjective' },
    { id: 'word-17', lemma: 'eloquent', status: 'unknown', pos: 'adjective' },
    { id: 'word-18', lemma: 'meticulous', status: 'unknown', pos: 'adjective' },
    { id: 'word-19', lemma: 'pragmatic', status: 'unknown', pos: 'adjective' },
    { id: 'word-20', lemma: 'sophisticated', status: 'unknown', pos: 'adjective' },
    { id: 'word-21', lemma: 'perpetual', status: 'unknown', pos: 'adjective' },
    { id: 'word-22', lemma: 'intricate', status: 'unknown', pos: 'adjective' },
    { id: 'word-23', lemma: 'autonomous', status: 'unknown', pos: 'adjective' },
    { id: 'word-24', lemma: 'resilient', status: 'unknown', pos: 'adjective' },
    { id: 'word-25', lemma: 'innovative', status: 'unknown', pos: 'adjective' },
    { id: 'word-26', lemma: 'dynamic', status: 'unknown', pos: 'adjective' },
    { id: 'word-27', lemma: 'strategic', status: 'unknown', pos: 'adjective' },
    { id: 'word-28', lemma: 'fundamental', status: 'unknown', pos: 'adjective' },
    { id: 'word-29', lemma: 'serendipity', status: 'known', pos: 'noun' },
    { id: 'word-30', lemma: 'ubiquitous', status: 'known', pos: 'adjective' },
  ],
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
