'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { VocabSet } from '@/types'
import { cn } from '@/lib/utils'

interface UploadCardProps {
  onResult?: (vocab: VocabSet) => void
  onError?: (err: Error) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/csv': ['.csv'],
}

export default function UploadCard({
  onResult,
  onError,
  disabled = false,
}: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false)

  const processFiles = useCallback(async (files: File[]) => {
    if (disabled || files.length === 0) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        
        switch (response.status) {
          case 415:
            errorMessage = 'Unsupported file type'
            break
          case 422:
            errorMessage = 'Invalid or empty file'
            break
          case 500:
            errorMessage = 'Server error processing file'
            break
        }
        
        throw new Error(errorMessage)
      }

      const vocabSet: VocabSet = await response.json()
      
      // Show success feedback
      const fileNames = files.map(f => f.name).join(', ')
      toast.success(`Added: ${fileNames}`)
      
      onResult?.(vocabSet)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      toast.error(err.message)
      onError?.(err)
    } finally {
      setIsUploading(false)
    }
  }, [disabled, onResult, onError])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      toast.error("That type isn't supported. Try PDF, DOC, DOCX, or CSV.")
    }

    // Process accepted files
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles)
    }
  }, [processFiles])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled: disabled || isUploading,
    noClick: true,
    multiple: true,
  })

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !disabled && !isUploading) {
      event.preventDefault()
      open()
    }
  }, [open, disabled, isUploading])

  const handleButtonClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    if (!disabled && !isUploading) {
      open()
    }
  }, [open, disabled, isUploading])

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="bg-white/80 border border-divider rounded-custom shadow-glass p-8">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-divider rounded-custom p-12",
            "flex flex-col items-center justify-center text-center",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
            isDragActive && "border-primary bg-primary/5 scale-[1.02]"
          )}
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          aria-label="Upload. Drop a document. Supported: PDF, DOC, DOCX, CSV."
          onKeyDown={handleKeyDown}
        >
          <input {...getInputProps()} />
          
          <h2 className="text-lg font-semibold text-ink mb-3">
            Drag and drop files to upload
          </h2>
          
          <p className="text-sm text-muted mb-8">
            PDF • DOC • DOCX • CSV
          </p>
          
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled || isUploading}
            className={cn(
              "px-8 py-3 bg-primary text-white rounded-custom font-medium",
              "min-h-[44px] min-w-[140px] text-sm",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              disabled || isUploading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-primary-hover active:bg-primary-active hover:scale-105"
            )}
          >
            {isUploading ? 'Uploading...' : 'Select files'}
          </button>
          
          {isDragActive && !disabled && !isUploading && (
            <p className="text-sm text-primary mt-4 animate-fade-in">
              Drop to add
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
