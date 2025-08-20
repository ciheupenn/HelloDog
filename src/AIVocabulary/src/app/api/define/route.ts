import { NextRequest, NextResponse } from 'next/server'
import { Definition } from '@/types'

// Mock definitions for demonstration
const MOCK_DEFINITIONS: Record<string, Definition> = {
  'resilient': {
    word: 'resilient',
    definitionEN: 'Able to withstand or recover quickly from difficult conditions.',
    pos: 'adjective'
  },
  'abundant': {
    word: 'abundant',
    definitionEN: 'Existing or available in large quantities; plentiful.',
    pos: 'adjective'
  },
  'courage': {
    word: 'courage',
    definitionEN: 'The ability to do something that frightens one; bravery.',
    pos: 'noun'
  },
  'challenge': {
    word: 'challenge',
    definitionEN: 'A call to take part in a contest or competition, especially a demanding one.',
    pos: 'noun'
  },
  'obstacle': {
    word: 'obstacle',
    definitionEN: 'A thing that blocks one\'s way or prevents or hinders progress.',
    pos: 'noun'
  },
  'spirit': {
    word: 'spirit',
    definitionEN: 'The non-physical part of a person which is the seat of emotions and character.',
    pos: 'noun'
  },
  'journey': {
    word: 'journey',
    definitionEN: 'An act of traveling from one place to another.',
    pos: 'noun'
  },
  'village': {
    word: 'village',
    definitionEN: 'A group of houses and associated buildings, larger than a hamlet.',
    pos: 'noun'
  },
  'overcome': {
    word: 'overcome',
    definitionEN: 'Succeed in dealing with a problem; defeat.',
    pos: 'verb'
  },
  'support': {
    word: 'support',
    definitionEN: 'Give assistance to; help or encourage.',
    pos: 'verb'
  },
  'serendipity': {
    word: 'serendipity',
    definitionEN: 'The occurrence and development of events by chance in a happy or beneficial way.',
    pos: 'noun'
  },
  'ephemeral': {
    word: 'ephemeral',
    definitionEN: 'Lasting for a very short time; transitory.',
    pos: 'adjective'
  },
  'ubiquitous': {
    word: 'ubiquitous',
    definitionEN: 'Present, appearing, or found everywhere.',
    pos: 'adjective'
  },
  'paradigm': {
    word: 'paradigm',
    definitionEN: 'A typical example or pattern of something; a model.',
    pos: 'noun'
  },
  'synthesis': {
    word: 'synthesis',
    definitionEN: 'The combination of ideas to form a theory or system.',
    pos: 'noun'
  },
  'phenomenon': {
    word: 'phenomenon',
    definitionEN: 'A fact or situation that is observed to exist or happen.',
    pos: 'noun'
  },
  'comprehensive': {
    word: 'comprehensive',
    definitionEN: 'Complete; including all or nearly all elements or aspects.',
    pos: 'adjective'
  },
  'empirical': {
    word: 'empirical',
    definitionEN: 'Based on, concerned with, or verifiable by observation or experience.',
    pos: 'adjective'
  },
  'hypothesis': {
    word: 'hypothesis',
    definitionEN: 'A supposition or proposed explanation made on the basis of limited evidence.',
    pos: 'noun'
  },
  'catalyst': {
    word: 'catalyst',
    definitionEN: 'A person or thing that precipitates an event or change.',
    pos: 'noun'
  },
  'ambiguous': {
    word: 'ambiguous',
    definitionEN: 'Open to more than one interpretation; having a double meaning.',
    pos: 'adjective'
  },
  'vocabulary': {
    word: 'vocabulary',
    definitionEN: 'The body of words used in a particular language.',
    pos: 'noun'
  },
  'computer': {
    word: 'computer',
    definitionEN: 'An electronic device for storing and processing data.',
    pos: 'noun'
  },
  'learn': {
    word: 'learn',
    definitionEN: 'Acquire knowledge or skills through study, experience, or teaching.',
    pos: 'verb'
  },
  'knowledge': {
    word: 'knowledge',
    definitionEN: 'Facts, information, and skills acquired through experience or education.',
    pos: 'noun'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lemma } = await request.json()
    
    if (!lemma || typeof lemma !== 'string') {
      return NextResponse.json(
        { error: 'Word lemma is required' },
        { status: 400 }
      )
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const definition = MOCK_DEFINITIONS[lemma.toLowerCase()]
    
    if (!definition) {
      // Fallback generic definition
      return NextResponse.json({
        word: lemma,
        definitionEN: `A word in the English language: ${lemma}`,
        pos: 'unknown'
      })
    }
    
    return NextResponse.json(definition)
    
  } catch (error) {
    console.error('Error in define API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
