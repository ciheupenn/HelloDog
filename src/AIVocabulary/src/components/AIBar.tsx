'use client'

import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AIBarProps {
  onSubmit: (text: string, image?: File) => void
  disabled?: boolean
}

export default function AIBar({ onSubmit, disabled = false }: AIBarProps) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!text.trim() && !image) return
    
    onSubmit(text.trim(), image || undefined)
    setText('')
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 rounded-2xl p-6">
        {/* AI Assistant Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">AI Story Assistant</h3>
            <p className="text-xs text-muted">Customize your story with images and preferences</p>
          </div>
        </div>

        {/* Style reference preview */}
        {imagePreview && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/80 border border-primary/30 rounded-xl shadow-sm">
              <img 
                src={imagePreview} 
                alt="Character reference" 
                className="w-10 h-10 object-cover rounded-lg"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-ink block">Character Reference</span>
                <span className="text-xs text-muted">For story illustrations</span>
              </div>
              <button
                onClick={removeImage}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Remove reference"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main interaction area */}
        <div className="relative">
          <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-primary/50 focus-within:bg-white">
            {/* Image attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 group focus:outline-none",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title="Add image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-105 transition-transform">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            {/* Text input area */}
            <div className="flex-1 min-w-0">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your story style..."
                disabled={disabled}
                rows={1}
                className={cn(
                  "w-full bg-transparent text-gray-800 placeholder-gray-400 resize-none",
                  "border-none outline-none text-sm leading-9 font-medium",
                  "focus:outline-none focus:ring-0",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
              {text.length > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{text.length} characters</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-1 bg-gray-50 rounded-md text-xs font-medium">↵ Enter</span>
                    <span>to send</span>
                  </div>
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={disabled || (!text.trim() && !image)}
              className={cn(
                "flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl",
                "transition-all duration-200 group focus:outline-none",
                disabled || (!text.trim() && !image)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              )}
              title="Send"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>

          {/* AI thinking indicator */}
          {disabled && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span>AI is processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </section>
  )
}
