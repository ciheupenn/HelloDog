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
      // Simulate story creation - in real app this would call the story API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo, just show success and redirect would happen
      toast.success('Story created successfully!')
      
      // In real app: router.push('/reader')
      console.log('Would navigate to story reader with:', {
        words: unknownWords.slice(0, storySettings.wordsToInclude),
        settings: storySettings
      })
      
    } catch (error) {
      console.error('Error creating story:', error)
      toast.error('Failed to create story. Please try again.')
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
