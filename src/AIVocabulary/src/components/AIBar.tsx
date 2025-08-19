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
      {/* Style reference chip - shown above the input when image is attached */}
      {imagePreview && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
            <img 
              src={imagePreview} 
              alt="Style reference" 
              className="w-6 h-6 object-cover rounded"
            />
            <span className="text-sm text-primary font-medium">Style ref</span>
            <button
              onClick={removeImage}
              className="text-primary hover:text-primary-hover ml-1 text-lg leading-none"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main input bar */}
      <div className="relative flex items-center bg-white border border-divider rounded-custom shadow-sm overflow-hidden">
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-12 h-12 flex items-center justify-center",
            "text-muted hover:text-primary transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Attach image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Attach a picture of your favorite characters."
          disabled={disabled}
          className={cn(
            "flex-1 h-12 px-4 bg-transparent text-ink placeholder-muted",
            "border-none outline-none resize-none",
            "focus:ring-0",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || (!text.trim() && !image)}
          className={cn(
            "flex-shrink-0 w-12 h-12 flex items-center justify-center",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
            disabled || (!text.trim() && !image)
              ? "text-gray-300 cursor-not-allowed"
              : "text-primary hover:text-primary-hover hover:bg-primary/5"
          )}
          aria-label="Send"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="rotate-45"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
        </button>

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
