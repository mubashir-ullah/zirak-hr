'use client'

import { Suspense } from 'react'
import Analytics from '@/components/dashboard/hr/Analytics'
import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-10 w-[600px] rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    }>
      <Analytics />
    </Suspense>
  )
}
