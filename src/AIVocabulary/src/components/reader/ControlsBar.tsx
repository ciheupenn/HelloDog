'use client';

import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlsBarProps {
  isPlaying: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
  onRepeat: () => void;
  ttsAvailable?: boolean;
}

export function ControlsBar({
  isPlaying,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onPlay,
  onPause,
  onRepeat,
  ttsAvailable = true
}: ControlsBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {/* Previous button */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all",
          canGoPrev
            ? "border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        )}
        title="Previous page (← Arrow)"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </button>

      {/* Repeat button */}
      <button
        onClick={onRepeat}
        className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        title="Repeat paragraph (R)"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all",
          canGoNext
            ? "border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        )}
        title="Next page (→ Arrow)"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Speed control (disabled for hackathon) */}
      <div className="ml-4 flex items-center gap-2 opacity-50">
        <span className="text-sm text-gray-400">Speed:</span>
        <button
          disabled
          className="px-3 py-1 bg-gray-100 text-gray-400 rounded-md text-sm cursor-not-allowed"
        >
          1×
        </button>
      </div>
    </div>
  );
}
