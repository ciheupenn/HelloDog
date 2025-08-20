'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { parseBoldText } from '@/lib/reader/parsePage';
import { createHighlightedElement } from '@/lib/reader/highlight';

interface BookSpreadProps {
  imageUrl?: string;
  text: string;
  styleImageUrl?: string;
  activeTarget?: string;
  onWordRightClick?: (word: string, event: React.MouseEvent) => void;
  pageNumber: number; // Add page number for animation key
}

export function BookSpread({ 
  imageUrl, 
  text, 
  styleImageUrl, 
  activeTarget,
  onWordRightClick,
  pageNumber
}: BookSpreadProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayContent, setDisplayContent] = useState({ imageUrl, text });
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle page flip animation
  useEffect(() => {
    setIsFlipping(true);
    setImageLoading(true);
    setImageError(false);
    
    // Delay content update to sync with flip animation
    const timer = setTimeout(() => {
      setDisplayContent({ imageUrl, text });
      setIsFlipping(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pageNumber, imageUrl, text]);
  const handleTextClick = (event: React.MouseEvent) => {
    if (event.button === 2) { // Right click
      const selection = window.getSelection();
      const word = selection?.toString().trim();
      if (word && onWordRightClick) {
        onWordRightClick(word, event);
      }
    }
  };

  const renderFormattedText = () => {
    const parts = parseBoldText(displayContent.text);
    
    return parts.map((part, index) => {
      if (typeof part === 'object' && part.type === 'bold') {
        // Bold text (first use of target words)
        const highlightedContent = activeTarget 
          ? createHighlightedElement(part.text, activeTarget, true)
          : part.text;
        
        return (
          <strong key={index} className="font-semibold text-ink">
            {highlightedContent}
          </strong>
        );
      } else {
        // Regular text
        const textContent = part as string;
        const highlightedContent = activeTarget 
          ? createHighlightedElement(textContent, activeTarget, true)
          : textContent;
        
        return <span key={index}>{highlightedContent}</span>;
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Left page: Image */}
      <div className={`relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-lg transition-all duration-600 transform-gpu ${
        isFlipping ? 'scale-95 opacity-60 rotate-y-12' : 'scale-100 opacity-100 rotate-y-0'
      }`} style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}>
        {displayContent.imageUrl ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {imageError ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                  <p className="text-sm">Image unavailable</p>
                </div>
              </div>
            ) : (
              <Image
                src={displayContent.imageUrl}
                alt="Story illustration"
                fill
                className={`object-cover transition-all duration-600 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                priority={pageNumber <= 2}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <p className="text-sm">Story illustration</p>
            </div>
          </div>
        )}
        
        {/* Style reference chip with character preview and generation indicator */}
        {styleImageUrl && (
          <div className="absolute top-3 left-3 z-10">
            <div className="group relative">
              <div className="px-3 py-2 bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-sm rounded-lg border border-purple-300 text-xs text-white font-medium shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-200">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/50">
                  <Image
                    src={styleImageUrl}
                    alt="Character reference"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                </div>
                <span className="flex items-center gap-1">
                  ✨ Character-Generated
                </span>
              </div>
              
              {/* Enhanced hover preview */}
              <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-300">
                      <Image
                        src={styleImageUrl}
                        alt="Character reference"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Your Character</h4>
                      <p className="text-xs text-gray-600">Google-style AI Generated</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Character consistency: Active
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Scene adaptation: Page {pageNumber}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      Google Imagen 2 + DreamBooth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Page number indicator */}
        <div className="absolute bottom-3 right-3 bg-black/20 text-white text-xs px-2 py-1 rounded-full">
          {pageNumber}
        </div>
      </div>

      {/* Right page: Text */}
      <div className="flex flex-col">
        <div 
          className={`flex-1 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg transition-all duration-600 transform-gpu ${
            isFlipping ? 'scale-95 opacity-60 -rotate-y-12' : 'scale-100 opacity-100 rotate-y-0'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
          onContextMenu={handleTextClick}
          onMouseUp={handleTextClick}
        >
          <div className="text-lg leading-8 text-gray-800 select-text">
            {renderFormattedText()}
          </div>
        </div>
      </div>
    </div>
  );
}
