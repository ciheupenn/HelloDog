/**
 * Image Generation Service for Character-Consistent Manga Style Illustrations
 * 
 * This service generates manga-style images based on:
 * - User's uploaded character image (for style consistency)
 * - Story content and scene descriptions
 * - Manga aesthetic requirements
 */

export interface ImageGenerationRequest {
  characterImageUrl?: string;
  sceneDescription: string;
  storyContext: string;
  style: 'manga' | 'anime' | 'realistic';
  mood: 'adventurous' | 'mysterious' | 'romantic' | 'futuristic' | 'fantasy';
  characterDescription?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  alt: string;
  prompt: string;
}

/**
 * Generates a detailed prompt for character-consistent manga illustrations
 */
function createMangaPrompt(request: ImageGenerationRequest): string {
  const baseStyle = "manga style illustration, anime art, detailed artwork, clean lines, dynamic composition";
  const characterStyle = request.characterImageUrl 
    ? "maintaining character consistency from reference image, same character design" 
    : "original character design";
  
  const moodStyles = {
    adventurous: "dynamic action pose, energetic atmosphere, bright colors",
    mysterious: "dramatic shadows, mysterious lighting, moody colors",
    romantic: "soft lighting, warm colors, gentle expressions",
    futuristic: "sci-fi elements, neon colors, technological background",
    fantasy: "magical elements, ethereal lighting, fantastical environment"
  };

  return `${baseStyle}, ${characterStyle}, ${request.sceneDescription}, ${moodStyles[request.mood]}, high quality, detailed background, professional manga artwork`;
}

/**
 * Mock image generation service
 * In production, this would integrate with AI image generation APIs like:
 * - DALL-E 3
 * - Midjourney API
 * - Stable Diffusion
 * - Character-consistent fine-tuned models
 */
export async function generateCharacterImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
  const prompt = createMangaPrompt(request);
  
  // For demo purposes, create character-consistent manga-style images
  // In production, this would call an AI image generation service
  const sceneKeywords = extractSceneKeywords(request.sceneDescription, request.mood);
  
  // Generate character-consistent image URLs based on scene and character
  const characterBasedImages = getCharacterConsistentImages(request.characterImageUrl, sceneKeywords, request.mood);
  const imageUrl = characterBasedImages[Math.floor(Math.random() * characterBasedImages.length)];
  
  return {
    imageUrl,
    alt: `Manga-style illustration: ${request.sceneDescription}`,
    prompt
  };
}

/**
 * Generate character-consistent image URLs for manga-style illustrations
 */
function getCharacterConsistentImages(characterImageUrl: string | undefined, sceneKeywords: string[], mood: string): string[] {
  // Base character-consistent image sets for different moods
  const characterImageSets = {
    adventurous: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format', // Adventure scene
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format', // Mountain adventure
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&auto=format', // Forest adventure
    ],
    mysterious: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format', // Mysterious library
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&auto=format', // Dark library
      'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=600&fit=crop&auto=format', // Detective scene
    ],
    romantic: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format', // Romantic scene
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&auto=format', // Sunset romance
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop&auto=format', // Garden romance
    ],
    futuristic: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format', // Sci-fi lab
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format', // Space/tech
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format', // Future city
    ],
    fantasy: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop&auto=format', // Fantasy book
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format', // Magical library
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&auto=format', // Mystical setting
    ]
  };
  
  const moodKey = mood as keyof typeof characterImageSets;
  let baseImages = characterImageSets[moodKey] || characterImageSets.adventurous;
  
  // If character image is provided, modify URLs to suggest character consistency
  if (characterImageUrl) {
    // In a real implementation, we would use the character image to generate consistent characters
    // For demo, we'll use scene-appropriate images that suggest character consistency
    const characterConsistentImages = baseImages.map(url => {
      // Add parameters that would help with character consistency in real AI generation
      return `${url}&character-ref=${encodeURIComponent(characterImageUrl)}&style=manga&consistent=true`;
    });
    
    return characterConsistentImages;
  }
  
  return baseImages;
}

/**
 * Extract relevant keywords from scene description for image search
 */
function extractSceneKeywords(description: string, mood: ImageGenerationRequest['mood']): string[] {
  const keywords = [];
  
  // Add mood-based keywords
  const moodKeywords: Record<ImageGenerationRequest['mood'], string[]> = {
    adventurous: ['adventure', 'action', 'hero'],
    mysterious: ['mystery', 'detective', 'noir'],
    romantic: ['romance', 'couple', 'love'],
    futuristic: ['sci-fi', 'technology', 'future'],
    fantasy: ['fantasy', 'magic', 'mystical']
  };
  
  keywords.push(...(moodKeywords[mood] || []));
  
  // Extract key scene elements
  const sceneWords = description.toLowerCase();
  if (sceneWords.includes('library')) keywords.push('library', 'books');
  if (sceneWords.includes('laboratory')) keywords.push('laboratory', 'science');
  if (sceneWords.includes('city')) keywords.push('city', 'urban');
  if (sceneWords.includes('forest')) keywords.push('forest', 'nature');
  if (sceneWords.includes('school')) keywords.push('school', 'student');
  if (sceneWords.includes('office')) keywords.push('office', 'business');
  
  return keywords.slice(0, 3); // Limit to top 3 keywords
}

/**
 * Generate multiple character-consistent images for a story
 */
export async function generateStoryImages(
  characterImageUrl: string | undefined,
  storyContent: string,
  storyStyle: string,
  pageCount: number = 10
): Promise<ImageGenerationResult[]> {
  // Split story into scenes/pages
  const scenes = extractScenesFromStory(storyContent, pageCount);
  const mood = mapStoryStyleToMood(storyStyle);
  
  const imagePromises = scenes.map((scene, index) => 
    generateCharacterImage({
      characterImageUrl,
      sceneDescription: scene,
      storyContext: storyContent,
      style: 'manga',
      mood,
      characterDescription: `Character from uploaded reference image, page ${index + 1} of story`
    })
  );
  
  return Promise.all(imagePromises);
}

/**
 * Extract scenes from story content for each page
 */
function extractScenesFromStory(content: string, pageCount: number): string[] {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const scenesPerPage = Math.ceil(paragraphs.length / pageCount);
  
  const scenes: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    const startIdx = i * scenesPerPage;
    const endIdx = Math.min(startIdx + scenesPerPage, paragraphs.length);
    const pageContent = paragraphs.slice(startIdx, endIdx).join(' ');
    
    // Extract key action/scene from the content
    const scene = extractMainAction(pageContent) || `Scene ${i + 1} from the story`;
    scenes.push(scene);
  }
  
  return scenes;
}

/**
 * Extract the main action or scene description from text
 */
function extractMainAction(text: string): string | null {
  // Remove vocabulary markers (words in **bold**)
  const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
  
  // Find sentences with action verbs
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim());
  
  // Look for sentences with action or scene-setting words
  const actionWords = ['stood', 'walked', 'entered', 'discovered', 'examined', 'found', 'approached', 'looked', 'realized'];
  const sceneWords = ['library', 'laboratory', 'room', 'building', 'forest', 'city', 'school', 'office'];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (actionWords.some(word => lowerSentence.includes(word)) || 
        sceneWords.some(word => lowerSentence.includes(word))) {
      return sentence.trim();
    }
  }
  
  // Fallback to first sentence
  return sentences[0]?.trim() || null;
}

/**
 * Map story style to image mood
 */
function mapStoryStyleToMood(style: string): ImageGenerationRequest['mood'] {
  const styleMap: Record<string, ImageGenerationRequest['mood']> = {
    'adventure': 'adventurous',
    'mystery': 'mysterious', 
    'romance': 'romantic',
    'scifi': 'futuristic',
    'fantasy': 'fantasy'
  };
  
  return styleMap[style] || 'adventurous';
}
