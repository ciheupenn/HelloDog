'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/reader/TopBar';
import { BookSpread } from '@/components/reader/BookSpread';
import { ControlsBar } from '@/components/reader/ControlsBar';
import { CountersRail } from '@/components/reader/CountersRail';
import { DefinitionMenu } from '@/components/reader/DefinitionMenu';
import { TTSManager } from '@/lib/reader/tts';
import { parsePage } from '@/lib/reader/parsePage';
import { computeExposureMap } from '@/lib/reader/exposure';
import { useVocabularyStore } from '@/store/vocabulary';
import { ReaderErrorBoundary } from '@/components/reader/ErrorBoundary';
import type { CreateStoryResult } from '@/types/story';

interface ReaderPageProps {
  params: { id: string };
}

/**
 * Load story data from sessionStorage, API, or use sample data for demo
 */
async function loadStory(storyId: string): Promise<CreateStoryResult> {
  try {
    // First, check sessionStorage for recently created stories
    if (typeof window !== 'undefined') {
      const cachedStory = sessionStorage.getItem(`story-${storyId}`)
      if (cachedStory) {
        console.log('📱 Loading story from sessionStorage:', storyId)
        const story = JSON.parse(cachedStory)
        // Clean up after loading
        sessionStorage.removeItem(`story-${storyId}`)
        return story
      }
    }
    
    // Fallback to API
    console.log('🌐 Loading story from API:', storyId)
    const response = await fetch(`/api/stories/${storyId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to load story: ${response.status}`)
    }
    
    const story = await response.json()
    return story
  } catch (error) {
    console.error('Error loading story:', error)
    
    // Fallback to sample story for demo
    console.log('📋 Using sample story as fallback')
    return SAMPLE_STORY
  }
}

// Sample story data for development - replace with actual API call
const SAMPLE_STORY: CreateStoryResult = {
  storyId: "sample-1",
  title: "The Resilient Adventure",
  pages: [
    {
      no: 1,
      text: "Once upon a time, there was a **resilient** (坚韧的) young girl named Maya. She lived in a small village where challenges were **abundant** (丰富的). Every day brought new obstacles to overcome.",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 2,
      text: "Maya faced many obstacles with **courage** (勇气). Her resilient spirit helped her navigate through the abundant difficulties. She knew that every challenge made her stronger.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 3,
      text: "One day, a great storm brought abundant rainfall to the village. The resilient villagers worked together, showing tremendous courage in the face of adversity.",
      imageUrl: "https://images.unsplash.com/photo-1419833479618-c595710936ec?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 4,
      text: "Maya demonstrated her courage by helping elderly neighbors. Her resilient nature inspired others to be brave. The village had abundant resources when everyone contributed.",
      imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 5,
      text: "As the storm passed, Maya reflected on the importance of being resilient. She had learned that courage grows stronger with practice, and that abundant kindness makes any community thrive.",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 6,
      text: "The village celebrated their collective courage and resilient spirit. They had discovered that together, they had abundant strength to overcome any challenge that came their way.",
      imageUrl: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 7,
      text: "Maya's courage became legendary in the village. Her resilient approach to problems inspired the young and old alike. The abundant wisdom she shared helped everyone grow stronger.",
      imageUrl: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 8,
      text: "Years passed, and Maya's resilient spirit continued to guide her through life's abundant challenges. Her courage never wavered, even when facing the most difficult obstacles.",
      imageUrl: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 9,
      text: "The village prospered under the influence of Maya's courage and resilient leadership. They had abundant harvests and peaceful times, all thanks to their collective bravery.",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    },
    {
      no: 10,
      text: "And so Maya lived happily, her resilient heart full of courage and surrounded by the abundant love of her community. Her story inspired generations to be brave and never give up.",
      imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop&auto=format",
      audioUrl: null
    }
  ],
  targets: [
    { lemma: "resilient", count: 2 },
    { lemma: "abundant", count: 2 },
    { lemma: "courage", count: 2 }
  ],
  settings: {
    wordsToInclude: 3,
    translationLocale: 'zh-CN',
    guidanceText: "A story about overcoming challenges with resilience",
    styleImageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop&auto=format"
  }
};

export default function ReaderPage({ params }: ReaderPageProps) {
  return (
    <ReaderErrorBoundary>
      <ReaderPageContent params={params} />
    </ReaderErrorBoundary>
  );
}

function ReaderPageContent({ params }: ReaderPageProps) {
  const router = useRouter();
  const { storySettings } = useVocabularyStore(); // Get character image from store
  const [story, setStory] = useState<CreateStoryResult | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [definition, setDefinition] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const ttsRef = useRef<TTSManager | null>(null);
  const exposureMapRef = useRef<Record<string, { page: number; countOnPage: number }[]>>({});

  // Initialize TTS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ttsRef.current = new TTSManager();
      ttsRef.current.setOnParagraphChange(setCurrentParagraphIndex);
      ttsRef.current.setOnPlayStateChange(setIsPlaying);
    }
  }, []);

  // Load story data
  useEffect(() => {
    const loadStoryData = async () => {
      try {
        setLoading(true);
        
        // Load story with character-based images
        const loadedStory = await loadStory(params.id);
        
        // Enhance with character image from store if available
        const enhancedStory = {
          ...loadedStory,
          settings: {
            ...loadedStory.settings,
            styleImageUrl: storySettings.styleImageUrl || loadedStory.settings.styleImageUrl
          }
        };
        
        setStory(enhancedStory);
        exposureMapRef.current = computeExposureMap(enhancedStory);
        
      } catch (error) {
        console.error('Failed to load story:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadStoryData();
  }, [params.id, router, storySettings.styleImageUrl]);

  // Update TTS when page changes
  useEffect(() => {
    if (story && ttsRef.current) {
      const currentPage = story.pages[pageIndex];
      if (currentPage) {
        const paragraphs = parsePage(currentPage.text);
        ttsRef.current.setParagraphs(paragraphs);
        setCurrentParagraphIndex(0);
        setIsPlaying(false);
      }
    }
  }, [story, pageIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when definition menu is open
      if (definition) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRepeat();
          break;
        case 'Home':
          e.preventDefault();
          setPageIndex(0);
          break;
        case 'End':
          e.preventDefault();
          if (story) setPageIndex(story.pages.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [definition, story, pageIndex, isPlaying]);

  const handleBack = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.stop();
    }
    router.push('/');
  }, [router]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) {
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
      // Play page turn sound effect
      playPageTurnSound();
      setPageIndex(pageIndex - 1);
    }
  }, [pageIndex]);

  const handleNext = useCallback(() => {
    if (story && pageIndex < story.pages.length - 1) {
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
      // Play page turn sound effect
      playPageTurnSound();
      setPageIndex(pageIndex + 1);
    } else if (story && pageIndex === story.pages.length - 1) {
      console.log("You've reached the end of the story!");
    }
  }, [story, pageIndex]);

  // Simple page turn sound effect with cleanup
  const playPageTurnSound = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        // Create a simple page turn sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        // Clean up audio context after use
        setTimeout(() => {
          audioContext.close().catch(() => {
            // Ignore cleanup errors
          });
        }, 200);
      } catch (error) {
        // Silently fail if audio context not available
      }
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!ttsRef.current) return;

    if (isPlaying) {
      ttsRef.current.pause();
    } else {
      ttsRef.current.play();
    }
  }, [isPlaying]);

  const handleRepeat = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.repeat();
    }
  }, []);

  const handleTargetClick = useCallback((lemma: string) => {
    setActiveTarget(current => current === lemma ? null : lemma);
  }, []);

  const handleWordRightClick = useCallback((word: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDefinition({
      word: word.toLowerCase(),
      position: { x: event.clientX, y: event.clientY }
    });
  }, []);

  const handleCloseDefinition = useCallback(() => {
    setDefinition(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-600 mb-6">We can't find this story.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentPage = story.pages[pageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-16 py-12">
        <TopBar
          title={story.title}
          currentPage={pageIndex + 1}
          totalPages={story.pages.length}
          onBack={handleBack}
        />

        <BookSpread
          imageUrl={currentPage?.imageUrl}
          text={currentPage?.text || ''}
          styleImageUrl={story.settings.styleImageUrl}
          activeTarget={activeTarget || undefined}
          onWordRightClick={handleWordRightClick}
          pageNumber={pageIndex}
        />

        <ControlsBar
          isPlaying={isPlaying}
          canGoPrev={pageIndex > 0}
          canGoNext={pageIndex < story.pages.length - 1}
          onPrev={handlePrev}
          onNext={handleNext}
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
          onRepeat={handleRepeat}
        />

        <CountersRail
          targets={story.targets}
          activeTarget={activeTarget || undefined}
          onTargetClick={handleTargetClick}
        />

        {definition && (
          <DefinitionMenu
            word={definition.word}
            position={definition.position}
            onClose={handleCloseDefinition}
          />
        )}
      </div>
    </div>
  );
}
