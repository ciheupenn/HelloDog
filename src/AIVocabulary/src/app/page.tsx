'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AppHeader from '@/components/AppHeader'
import UploadCard from '@/components/UploadCard'
import AIBar from '@/components/AIBar'
import VocabularyGrid from '@/components/VocabularyGrid'
import StorySetup from '@/components/StorySetup'
import { useVocabularyStore } from '@/store/vocabulary'
import { VocabSet, Definition } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { setWords, words, storySettings, updateStorySettings } = useVocabularyStore()
  const [isProcessingStory, setIsProcessingStory] = useState(false)

  // Mock user data
  const user = {
    name: 'Demo User',
    avatar: undefined
  }

  const handleUploadResult = (vocab: VocabSet) => {
    const allWords = [...vocab.unknown, ...vocab.known]
    setWords(allWords)
    toast.success(`Loaded ${allWords.length} words from your document(s)`)
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    toast.error('Failed to process your document. Please try again.')
  }

  const handleAIGuidance = (text: string, image?: File) => {
    // Update story settings with guidance text and style image
    const updates: any = {}
    
    if (text.trim()) {
      updates.guidanceText = text
    }
    
    if (image) {
      // In a real app, you'd upload the image and get a URL
      const imageUrl = URL.createObjectURL(image)
      updates.styleImageUrl = imageUrl
    }
    
    updateStorySettings(updates)
    toast.success('Story guidance updated!')
  }

  const handleDefineWord = async (word: string): Promise<Definition> => {
    try {
      const response = await fetch('/api/define', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lemma: word }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch definition')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching definition:', error)
      throw error
    }
  }

  const handleCreateStory = async () => {
    const unknownWords = words.filter(w => w.status === 'unknown')
    
    if (unknownWords.length === 0) {
      toast.error('No unknown words to include in the story')
      return
    }

    setIsProcessingStory(true)
    
    try {
      // Show different loading message based on whether character image is uploaded
      const loadingMessage = storySettings.styleImageUrl 
        ? 'Creating story with character-based manga illustrations...'
        : 'Creating story...'
      
      toast.loading(loadingMessage, { id: 'story-creation' })
      
      // Call the story API with character image for manga-style generation
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: unknownWords.slice(0, storySettings.wordsToInclude),
          settings: {
            ...storySettings,
            // Character image URL for manga-style generation
            styleImageUrl: storySettings.styleImageUrl
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Story API error: ${response.status}`)
      }

      const storyData = await response.json()
      
      toast.success(
        storySettings.styleImageUrl 
          ? 'Story created with character-based manga illustrations!' 
          : 'Story created successfully!',
        { id: 'story-creation' }
      )
      
      // Store the complete story data in sessionStorage for immediate access
      if (storyData.storyData) {
        sessionStorage.setItem(`story-${storyData.id}`, JSON.stringify(storyData.storyData))
      }
      
      // Navigate to the reader with the generated story
      router.push(`/reader/${storyData.id}`)
      
    } catch (error) {
      console.error('Error creating story:', error)
      toast.error('Failed to create story. Please try again.', { id: 'story-creation' })
    } finally {
      setIsProcessingStory(false)
    }
  }

  const hasWords = words.length > 0
  const unknownCount = words.filter(w => w.status === 'unknown').length

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader user={user} />
      
      <main className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink mb-4">
              Learn Vocabulary Through
              <span className="text-primary block">AI-Generated Stories</span>
            </h1>
            <p className="text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Upload documents, identify unknown words, and read engaging stories 
              that help you master vocabulary through context.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-10">
            <UploadCard
              onResult={handleUploadResult}
              onError={handleUploadError}
              disabled={isProcessingStory}
            />
          </div>

          {/* AI Guidance Bar - Always visible */}
          <div className="mb-10">
            <AIBar
              onSubmit={handleAIGuidance}
              disabled={isProcessingStory}
            />
          </div>

          {/* Vocabulary Grid - Always visible */}
          <div className="mb-10">
            <VocabularyGrid
              onDefineWord={handleDefineWord}
            />
          </div>

          {/* Demo Reader Button */}
          <div className="mb-10 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-purple-100 rounded-2xl p-6 border border-primary/20">
              <h3 className="text-lg font-semibold text-ink mb-2">📖 Try the Story Reader</h3>
              <p className="text-sm text-muted mb-4">
                Experience the interactive storybook with page animations, TTS narration, and character integration
              </p>
              <button
                onClick={() => router.push('/reader/sample-1')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                🎬 Preview Story Reader (Demo)
              </button>
              {storySettings.styleImageUrl && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                    <img 
                      src={storySettings.styleImageUrl} 
                      alt="Character" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  Your character will appear in the story illustrations
                </div>
              )}
            </div>
          </div>

          {/* Story Setup */}
          {unknownCount > 0 && (
            <div className="mb-10">
              <StorySetup
                onCreateStory={handleCreateStory}
                disabled={isProcessingStory}
              />
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessingStory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-custom p-8 max-w-md mx-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-ink mb-2">
                  Creating Your Story
                </h3>
                <p className="text-muted">
                  Our AI is crafting a personalized story with your vocabulary words...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
