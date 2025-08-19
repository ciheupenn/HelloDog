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
      <div className="bg-white/80 border border-divider rounded-custom shadow-glass p-6">
        {imagePreview && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <img 
                src={imagePreview} 
                alt="Style reference" 
                className="w-8 h-8 object-cover rounded"
              />
              <span className="text-sm text-primary font-medium">Style ref</span>
              <button
                onClick={removeImage}
                className="text-primary hover:text-primary-hover ml-1"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="flex items-end gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-custom border border-divider",
                "flex items-center justify-center text-muted",
                "transition-all duration-200 hover:border-primary hover:text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Attach image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me more… for example, attach a picture of your favorite characters."
                disabled={disabled}
                className={cn(
                  "w-full min-h-[44px] max-h-32 px-4 py-3 rounded-custom",
                  "border border-divider bg-white text-ink placeholder-muted",
                  "resize-none transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                rows={1}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={disabled || (!text.trim() && !image)}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-custom bg-primary text-white",
                "flex items-center justify-center",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                disabled || (!text.trim() && !image)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary-hover active:bg-primary-active hover:scale-105"
              )}
              aria-label="Send"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>
    </section>
  )
}
