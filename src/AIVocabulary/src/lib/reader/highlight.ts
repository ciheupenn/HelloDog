import React from 'react';

/**
 * Highlight target word occurrences in text
 */
export function highlightTargetInText(
  text: string, 
  targetWord: string, 
  isActive: boolean
): string {
  if (!isActive || !targetWord) return text;
  
  const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi');
  return text.replace(regex, '<mark class="target-highlight">$1</mark>');
}

/**
 * Create highlighted spans for target words
 */
export function createHighlightedElement(
  text: string,
  targetWord: string,
  isActive: boolean
): React.ReactNode {
  if (!isActive || !targetWord) {
    return text;
  }

  const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // Check if this part matches the target word (case-insensitive)
    if (part.toLowerCase() === targetWord.toLowerCase()) {
      return React.createElement(
        'mark',
        {
          key: `highlight-${index}-${part}`,
          className: 'bg-primary/20 text-primary rounded px-1'
        },
        part
      );
    }
    return part;
  }).filter(part => part !== ''); // Remove empty strings
}
