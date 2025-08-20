'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DefinitionMenuProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function DefinitionMenu({ word, position, onClose }: DefinitionMenuProps) {
  const [definition, setDefinition] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDefinition = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/define?word=${encodeURIComponent(word)}`);
        
        if (!response.ok) {
          throw new Error('Definition not found');
        }
        
        const data = await response.json();
        setDefinition(data.definitionEN || data.definition || 'No definition available');
      } catch (err) {
        setError('Unable to load definition');
      } finally {
        setLoading(false);
      }
    };

    if (word) {
      fetchDefinition();
    }
  }, [word]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.definition-menu')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className="definition-menu fixed z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 200),
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 capitalize">{word}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close definition"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading definition...
          </div>
        )}
        
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        
        {!loading && !error && definition && (
          <p className="leading-relaxed">{definition}</p>
        )}
      </div>
    </div>
  );
}
