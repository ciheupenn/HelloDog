/**
 * Parse page text into paragraphs and strip bold markers for TTS
 */
export function parsePage(text: string) {
  // Split on double newlines or HTML paragraph breaks
  const paragraphs = text
    .split(/\n\n|<\/p>/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs;
}

/**
 * Strip bold markers (**text**) for TTS
 */
export function stripBoldForTTS(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1');
}

/**
 * Parse bold text for rendering
 */
export function parseBoldText(text: string): (string | { type: 'bold'; text: string })[] {
  const parts: (string | { type: 'bold'; text: string })[] = [];
  let lastIndex = 0;
  
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the bold part
    parts.push({ type: 'bold', text: match[1] });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}
