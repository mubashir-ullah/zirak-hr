'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ErrorComponentProps {
  error?: Error | string
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
}

export default function ErrorComponent({
  error,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  showRetry = true,
  showHome = true,
}: ErrorComponentProps) {
  const router = useRouter()
  
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message || 'Unknown error'
    : message

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && (
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 bg-[#d6ff00] text-black font-medium rounded-md hover:bg-[#c2e600] focus:outline-none focus:ring-2 focus:ring-[#d6ff00] focus:ring-opacity-50"
            >
              Try Again
            </button>
          )}
          
          {showHome && (
            <Link
              href="/"
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
