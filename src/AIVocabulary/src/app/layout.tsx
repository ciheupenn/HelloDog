import './globals.css'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LexiForge - AI Vocabulary Learning',
  description: 'Learn vocabulary from your documents with AI-powered story generation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface antialiased">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '16px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              style: {
                border: '1px solid #10B981',
                backgroundColor: '#F0FDF4',
                color: '#059669',
              },
            },
            error: {
              style: {
                border: '1px solid #EF4444',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
