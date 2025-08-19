'use client'

import React from 'react'
import { useVocabularyStore } from '@/store/vocabulary'
import { cn } from '@/lib/utils'

interface StorySetupProps {
  onCreateStory: () => void
  disabled?: boolean
}

export default function StorySetup({ onCreateStory, disabled = false }: StorySetupProps) {
  const { words, storySettings, updateStorySettings } = useVocabularyStore()
  
  const unknownWords = words.filter(w => w.status === 'unknown')
  const availableWords = unknownWords.length
  const maxWords = 100  // Always allow up to 100 words
  const minWords = Math.min(10, availableWords)
  
  const canCreateStory = availableWords > 0 && !disabled

  const handleWordsToIncludeChange = (value: number) => {
    const clampedValue = Math.max(minWords, Math.min(maxWords, value))
    updateStorySettings({ wordsToInclude: clampedValue })
  }

  const handleTranslationChange = (value: string) => {
    updateStorySettings({ translationLocale: value })
  }

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="bg-white/80 border border-divider rounded-custom shadow-glass p-6">
        <h2 className="text-xl font-semibold text-ink mb-6">Story Setup</h2>
        
        <div className="space-y-6">
          {/* Words to Include and Translation - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Words to Include */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Words to include ({storySettings.wordsToInclude})
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleWordsToIncludeChange(storySettings.wordsToInclude - 1)}
                  disabled={storySettings.wordsToInclude <= minWords}
                  className={cn(
                    "w-8 h-8 rounded-full border border-divider flex items-center justify-center",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    storySettings.wordsToInclude <= minWords
                      ? "opacity-50 cursor-not-allowed text-muted"
                      : "hover:border-primary hover:text-primary text-ink"
                  )}
                  aria-label="Decrease words"
                >
                  −
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min={minWords}
                    max={maxWords}
                    value={storySettings.wordsToInclude}
                    onChange={(e) => handleWordsToIncludeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>{minWords}</span>
                    <span>{maxWords}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleWordsToIncludeChange(storySettings.wordsToInclude + 1)}
                  disabled={storySettings.wordsToInclude >= maxWords}
                  className={cn(
                    "w-8 h-8 rounded-full border border-divider flex items-center justify-center",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    storySettings.wordsToInclude >= maxWords
                      ? "opacity-50 cursor-not-allowed text-muted"
                      : "hover:border-primary hover:text-primary text-ink"
                  )}
                  aria-label="Increase words"
                >
                  +
                </button>
              </div>
              
              {availableWords < storySettings.wordsToInclude && (
                <p className="text-sm text-warning mt-2">
                  Only {availableWords} unknown words available. Story will use all available words.
                </p>
              )}
            </div>

            {/* Translation Options */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                In-story translation — optional
              </label>
              <select
                value={storySettings.translationLocale}
                onChange={(e) => handleTranslationChange(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border border-divider bg-white text-ink",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary",
                  "transition-all duration-200"
                )}
              >
                <option value="none">None</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
              <p className="text-xs text-muted mt-1">
                Translations will appear after the first use of each word in the story
              </p>
            </div>
          </div>

          {/* Create Story Button */}
          <div className="pt-4 border-t border-divider">
            <button
              onClick={onCreateStory}
              disabled={!canCreateStory}
              className={cn(
                "w-full py-4 px-6 rounded-custom font-semibold text-lg",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                canCreateStory
                  ? "bg-primary text-white hover:bg-primary-hover active:bg-primary-active hover:scale-[1.02] shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              )}
            >
              {availableWords === 0 
                ? 'No unknown words to include' 
                : `Create Story Book`
              }
            </button>
            
            {canCreateStory && (
              <p className="text-sm text-muted text-center mt-3">
                Using {Math.min(storySettings.wordsToInclude, availableWords)} words from your unknown vocabulary
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
