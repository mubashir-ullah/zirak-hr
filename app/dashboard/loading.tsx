'use client'

import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}
