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
      <div className="bg-white/80 border border-divider rounded-custom shadow-glass p-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-divider rounded-custom p-6",
            "flex items-center justify-center text-center",
            "transition-all duration-200 ease-in-out min-h-[100px]",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
            isDragActive && "border-primary bg-primary/5 scale-[1.01]"
          )}
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          aria-label="Upload. Drop a document. Supported: PDF, DOC, DOCX, CSV."
          onKeyDown={handleKeyDown}
        >
          <input {...getInputProps()} />
          
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
            </div>
            
            <div className="text-left">
              <h3 className="text-base font-semibold text-ink mb-1">
                Drop files here or click to upload
              </h3>
              <p className="text-sm text-muted">
                PDF, DOC, DOCX, CSV files supported
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={disabled || isUploading}
              className={cn(
                "px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm",
                "transition-all duration-200 ease-in-out flex-shrink-0",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                disabled || isUploading 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-primary-hover active:bg-primary-active"
              )}
            >
              {isUploading ? 'Uploading...' : 'Select files'}
            </button>
          </div>
          
          {isDragActive && !disabled && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-primary font-medium bg-white/90 px-3 py-1 rounded-full">
                Drop to upload
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
