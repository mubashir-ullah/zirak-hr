'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image';

export default function RoleSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'talent' | 'hiring_manager' | ''>('');

  const supabase = createClientComponentClient();

  // Get user session and email
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, check if email was passed in URL params (from email verification)
        const emailParam = searchParams.get('email');
        if (emailParam) {
          setEmail(decodeURIComponent(emailParam));
        } else {
          // No session and no email param, redirect to login
          router.push('/login');
        }
      } else {
        // Session exists, set email and user ID
        setEmail(session.user.email || '');
        setUserId(session.user.id);
      }
    };
    
    checkSession();
  }, [router, searchParams, supabase.auth]);

  // Debug info
  useEffect(() => {
    console.log('Role Selection Page - Email:', email);
    console.log('Role Selection Page - User ID:', userId);
  }, [email, userId]);

  const handleRoleSelection = (role: 'talent' | 'hiring_manager') => {
    setSelectedRole(role);
    setError(''); // Clear any previous errors
  };

  const submitRoleSelection = async () => {
    // Validate role selection
    if (!selectedRole) {
      setError('Please select your role to continue');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('Selecting role:', selectedRole);

      // First, update the Supabase user metadata directly
      if (userId) {
        try {
          console.log('Updating Supabase user metadata with role:', selectedRole);
          const { error: updateMetadataError } = await supabase.auth.updateUser({
            data: { 
              role: selectedRole,
              needs_role_selection: false 
            }
          });

          if (updateMetadataError) {
            console.error('Error updating user metadata in Supabase:', updateMetadataError);
            // Continue anyway, as we'll update the database via API
          } else {
            console.log('User metadata updated in Supabase successfully');
          }
        } catch (updateError) {
          console.error('Failed to update user metadata:', updateError);
          // Continue anyway, as we'll update the database via API
        }
      }
      
      // Update the role in our database via API
      console.log('Updating role via API:', selectedRole);
      const response = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: selectedRole, 
          userId: userId || undefined,
          email: email
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set role');
      }

      const responseData = await response.json();
      console.log('Role updated successfully, API response:', responseData);
      
      // Refresh the session to ensure it has the latest user data
      try {
        await refreshSession();
        console.log('Session refreshed after role selection');
      } catch (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        // Continue anyway, the redirect should still work
      }
      
      // Force a full page reload to ensure the auth state is refreshed
      if (responseData.redirectTo) {
        console.log('Redirecting to dashboard:', responseData.redirectTo);
        window.location.href = responseData.redirectTo;
      } else {
        // Fallback redirect based on role
        const fallbackUrl = 
          selectedRole === 'talent' ? '/dashboard/talent' :
          selectedRole === 'hiring_manager' ? '/dashboard/hiring-manager' : 
          '/dashboard';
          
        console.log('No redirect URL in API response, using fallback:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      setError(error instanceof Error ? error.message : 'Failed to set role');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Zirak HR Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Choose Your Role
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Select how you want to use Zirak HR
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection('talent')}
            disabled={isSubmitting}
            className={`relative flex flex-col items-center p-6 border-2 border-primary/20 hover:border-primary rounded-lg transition-colors group ${selectedRole === 'talent' ? 'bg-primary/10' : ''}`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">I am Talent</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              Looking for job opportunities and career growth
            </p>
          </button>

          <button
            onClick={() => handleRoleSelection('hiring_manager')}
            disabled={isSubmitting}
            className={`relative flex flex-col items-center p-6 border-2 border-primary/20 hover:border-primary rounded-lg transition-colors group ${selectedRole === 'hiring_manager' ? 'bg-primary/10' : ''}`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">I am a Hiring Manager</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              Looking to hire talent for my organization
            </p>
          </button>
        </div>

        <button
          onClick={submitRoleSelection}
          disabled={isSubmitting}
          className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded"
        >
          {isSubmitting ? 'Processing...' : 'Submit'}
        </button>

        {isSubmitting && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Processing your selection...
          </div>
        )}
      </div>
    </div>
  );
}
