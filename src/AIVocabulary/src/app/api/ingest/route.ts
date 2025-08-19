import { NextRequest, NextResponse } from 'next/server'
import { VocabSet, Word } from '@/types'

// Mock vocabulary extraction for demonstration
function extractVocabularyFromFile(file: File): Promise<Word[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = file.name.toLowerCase()
      
      const mockWords: Word[] = []
      
      if (fileName.includes('beginner')) {
        mockWords.push(
          { id: '1', lemma: 'hello', status: 'unknown', pos: 'interjection' },
          { id: '2', lemma: 'world', status: 'unknown', pos: 'noun' },
          { id: '3', lemma: 'computer', status: 'unknown', pos: 'noun' },
          { id: '4', lemma: 'learn', status: 'unknown', pos: 'verb' },
          { id: '5', lemma: 'study', status: 'unknown', pos: 'verb' }
        )
      } else if (fileName.includes('advanced')) {
        mockWords.push(
          { id: '6', lemma: 'serendipity', status: 'unknown', pos: 'noun' },
          { id: '7', lemma: 'ephemeral', status: 'unknown', pos: 'adjective' },
          { id: '8', lemma: 'ubiquitous', status: 'unknown', pos: 'adjective' },
          { id: '9', lemma: 'paradigm', status: 'unknown', pos: 'noun' },
          { id: '10', lemma: 'synthesis', status: 'unknown', pos: 'noun' },
          { id: '11', lemma: 'phenomenon', status: 'unknown', pos: 'noun' },
          { id: '12', lemma: 'comprehensive', status: 'unknown', pos: 'adjective' },
          { id: '13', lemma: 'empirical', status: 'unknown', pos: 'adjective' },
          { id: '14', lemma: 'hypothesis', status: 'unknown', pos: 'noun' },
          { id: '15', lemma: 'substantial', status: 'unknown', pos: 'adjective' },
          { id: '16', lemma: 'unprecedented', status: 'unknown', pos: 'adjective' },
          { id: '17', lemma: 'configuration', status: 'unknown', pos: 'noun' },
          { id: '18', lemma: 'fluctuation', status: 'unknown', pos: 'noun' },
          { id: '19', lemma: 'correlation', status: 'unknown', pos: 'noun' },
          { id: '20', lemma: 'inevitable', status: 'unknown', pos: 'adjective' },
          { id: '21', lemma: 'plausible', status: 'unknown', pos: 'adjective' },
          { id: '22', lemma: 'coherent', status: 'unknown', pos: 'adjective' },
          { id: '23', lemma: 'catalyst', status: 'unknown', pos: 'noun' },
          { id: '24', lemma: 'ambiguous', status: 'unknown', pos: 'adjective' }
        )
      } else {
        // Default vocabulary
        mockWords.push(
          { id: '25', lemma: 'document', status: 'unknown', pos: 'noun' },
          { id: '26', lemma: 'knowledge', status: 'unknown', pos: 'noun' },
          { id: '27', lemma: 'vocabulary', status: 'unknown', pos: 'noun' },
          { id: '28', lemma: 'language', status: 'unknown', pos: 'noun' },
          { id: '29', lemma: 'reading', status: 'unknown', pos: 'noun' },
          { id: '30', lemma: 'writing', status: 'unknown', pos: 'noun' },
          { id: '31', lemma: 'practice', status: 'unknown', pos: 'verb' },
          { id: '32', lemma: 'improve', status: 'unknown', pos: 'verb' }
        )
      }
      
      resolve(mockWords)
    }, 500)
  })
}

// Mock function to categorize words as known/unknown
function categorizeWords(words: Word[]): VocabSet {
  // All extracted words start as unknown by default
  const unknown = words
  const known: Word[] = []
  
  return { known, unknown }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 422 }
      )
    }
    
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv'
    ]
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}` },
          { status: 415 }
        )
      }
      
      if (file.size === 0) {
        return NextResponse.json(
          { error: 'Empty file detected' },
          { status: 422 }
        )
      }
      
      // Optional: Check file size limit (50MB)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 50MB.' },
          { status: 422 }
        )
      }
    }
    
    // Process all files and extract vocabulary
    const allWords: Word[] = []
    
    for (const file of files) {
      try {
        const words = await extractVocabularyFromFile(file)
        allWords.push(...words)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        return NextResponse.json(
          { error: `Failed to process file: ${file.name}` },
          { status: 500 }
        )
      }
    }
    
    // Deduplicate words by lemma
    const uniqueWords = allWords.filter((word, index, self) =>
      index === self.findIndex(w => w.lemma.toLowerCase() === word.lemma.toLowerCase())
    )
    
    // Categorize words
    const vocabSet = categorizeWords(uniqueWords)
    
    return NextResponse.json(vocabSet)
    
  } catch (error) {
    console.error('Error in ingest API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
