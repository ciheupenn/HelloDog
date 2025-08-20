import { stripBoldForTTS } from './parsePage';

export class TTSManager {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private paragraphs: string[] = [];
  private currentParagraphIndex = 0;
  private onParagraphChange?: (index: number) => void;
  private onPlayStateChange?: (isPlaying: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private checkSynthesisAvailable(): boolean {
    return this.synthesis !== null;
  }

  setParagraphs(paragraphs: string[]) {
    this.paragraphs = paragraphs.map(stripBoldForTTS);
    this.currentParagraphIndex = 0;
  }

  setCurrentParagraph(index: number) {
    this.currentParagraphIndex = Math.max(0, Math.min(index, this.paragraphs.length - 1));
  }

  setOnParagraphChange(callback: (index: number) => void) {
    this.onParagraphChange = callback;
  }

  setOnPlayStateChange(callback: (isPlaying: boolean) => void) {
    this.onPlayStateChange = callback;
  }

  play() {
    if (!this.checkSynthesisAvailable()) {
      this.onPlayStateChange?.(false);
      return;
    }

    if (this.currentParagraphIndex >= this.paragraphs.length) {
      this.onPlayStateChange?.(false);
      return;
    }

    this.stop();
    
    const text = this.paragraphs[this.currentParagraphIndex];
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    this.currentUtterance.onend = () => {
      this.currentParagraphIndex++;
      this.onParagraphChange?.(this.currentParagraphIndex);
      
      if (this.currentParagraphIndex < this.paragraphs.length) {
        // Continue to next paragraph
        setTimeout(() => this.play(), 500);
      } else {
        // End of page
        this.onPlayStateChange?.(false);
      }
    };

    this.currentUtterance.onerror = () => {
      this.onPlayStateChange?.(false);
    };

    this.synthesis!.speak(this.currentUtterance);
    this.onPlayStateChange?.(true);
  }

  pause() {
    if (!this.checkSynthesisAvailable()) return;
    this.synthesis!.pause();
    this.onPlayStateChange?.(false);
  }

  resume() {
    if (!this.checkSynthesisAvailable()) return;
    this.synthesis!.resume();
    this.onPlayStateChange?.(true);
  }

  stop() {
    if (!this.checkSynthesisAvailable()) return;
    this.synthesis!.cancel();
    this.currentUtterance = null;
    this.onPlayStateChange?.(false);
  }

  repeat() {
    if (!this.checkSynthesisAvailable()) return;
    
    this.stop();
    const text = this.paragraphs[this.currentParagraphIndex];
    if (!text) return;

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.onend = () => {
      this.onPlayStateChange?.(false);
    };
    
    this.synthesis!.speak(this.currentUtterance);
    this.onPlayStateChange?.(true);
  }

  get isPlaying(): boolean {
    if (!this.checkSynthesisAvailable()) return false;
    return this.synthesis!.speaking && !this.synthesis!.paused;
  }

  get isPaused(): boolean {
    if (!this.checkSynthesisAvailable()) return false;
    return this.synthesis!.paused;
  }
}
