import { createHash, randomBytes } from 'crypto';
import supabase from './supabase';

// Declare global type for the OTP store
declare global {
  var __otpStore: {
    [email: string]: {
      email: string;
      hashed_otp: string;
      expires_at: string;
      verified: boolean;
    }
  } | undefined;
}

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  // Generate a random number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash the OTP for secure storage
export const hashOTP = (otp: string, email: string): string => {
  return createHash('sha256')
    .update(`${otp}${email}${process.env.JWT_SECRET || 'zirakhr-secret-key-2024'}`)
    .digest('hex');
};

// Store the OTP in Supabase
export const storeOTP = async (email: string, hashedOTP: string, expiresAt: Date): Promise<boolean> => {
  try {
    console.log('Attempting to store OTP for email:', email);
    
    // First, try to insert directly - this will work if the table exists
    const { error: insertError } = await supabase
      .from('email_verification')
      .insert({
        email: email.toLowerCase(),
        hashed_otp: hashedOTP,
        expires_at: expiresAt.toISOString(),
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    // If there's no error or the error is a unique violation (meaning the record already exists),
    // then we can proceed with an update
    if (!insertError || (insertError.code === '23505')) { // 23505 is the Postgres error code for unique_violation
      if (insertError?.code === '23505') {
        console.log('Record already exists, updating instead');
        
        // Update the existing record
        const { error: updateError } = await supabase
          .from('email_verification')
          .update({
            hashed_otp: hashedOTP,
            expires_at: expiresAt.toISOString(),
            verified: false,
            updated_at: new Date().toISOString()
          })
          .eq('email', email.toLowerCase());
        
        if (updateError) {
          console.error('Error updating OTP record:', updateError);
          return false;
        }
      } else {
        console.log('New OTP record created successfully');
      }
      
      return true;
    } 
    // If the error is that the relation doesn't exist, we need to handle it differently
    else if (insertError.code === '42P01') { // 42P01 is the Postgres error code for undefined_table
      console.error('The email_verification table does not exist:', insertError);
      
      // Since we can't create the table through the API, let's use an alternative approach
      // Store the OTP in localStorage or sessionStorage temporarily
      if (typeof window !== 'undefined') {
        console.log('Storing OTP in session storage as fallback');
        // This is a fallback for client-side code
        try {
          sessionStorage.setItem(`otp_${email.toLowerCase()}`, JSON.stringify({
            email: email.toLowerCase(),
            hashed_otp: hashedOTP,
            expires_at: expiresAt.toISOString(),
            verified: false
          }));
          return true;
        } catch (storageError) {
          console.error('Error storing OTP in session storage:', storageError);
          return false;
        }
      } else {
        // For server-side code, we need a different fallback
        // Let's use a global variable as a temporary in-memory store
        if (typeof global.__otpStore === 'undefined') {
          global.__otpStore = {};
        }
        
        global.__otpStore[email.toLowerCase()] = {
          email: email.toLowerCase(),
          hashed_otp: hashedOTP,
          expires_at: expiresAt.toISOString(),
          verified: false
        };
        
        console.log('Stored OTP in memory as fallback');
        return true;
      }
    } else {
      console.error('Error creating OTP record:', insertError);
      return false;
    }
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

// Verify the OTP
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    // First try to get the stored OTP from the database
    const { data: storedOTP, error } = await supabase
      .from('email_verification')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // If there's an error or no data, check our fallback storage
    if (error || !storedOTP) {
      console.log('OTP not found in database, checking fallback storage');
      
      let fallbackOTP = null;
      
      // Check client-side storage if available
      if (typeof window !== 'undefined') {
        const storedData = sessionStorage.getItem(`otp_${email.toLowerCase()}`);
        if (storedData) {
          fallbackOTP = JSON.parse(storedData);
        }
      } 
      // Check server-side memory store
      else if (typeof global.__otpStore !== 'undefined' && global.__otpStore[email.toLowerCase()]) {
        fallbackOTP = global.__otpStore[email.toLowerCase()];
      }
      
      // If we still don't have the OTP, verification fails
      if (!fallbackOTP) {
        console.error('OTP not found in any storage');
        return false;
      }
      
      // Check if the OTP has expired
      if (new Date(fallbackOTP.expires_at) < new Date()) {
        console.error('OTP has expired');
        return false;
      }
      
      // Hash the provided OTP and compare with the stored hash
      const hashedOTP = hashOTP(otp, email);
      if (hashedOTP !== fallbackOTP.hashed_otp) {
        console.error('OTP does not match');
        return false;
      }
      
      // Mark as verified in our fallback storage
      if (typeof window !== 'undefined') {
        const updatedData = { ...fallbackOTP, verified: true };
        sessionStorage.setItem(`otp_${email.toLowerCase()}`, JSON.stringify(updatedData));
      } else if (typeof global.__otpStore !== 'undefined') {
        global.__otpStore[email.toLowerCase()].verified = true;
      }
      
      return true;
    }

    // Check if the OTP has expired
    if (new Date(storedOTP.expires_at) < new Date()) {
      return false;
    }

    // Hash the provided OTP and compare with the stored hash
    const hashedOTP = hashOTP(otp, email);
    if (hashedOTP !== storedOTP.hashed_otp) {
      return false;
    }

    // Mark the email as verified
    await supabase
      .from('email_verification')
      .update({
        verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

// Check if an email is verified
export const isEmailVerified = async (email: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('email_verification')
      .select('verified')
      .eq('email', email.toLowerCase())
      .single();

    return data?.verified || false;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
};
