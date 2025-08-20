'use client';

import { ArrowLeft, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  currentPage: number;
  totalPages: number;
  onBack: () => void;
  onHelp?: () => void;
}

export function TopBar({ title, currentPage, totalPages, onBack, onHelp }: TopBarProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {/* Left: Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 text-muted hover:text-ink rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Home
      </button>

      {/* Center: Title (optional) */}
      <div className="flex-1 text-center">
        {title && (
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
        )}
      </div>

      {/* Right: Page indicator and help */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">
          Page {currentPage} of {totalPages}
        </span>
        {onHelp && (
          <button
            onClick={onHelp}
            className="p-2 text-muted hover:text-ink rounded-lg hover:bg-gray-100 transition-colors"
            title="Keyboard shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
