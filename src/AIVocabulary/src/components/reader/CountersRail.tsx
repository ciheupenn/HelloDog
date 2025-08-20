'use client';

import { cn } from '@/lib/utils';
import type { StoryTargets } from '@/types/story';

interface CountersRailProps {
  targets: StoryTargets;
  activeTarget?: string;
  onTargetClick: (lemma: string) => void;
}

export function CountersRail({ targets, activeTarget, onTargetClick }: CountersRailProps) {
  const getCountDisplay = (count: 0 | 1 | 2) => {
    switch (count) {
      case 0:
        return '0/2';
      case 1:
        return '1/2';
      case 2:
        return '2/2✓';
      default:
        return '0/2';
    }
  };

  const getChipStyles = (lemma: string, count: 0 | 1 | 2) => {
    const isActive = activeTarget === lemma;
    const isComplete = count === 2;
    
    return cn(
      "inline-flex items-center gap-2 px-3 py-2 rounded-full border transition-all cursor-pointer",
      "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary",
      isActive && "ring-2 ring-primary bg-primary/10 border-primary",
      !isActive && isComplete && "bg-green-50 border-green-200 text-green-700",
      !isActive && !isComplete && "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
    );
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium text-gray-700">Target Words</h3>
        <span className="text-xs text-gray-400">Click to highlight on page</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {targets.map(({ lemma, count }) => (
          <button
            key={lemma}
            onClick={() => onTargetClick(lemma)}
            className={getChipStyles(lemma, count)}
            title={`${count === 2 ? 'Complete' : '2 required uses across the story'}`}
          >
            <span className="text-sm font-medium">{lemma}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              count === 2 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-500"
            )}>
              {getCountDisplay(count)}
            </span>
          </button>
        ))}
      </div>
      
      {targets.some(t => t.count < 2) && (
        <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          📝 We added extra content to ensure all target words appear at least twice
        </div>
      )}
    </div>
  );
}
