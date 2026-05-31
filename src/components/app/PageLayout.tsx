"use client"

import React from 'react'
import AppHeader from './AppHeader'

interface PageLayoutProps {
  children: React.ReactNode
  maxWidth?: 'standard' | 'wide'
  className?: string
}

export default function PageLayout({ children, maxWidth = 'standard', className = '' }: PageLayoutProps) {
  return (
    <div className={`app ${className}`}>
      <AppHeader maxWidth={maxWidth} />
      {children}
    </div>
  )
}
