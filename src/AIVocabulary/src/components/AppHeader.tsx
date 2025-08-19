'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  user?: {
    name: string
    avatar?: string
  }
}

export default function AppHeader({ user }: AppHeaderProps) {
  const [showAccountPanel, setShowAccountPanel] = useState(false)

  const toggleAccountPanel = () => {
    setShowAccountPanel(!showAccountPanel)
  }

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked')
    setShowAccountPanel(false)
  }

  return (
    <header className="w-full bg-white/90 backdrop-blur-sm border-b border-divider sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-ink">LexiForge</h1>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center gap-3">
            {/* Settings */}
            <button
              className={cn(
                "p-2 rounded-lg text-muted hover:text-ink hover:bg-gray-100",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 14v6m11-11h-6m-14 0h6m15.5-4.5l-4.24 4.24M4.74 4.74l4.24 4.24m12.72 0l-4.24-4.24M4.74 19.26l4.24-4.24"></path>
              </svg>
            </button>

            {/* User Avatar/Account */}
            <div className="relative">
              <button
                onClick={toggleAccountPanel}
                className={cn(
                  "w-8 h-8 rounded-full bg-primary text-white font-medium text-sm",
                  "flex items-center justify-center",
                  "transition-all duration-200 hover:bg-primary-hover",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                aria-label="Account menu"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </button>

              {/* Account Panel */}
              {showAccountPanel && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-custom shadow-elevation border border-divider py-2 animate-slide-up">
                  <div className="px-4 py-2 border-b border-divider">
                    <p className="text-sm font-medium text-ink">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted">Free Plan</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close account panel */}
      {showAccountPanel && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowAccountPanel(false)}
        />
      )}
    </header>
  )
}
