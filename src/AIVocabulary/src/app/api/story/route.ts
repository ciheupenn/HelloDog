import { NextRequest, NextResponse } from 'next/server'
import { Word } from '@/types'

interface StoryRequest {
  words: Word[]
  settings: {
    length: 'short' | 'medium' | 'long'
    style: 'adventure' | 'mystery' | 'romance' | 'scifi' | 'fantasy'
    targetAge: 'child' | 'teen' | 'adult'
    guidanceText?: string
    styleImageUrl?: string
  }
}

interface StoryResponse {
  id: string
  title: string
  content: string
  wordsUsed: string[]
  estimatedReadTime: number
}

export async function POST(request: NextRequest) {
  try {
    const body: StoryRequest = await request.json()
    const { words, settings } = body

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Words array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!settings) {
      return NextResponse.json(
        { error: 'Story settings are required' },
        { status: 400 }
      )
    }

    // Extract unknown words to include in the story
    const unknownWords = words.filter(w => w.status === 'unknown')
    const wordList = unknownWords.map(w => w.lemma)

    // Mock story generation - in a real app, this would call an AI service
    const mockStories = {
      adventure: {
        title: "The Quest for Knowledge",
        content: `Dr. Sarah Chen stood at the edge of the ancient library, her heart racing with anticipation. The **catalyst** for her journey had been a mysterious letter describing a hidden manuscript that could revolutionize scientific understanding.

The letter's language was deliberately **ambiguous**, leaving her unsure whether this was a genuine discovery or an elaborate hoax. However, her **empirical** nature demanded investigation.

As she entered the dusty halls, Sarah realized this expedition would require a **comprehensive** approach. The manuscript was said to contain a revolutionary **paradigm** that challenged conventional thinking about human consciousness.

Her research **hypothesis** suggested that ancient scholars had achieved a **synthesis** of knowledge that modern science was only beginning to understand. This **phenomenon** had been dismissed by academics for decades, but Sarah believed the evidence warranted serious study.

The **substantial** implications of her discovery could reshape entire fields of study. She carefully documented each **correlation** between the ancient texts and modern theories, knowing that what seemed **inevitable** to her might appear **unprecedented** to others.

The manuscript's **configuration** was unlike anything she had encountered. Its insights were both **plausible** and revolutionary, offering a **coherent** framework that connected disparate fields of knowledge.

As Sarah studied the ancient wisdom, she understood that this discovery would cause significant **fluctuation** in established academic thought. The implications were nothing short of extraordinary.`
      },
      mystery: {
        title: "The Enigmatic Manuscript",
        content: `Detective Morgan Pierce examined the crime scene with practiced eyes. The victim, Professor Williams, had been working on a groundbreaking research project when he mysteriously disappeared.

The professor's notes were filled with complex terminology that served as a **catalyst** for Morgan's investigation. Many entries were frustratingly **ambiguous**, written in a way that suggested the professor feared someone might be watching.

The research focused on what Professor Williams called a "new **paradigm** in cognitive science." His work appeared to be a **synthesis** of multiple disciplines, creating something entirely novel.

Morgan's **empirical** approach to detective work meant examining every piece of evidence. The professor's **hypothesis** about human consciousness seemed to have been the target of the crime.

The investigation revealed a **comprehensive** conspiracy involving several academic institutions. This wasn't just a simple case - it was a complex **phenomenon** that required careful analysis.

Each clue showed a **substantial** connection to the professor's research. The **correlation** between the missing data and recent academic scandals was too strong to ignore.

What initially seemed **inevitable** - a simple robbery - proved **unprecedented** in its scope. The crime's **configuration** suggested careful planning by someone familiar with the professor's work.

The evidence painted a **plausible** picture of academic espionage. Morgan's investigation needed to remain **coherent** despite the case's many twists and turns.

The **fluctuation** in the university's security logs revealed the true scope of the conspiracy. Professor Williams had stumbled upon something that powerful people wanted to keep hidden.`
      },
      scifi: {
        title: "Quantum Consciousness",
        content: `Dr. Aria Nova's discovery would serve as the **catalyst** for humanity's next evolutionary leap. Her research lab hummed with quantum processors analyzing consciousness patterns that had remained **ambiguous** for centuries.

The breakthrough came when Aria realized that existing scientific models represented an outdated **paradigm**. Her work achieved a remarkable **synthesis** of quantum physics and neuroscience that challenged fundamental assumptions.

Using **empirical** data from quantum consciousness experiments, Aria developed a revolutionary **hypothesis**: human awareness operated on quantum principles that could be measured and enhanced.

The **comprehensive** nature of her research attracted attention from government agencies. This **phenomenon** of quantum consciousness wasn't just theoretical - it had practical applications that could reshape civilization.

The implications were **substantial**. Aria discovered a direct **correlation** between quantum coherence and cognitive abilities. What seemed scientifically **inevitable** was actually **unprecedented** in its scope.

The quantum field's **configuration** revealed patterns that were both **plausible** and extraordinary. Aria's equations formed a **coherent** model explaining consciousness as a quantum phenomenon.

The **fluctuation** in quantum states corresponded perfectly with changes in awareness levels. Humanity stood on the brink of understanding consciousness itself.

As Aria prepared to publish her findings, she realized that this discovery would fundamentally alter how humans understood their own minds. The age of quantum consciousness was about to begin.`
      },
      fantasy: {
        title: "The Arcane Academy",
        content: `Lyra Moonwhisper knew that ancient magic would be the **catalyst** for solving the kingdom's crisis. The prophecy's words were deliberately **ambiguous**, but she sensed their hidden meaning.

Her studies at the Arcane Academy had taught her that magic operated within a specific **paradigm**. Her breakthrough came through a **synthesis** of elemental and celestial magic previously thought incompatible.

Using **empirical** observation of magical phenomena, Lyra formed a **hypothesis** about the connection between emotional states and magical power.

The **comprehensive** nature of her magical education prepared her for this moment. The crisis gripping the kingdom was a **phenomenon** that required both wisdom and power to resolve.

The threat posed **substantial** danger to all magical beings. Lyra discovered a troubling **correlation** between the kingdom's magical decline and the rising darkness.

What the Council considered **inevitable** defeat, Lyra knew was **unprecedented** opportunity. The magical field's **configuration** was shifting in ways that created new possibilities.

Her solution was both **plausible** and daring. She would need to weave a **coherent** spell combining all schools of magic to save her world.

The **fluctuation** in magical energy reached its peak as Lyra began her incantation. The fate of the kingdom rested in her ability to channel forces beyond mortal comprehension.`
      }
    }

    // Select story based on style
    const selectedStory = mockStories[settings.style as keyof typeof mockStories] || mockStories.adventure

    // Calculate estimated read time (assuming 200 words per minute)
    const wordCount = selectedStory.content.split(' ').length
    const estimatedReadTime = Math.ceil(wordCount / 200)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response: StoryResponse = {
      id: `story-${Date.now()}`,
      title: selectedStory.title,
      content: selectedStory.content,
      wordsUsed: wordList,
      estimatedReadTime
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in story API:', error)
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
}
