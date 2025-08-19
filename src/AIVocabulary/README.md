# LexiForge - AI Vocabulary Learning

LexiForge is an AI-powered vocabulary learning application that helps users master new words through context-rich, personalized stories. Built for the hackathon with a focus on local/offline AI processing.

## Features

### Page 1 (Home) - Complete ✅
- **Upload Section**: Drag & drop support for PDF, DOC, DOCX, CSV files
- **AI Guidance Bar**: Text input + image attachment for story style guidance
- **Vocabulary Grid**: Unknown/Known word categorization with instant toggling
- **Story Setup**: Configurable word count (10-25) and translation options
- **Responsive Design**: Mobile-first with glass morphism UI

### Page 2 (Reader) - Coming Soon
- Two-page storybook layout with page-flip animations
- Bold first occurrences + optional translations
- Text-to-speech with playback controls
- Word exposure counters with 2/2 completion tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom components with Radix-style accessibility
- **File Processing**: react-dropzone
- **Notifications**: react-hot-toast

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── ingest/        # File processing endpoint
│   │   └── define/        # Word definition endpoint
│   ├── layout.tsx         # Root layout with Toaster
│   └── page.tsx           # Main home page
├── components/            # Reusable UI components
│   ├── AppHeader.tsx      # Top navigation with user controls
│   ├── UploadCard.tsx     # File upload with drag & drop
│   ├── AIBar.tsx          # AI guidance input + image attach
│   ├── VocabularyGrid.tsx # Word grid with Unknown/Known toggle
│   └── StorySetup.tsx     # Story configuration panel
├── store/                 # Zustand state management
│   └── vocabulary.ts      # Vocabulary state + actions
├── types/                 # TypeScript type definitions
│   └── index.ts           # Word, VocabSet, Story types
└── lib/                   # Utility functions
    └── utils.ts           # cn() class name utility
```

## API Endpoints

### POST /api/ingest
Processes uploaded files and extracts vocabulary.

**Request**: FormData with `files[]`
**Response**: `VocabSet { unknown: Word[], known: Word[] }`

### POST /api/define  
Gets English definition for a word.

**Request**: `{ lemma: string }`
**Response**: `Definition { word, definitionEN, pos? }`

## Key Components

### VocabularyGrid
- **Left-click**: Toggle Unknown ↔ Known
- **Right-click**: Show definition popover  
- **Undo**: Toast notification with undo action
- **Filtering**: Unknown/Known tabs with counts

### StorySetup
- **Word Slider**: 10-25 words (adapts to available unknown words)
- **Translation**: Optional in-story translations
- **Validation**: Ensures ≥1 unknown word before enabling

### UploadCard  
- **Drag & Drop**: Visual feedback and file type validation
- **File Types**: PDF, DOC, DOCX, CSV only
- **Accessibility**: Keyboard navigation + screen reader support

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open**: http://localhost:3000

4. **Test with sample files**: Use `sample-advanced.txt` or `sample-beginner.txt` in the project root

## Demo Flow

1. **Upload**: Drop the `sample-advanced.txt` file to get sophisticated vocabulary words
2. **Categorize**: Left-click words to move Unknown → Known  
3. **Define**: Right-click any word to see its English definition
4. **Guide**: Add story guidance text: "Create a story about a student learning new concepts"
5. **Style**: Click + to attach a style reference image (optional)
6. **Configure**: Set word count (18) and translation (None or select a language)
7. **Create**: Click "Create Story Book" (shows processing simulation)

## Sample Vocabulary

The app includes rich sample vocabulary:

**Advanced (`sample-advanced.txt`)**:
- serendipity, ephemeral, ubiquitous, paradigm, synthesis
- phenomenon, comprehensive, empirical, hypothesis
- substantial, unprecedented, configuration, correlation
- catalyst, ambiguous, plausible, coherent

**Beginner (`sample-beginner.txt`)**:  
- hello, world, computer, learn, study, practice, knowledge

## Design System

### Colors
- **Primary**: `#4C6FFF` (Interactive elements)
- **Surface**: `#F8FAFF` (Background)
- **Ink**: `#0E1726` (Primary text)
- **Muted**: `#6B7A90` (Secondary text)
- **Divider**: `#E6EAF3` (Borders)

### Spacing & Layout
- **Radius**: 16px for all interactive elements
- **Max Width**: 1200px for content sections  
- **Grid**: Responsive 2-6 columns for vocabulary
- **Glass Cards**: Semi-transparent with subtle shadows

### Accessibility
- **Focus Management**: Visible focus rings on all interactive elements
- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader**: Proper ARIA labels and live regions
- **Touch Targets**: ≥44px for mobile interaction

## Development Notes

- **TypeScript Strict**: Full type safety throughout
- **Responsive**: Mobile-first design with fluid breakpoints  
- **Performance**: Optimized for smooth interactions and animations
- **Error Handling**: Comprehensive error states and user feedback

## Future Enhancements (Post-Hackathon)

- **Local AI**: gpt-oss integration via vLLM for offline story generation
- **Story Reader**: Complete reading interface with TTS
- **User Accounts**: Persistent vocabulary and progress tracking
- **Real Processing**: Actual PDF/DOC parsing with NLP libraries
- **Advanced Features**: CEFR clustering, SRS scheduling, browser extension

---

**Built for the hackathon with ❤️ by the LexiForge team**
