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

// Initialize the global OTP store if it doesn't exist
if (typeof global.__otpStore === 'undefined') {
  global.__otpStore = {};
}

// Ensure __otpStore is always defined for TypeScript
const getOtpStore = () => {
  if (typeof global.__otpStore === 'undefined') {
    global.__otpStore = {};
  }
  return global.__otpStore;
};

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
    
    // First, check if the email_verification table exists
    const { error: tableCheckError } = await supabase
      .from('email_verification')
      .select('count(*)', { count: 'exact', head: true });
    
    // If the table doesn't exist, use the fallback storage
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('The email_verification table does not exist, using fallback storage');
      return storeOTPInFallbackStorage(email, hashedOTP, expiresAt);
    }
    
    // Try to insert a new record
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
          return storeOTPInFallbackStorage(email, hashedOTP, expiresAt);
        }
      } else {
        console.log('New OTP record created successfully');
      }
      
      return true;
    } else {
      console.error('Error creating OTP record:', insertError);
      return storeOTPInFallbackStorage(email, hashedOTP, expiresAt);
    }
  } catch (error) {
    console.error('Error storing OTP:', error);
    return storeOTPInFallbackStorage(email, hashedOTP, expiresAt);
  }
};

// Helper function to store OTP in fallback storage
const storeOTPInFallbackStorage = (email: string, hashedOTP: string, expiresAt: Date): boolean => {
  try {
    // For server-side code, use the global variable as a temporary in-memory store
    const otpStore = getOtpStore();
    otpStore[email.toLowerCase()] = {
      email: email.toLowerCase(),
      hashed_otp: hashedOTP,
      expires_at: expiresAt.toISOString(),
      verified: false
    };
    
    console.log('Stored OTP in memory as fallback');
    return true;
  } catch (storageError) {
    console.error('Error storing OTP in fallback storage:', storageError);
    return false;
  }
};

// Verify the OTP
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log(`Verifying OTP for email: ${email}`);
    
    // Hash the provided OTP for comparison
    const hashedOTP = hashOTP(otp, email);
    console.log('OTP hashed for verification');
    
    // First try to get the stored OTP from the database
    const { data: storedOTP, error } = await supabase
      .from('email_verification')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // If there's an error or no data, check our fallback storage
    if (error || !storedOTP) {
      console.log('OTP not found in database, checking fallback storage');
      return verifyOTPFromFallbackStorage(email, hashedOTP);
    }

    // Check if the OTP has expired
    if (new Date(storedOTP.expires_at) < new Date()) {
      console.error('OTP has expired');
      return false;
    }

    // Compare the hashed OTPs
    if (hashedOTP !== storedOTP.hashed_otp) {
      console.error('OTP does not match');
      return false;
    }

    // Mark the email as verified
    try {
      await supabase
        .from('email_verification')
        .update({
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase());
      
      console.log('Email verification status updated in database');
    } catch (updateError) {
      console.error('Error updating verification status in database:', updateError);
      // Continue with verification even if the update fails
    }

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    // Try fallback verification as a last resort
    return verifyOTPFromFallbackStorage(email, hashOTP(otp, email));
  }
};

// Helper function to verify OTP from fallback storage
const verifyOTPFromFallbackStorage = (email: string, hashedOTP: string): boolean => {
  try {
    const otpStore = getOtpStore();
    const lowercaseEmail = email.toLowerCase();
    
    // Check server-side memory store
    if (otpStore[lowercaseEmail]) {
      const fallbackOTP = otpStore[lowercaseEmail];
      
      // Check if the OTP has expired
      if (new Date(fallbackOTP.expires_at) < new Date()) {
        console.error('OTP from fallback storage has expired');
        return false;
      }
      
      // Compare the hashed OTPs
      if (hashedOTP !== fallbackOTP.hashed_otp) {
        console.error('OTP from fallback storage does not match');
        return false;
      }
      
      // Mark as verified in our fallback storage
      otpStore[lowercaseEmail].verified = true;
      console.log('Email verified in fallback storage');
      
      return true;
    }
    
    console.error('OTP not found in fallback storage');
    return false;
  } catch (error) {
    console.error('Error verifying OTP from fallback storage:', error);
    return false;
  }
};

// Check if an email is verified
export const isEmailVerified = async (email: string): Promise<boolean> => {
  try {
    // First check in the database
    const { data, error } = await supabase
      .from('email_verification')
      .select('verified')
      .eq('email', email.toLowerCase())
      .single();

    if (!error && data) {
      return data.verified || false;
    }
    
    // If not found in database, check fallback storage
    const otpStore = getOtpStore();
    const lowercaseEmail = email.toLowerCase();
    
    if (otpStore[lowercaseEmail]) {
      return otpStore[lowercaseEmail].verified || false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
};
