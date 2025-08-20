import { NextRequest, NextResponse } from 'next/server'
import type { CreateStoryResult } from '@/types/story'
import { getStory, storeStory } from '@/lib/story-storage'
import { getStoryImmediate } from '@/lib/immediate-story-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id
    
    console.log('Fetching story with ID:', storyId)
    
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      )
    }

    // Check for demo story
    if (storyId === 'demo') {
      console.log('Returning demo story')
      // Return demo story for preview purposes
      const demoStory: CreateStoryResult = {
        storyId: 'demo',
        title: 'The Resilient Adventure',
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
          }
        ],
        targets: [
          { lemma: 'resilient', count: 2 },
          { lemma: 'abundant', count: 2 },
          { lemma: 'courage', count: 1 }
        ],
        settings: {
          wordsToInclude: 10,
          translationLocale: 'zh-CN',
          guidanceText: 'A story about overcoming challenges',
          styleImageUrl: undefined
        }
      }
      
      return NextResponse.json(demoStory)
    }

    // Get story from immediate cache first, then storage
    let story = getStoryImmediate(storyId)
    if (!story) {
      story = getStory(storyId)
    }
    
    console.log('Story found in cache/storage:', !!story)
    
    if (!story) {
      console.log('Story not found, returning 404')
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    console.log('Returning story:', story.title)
    return NextResponse.json(story)
    
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const story: CreateStoryResult = await request.json()
    
    if (!story.storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      )
    }

    // Store the story
    storeStory(story)
    
    return NextResponse.json({ success: true, storyId: story.storyId })
    
  } catch (error) {
    console.error('Error storing story:', error)
    return NextResponse.json(
      { error: 'Failed to store story' },
      { status: 500 }
    )
  }
}
