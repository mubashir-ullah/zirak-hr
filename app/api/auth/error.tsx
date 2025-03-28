'use client'

import ErrorComponent from '@/components/error/ErrorComponent'
import { useEffect } from 'react'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Authentication error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <ErrorComponent 
        error={error}
        title="Authentication Error"
        message="There was a problem with the authentication process. Please try again."
        showRetry={true}
        showHome={true}
      />
    </div>
  )
}
