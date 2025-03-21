'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debug session state
  useEffect(() => {
    console.log('Role Selection Page - Session Status:', status);
    console.log('Role Selection Page - Session Data:', session);
  }, [session, status]);

  const selectRole = async (role: 'talent' | 'hiring_manager') => {
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Selecting role:', role);
      console.log('Current session:', session);
      
      if (!session?.user?.id) {
        throw new Error('User ID not found in session. Please try logging in again.');
      }
      
      // First, update the role in the database
      const response = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, userId: session.user.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set role');
      }

      console.log('Role updated in database successfully');
      
      // Sign out and redirect to login with a special parameter
      // This forces a complete session refresh
      const dashboardUrl = role === 'talent' ? '/dashboard/talent' : '/dashboard/hiring-manager';
      
      // Store the target URL in localStorage for retrieval after login
      localStorage.setItem('redirectAfterLogin', dashboardUrl);
      
      // Force sign out and redirect to login
      await signOut({ 
        redirect: true,
        callbackUrl: '/login?roleSelected=true'
      });
      
    } catch (error) {
      console.error('Error setting role:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Zirak HR Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            How will you use Zirak HR?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select your role to get started
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <button
              onClick={() => selectRole('talent')}
              disabled={isSubmitting}
              className="group relative w-full flex flex-col items-center py-6 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-lg font-semibold">I'm looking for a job</span>
              <p className="mt-2 text-sm text-indigo-200">
                Access job listings, build your profile, and submit applications
              </p>
            </button>
            
            <button
              onClick={() => selectRole('hiring_manager')}
              disabled={isSubmitting}
              className="group relative w-full flex flex-col items-center py-6 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-semibold">I'm hiring talent</span>
              <p className="mt-2 text-sm text-green-200">
                Post jobs, review applications, and find the perfect candidates
              </p>
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>You can change your role later in settings if needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
