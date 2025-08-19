'use client'

import React, { useState } from 'react'
import { useVocabularyStore } from '@/store/vocabulary'
import { cn } from '@/lib/utils'
import { Definition } from '@/types'
import toast from 'react-hot-toast'

interface VocabularyGridProps {
  onDefineWord?: (word: string) => Promise<Definition>
}

export default function VocabularyGrid({ onDefineWord }: VocabularyGridProps) {
  const { words, toggleWordStatus, undoLastAction, recentActions } = useVocabularyStore()
  const [selectedFilter, setSelectedFilter] = useState<'unknown' | 'known'>('unknown')
  const [showDefinition, setShowDefinition] = useState<{ word: string; definition: Definition } | null>(null)
  const [loadingDefinition, setLoadingDefinition] = useState<string | null>(null)

  const unknownWords = words.filter(w => w.status === 'unknown')
  const knownWords = words.filter(w => w.status === 'known')
  const displayWords = selectedFilter === 'unknown' ? unknownWords : knownWords

  const handleWordClick = (wordId: string) => {
    toggleWordStatus(wordId)
    
    // Show undo toast
    if (recentActions.length === 0) {
      setTimeout(() => {
        const actions = useVocabularyStore.getState().recentActions
        if (actions.length > 0) {
          const action = actions[0]
          const newStatus = action.word.status === 'unknown' ? 'known' : 'unknown'
          
          toast.success(
            `Moved "${action.word.lemma}" to ${newStatus}`,
            {
              duration: 4000,
              action: {
                label: 'Undo',
                onClick: () => {
                  undoLastAction()
                  toast.success('Undone')
                }
              }
            } as any
          )
        }
      }, 100)
    }
  }

  const handleWordRightClick = async (event: React.MouseEvent, word: string) => {
    event.preventDefault()
    
    if (!onDefineWord) return
    
    setLoadingDefinition(word)
    try {
      const definition = await onDefineWord(word)
      setShowDefinition({ word, definition })
    } catch (error) {
      toast.error('Failed to load definition')
    } finally {
      setLoadingDefinition(null)
    }
  }

  const closeDefinition = () => {
    setShowDefinition(null)
  }

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="bg-white/80 border border-divider rounded-custom shadow-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('unknown')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedFilter === 'unknown'
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Unknown ({unknownWords.length})
            </button>
            <button
              onClick={() => setSelectedFilter('known')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedFilter === 'known'
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Known ({knownWords.length})
            </button>
          </div>

          {recentActions.length > 0 && (
            <button
              onClick={undoLastAction}
              className="text-sm text-muted hover:text-ink transition-colors duration-200"
            >
              Undo last action
            </button>
          )}
        </div>

        {displayWords.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>No {selectedFilter} words yet.</p>
            {selectedFilter === 'unknown' && words.length > 0 && (
              <p className="text-sm mt-2">All words have been marked as known!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {displayWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word.id)}
                onContextMenu={(e) => handleWordRightClick(e, word.lemma)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium",
                  "transition-all duration-200 text-left",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "hover:scale-105 hover:shadow-md",
                  word.status === 'unknown'
                    ? "bg-red-50 border-red-200 text-red-900 hover:bg-red-100"
                    : "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
                  loadingDefinition === word.lemma && "opacity-50"
                )}
                disabled={loadingDefinition === word.lemma}
                title={`Left-click to move to ${word.status === 'unknown' ? 'known' : 'unknown'}, right-click for definition`}
              >
                <div className="truncate">{word.lemma}</div>
                {word.pos && (
                  <div className="text-xs opacity-75 mt-1">({word.pos})</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Definition Popover */}
      {showDefinition && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={closeDefinition}
        >
          <div
            className="bg-white rounded-custom shadow-elevation p-6 max-w-md w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">
                {showDefinition.word}
              </h3>
              <button
                onClick={closeDefinition}
                className="text-muted hover:text-ink transition-colors"
                aria-label="Close definition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {showDefinition.definition.pos && (
                <p className="text-sm text-primary font-medium">
                  {showDefinition.definition.pos}
                </p>
              )}
              <p className="text-ink leading-relaxed">
                {showDefinition.definition.definitionEN}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
