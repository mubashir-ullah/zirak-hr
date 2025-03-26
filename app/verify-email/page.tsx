'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { findUserByEmail } from '@/lib/supabaseDb';
import { ThemeAwareLogo } from '@/components/ThemeAwareLogo';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const supabase = createClientComponentClient();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setSuccess('Email verified successfully!');
      setIsSubmitting(false);

      // Get user data to determine their role
      try {
        const userResponse = await fetch(`/api/auth/get-user?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const userData = await userResponse.json();

        if (userResponse.ok && userData.user) {
          // Redirect based on user role
          const redirectPath = userData.user.role === 'talent'
            ? '/dashboard/talent'
            : userData.user.role === 'hiring_manager'
              ? '/dashboard/hiring-manager'
              : '/dashboard/role-selection'; // Fallback if role not set

          // Redirect after a short delay
          setTimeout(() => {
            router.push(redirectPath);
          }, 2000);
        } else {
          // Fallback to role selection if we can't determine the role
          setTimeout(() => {
            router.push(`/dashboard/role-selection?email=${encodeURIComponent(email)}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        // Fallback to role selection if there's an error
        setTimeout(() => {
          router.push(`/dashboard/role-selection?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setCountdown(60);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      // Start the resend countdown again
      const resendTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification code');
      setResendDisabled(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/register" className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Register
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md p-4 sm:p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <ThemeAwareLogo width={300} height={100} className="mx-auto" />
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a verification code to {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Code
              </label>
              <div className="mt-2 flex justify-center space-x-2 sm:space-x-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value && index < 5) {
                        const nextInput = document.getElementById(`otp-${index + 1}`);
                        if (nextInput) {
                          nextInput.focus();
                        }
                      }
                    }}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#d6ff00] focus:border-[#d6ff00] dark:bg-gray-800 dark:text-white"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-500 text-sm text-center">
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendDisabled}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendDisabled
                  ? `Resend code in ${countdown}s`
                  : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
