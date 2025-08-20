/**
 * Enhanced Character Upload Component with Backend Integration
 * Handles file upload, backend processing, and character analysis
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { backendImageService, type BackendCharacterProfile } from '@/lib/backend-image-service';

interface CharacterUploadProps {
  onCharacterUploaded: (characterData: {
    characterId: string;
    imageUrl: string;
    profile: BackendCharacterProfile;
  }) => void;
  className?: string;
}

export function CharacterUpload({ onCharacterUploaded, className }: CharacterUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');

  // Check backend status on component mount
  React.useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const isAvailable = await backendImageService.checkBackendHealth();
      setBackendStatus(isAvailable ? 'available' : 'unavailable');
    } catch (error) {
      setBackendStatus('unavailable');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      console.log('📤 UPLOADING: Character image to backend');
      setUploadStatus('analyzing');

      // Process character file through backend
      const result = await backendImageService.processCharacterFile(file);
      
      if (result) {
        console.log('✅ CHARACTER: Upload and analysis complete');
        setUploadStatus('success');
        
        // Notify parent component
        onCharacterUploaded({
          characterId: result.characterId,
          imageUrl: result.imageUrl,
          profile: result.profile
        });
      } else {
        throw new Error('Failed to process character image');
      }

    } catch (error) {
      console.error('❌ CHARACTER UPLOAD ERROR:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onCharacterUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Upload className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading character image...';
      case 'analyzing':
        return backendStatus === 'available' 
          ? 'Analyzing character with AI...' 
          : 'Processing character (simulation mode)...';
      case 'success':
        return 'Character uploaded successfully!';
      case 'error':
        return errorMessage || 'Upload failed';
      default:
        return 'Drop your character image here or click to browse';
    }
  };

  const getBackendStatusBadge = () => {
    if (backendStatus === 'unknown') return null;
    
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Backend Ready' },
      unavailable: { color: 'bg-yellow-100 text-yellow-800', text: 'Simulation Mode' }
    };
    
    const config = statusConfig[backendStatus];
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Backend Status Badge */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upload Character Image</h3>
        {getBackendStatusBadge()}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
          ${uploadStatus === 'success' ? 'border-green-300 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {getStatusMessage()}
            </p>
            
            {uploadStatus === 'idle' && (
              <p className="text-sm text-gray-500 mt-2">
                Supports PNG, JPG, JPEG, GIF, WebP (max 10MB)
              </p>
            )}
            
            {uploadStatus === 'analyzing' && backendStatus === 'available' && (
              <p className="text-sm text-blue-600 mt-2">
                🤖 Using OpenAI Vision for character analysis...
              </p>
            )}
            
            {uploadStatus === 'analyzing' && backendStatus === 'unavailable' && (
              <p className="text-sm text-yellow-600 mt-2">
                🔄 Backend unavailable, using simulation mode
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Technical Details */}
      {uploadStatus === 'success' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">✅ Character Analysis Complete</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Character profile created and stored</p>
            <p>• {backendStatus === 'available' ? 'AI-powered' : 'Simulation'} image analysis complete</p>
            <p>• Ready for character-consistent story generation</p>
          </div>
        </div>
      )}

      {/* Error Details */}
      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">❌ Upload Failed</h4>
          <p className="text-sm text-red-700">{errorMessage}</p>
          <button
            onClick={() => setUploadStatus('idle')}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
