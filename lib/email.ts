import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string; cid: string }[];
}

interface EmailResult {
  success: boolean;
  previewUrl?: string;
  message?: string;
}

// Create a transporter object
const createTransporter = async () => {
  console.log('Creating email transporter');
  
  // For production, use actual SMTP credentials
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('Using configured email settings from environment variables');
    console.log(`Email host: ${process.env.EMAIL_HOST}`);
    console.log(`Email port: ${process.env.EMAIL_PORT}`);
    console.log(`Email user: ${process.env.EMAIL_USER}`);
    console.log(`Email from: ${process.env.EMAIL_FROM}`);
    
    try {
      // Gmail specific configuration
      const isGmail = process.env.EMAIL_HOST.includes('gmail');
      
      const transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        // Add specific settings for Gmail
        ...(isGmail && {
          tls: {
            rejectUnauthorized: true,
          },
        }),
      };
      
      console.log('Creating transporter with config:', JSON.stringify({
        ...transporterConfig,
        auth: { 
          user: transporterConfig.auth.user,
          pass: '********' // Don't log the actual password
        }
      }, null, 2));
      
      const transporter = nodemailer.createTransport(transporterConfig);
      
      // Verify connection configuration
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('SMTP connection verified successfully');
      return transporter;
    } catch (error) {
      console.error('Error with configured email settings:', error);
      console.log('Falling back to test account...');
      // Fall through to test account creation
    }
  } else {
    console.log('No email configuration found in environment variables');
    console.log('Using test email account for development');
  }
  
  // For development or if no email settings are provided, use Ethereal
  try {
    console.log('Creating test email account for development');
    const testAccount = await nodemailer.createTestAccount();
    
    // Log the test account credentials for debugging
    console.log('Test email account created:');
    console.log('- Username:', testAccount.user);
    console.log('- Password:', testAccount.pass);
    console.log('- SMTP Host: smtp.ethereal.email');
    console.log('- SMTP Port: 587');
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Error creating test email account:', error);
    
    // Fallback to a fake transporter that just logs messages
    console.log('Using fake email transporter as fallback');
    return {
      sendMail: async (options: any) => {
        console.log('FAKE EMAIL SENT:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.html.substring(0, 100) + '...');
        return { messageId: 'fake-email-' + Date.now() };
      },
      verify: async () => true
    } as any;
  }
};

// Send email function
export const sendEmail = async ({ to, subject, html, attachments }: EmailOptions): Promise<EmailResult> => {
  try {
    console.log('Sending email to:', to);
    console.log('Email subject:', subject);
    
    // Log environment variables (without sensitive values)
    console.log('Email environment check:');
    console.log('- EMAIL_HOST configured:', !!process.env.EMAIL_HOST);
    console.log('- EMAIL_USER configured:', !!process.env.EMAIL_USER);
    console.log('- EMAIL_PASSWORD configured:', !!process.env.EMAIL_PASSWORD);
    console.log('- EMAIL_FROM configured:', !!process.env.EMAIL_FROM);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    
    const transporter = await createTransporter();
    
    console.log('Email transporter created successfully');
    
    const info = await transporter.sendMail({
      from: `"Zirak HR" <${process.env.EMAIL_FROM || 'noreply@zirak-hr.com'}>`,
      to,
      subject,
      html,
      attachments,
    });
    
    console.log('Email sent: %s', info.messageId);
    
    // Get preview URL for Ethereal emails
    let previewUrl: string | undefined;
    if (info && typeof (nodemailer as any).getTestMessageUrl === 'function') {
      const url = (nodemailer as any).getTestMessageUrl(info);
      if (url) {
        previewUrl = url.toString();
        console.log('Preview URL: %s', previewUrl);
        
        // Log more prominently for development environment
        if (process.env.NODE_ENV !== 'production') {
          console.log('');
          console.log('============================================');
          console.log('📧 TEST EMAIL SENT - VIEW AT THIS URL:');
          console.log(previewUrl);
          console.log('============================================');
          console.log('');
        }
      }
    }
    
    return { 
      success: true,
      previewUrl,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    
    // Try to provide more context about the error
    if (error instanceof Error && 'code' in error) {
      console.error('Error code:', (error as any).code);
    }
    
    // Gmail-specific error handling
    if (process.env.EMAIL_HOST?.includes('gmail') && errorMessage.includes('535')) {
      console.error('');
      console.error('============================================');
      console.error('GMAIL AUTHENTICATION ERROR');
      console.error('This is likely due to one of these issues:');
      console.error('1. Your Gmail password is incorrect');
      console.error('2. You need to use an App Password instead of your regular password');
      console.error('3. You need to enable "Less secure app access" in your Google account');
      console.error('4. Your Google account has 2FA enabled and requires an App Password');
      console.error('');
      console.error('To create an App Password:');
      console.error('- Go to your Google Account > Security');
      console.error('- Under "Signing in to Google," select App Passwords');
      console.error('- Generate a new App Password for "Mail" and "Other"');
      console.error('- Use that 16-character password in your EMAIL_PASSWORD env var');
      console.error('============================================');
      console.error('');
    }
    
    return { 
      success: false, 
      message: `Failed to send email: ${errorMessage}`
    };
  }
};

// Password reset email template
export const sendPasswordResetEmail = async (to: string, resetToken: string, baseUrl: string): Promise<EmailResult> => {
  console.log('Preparing password reset email');
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  console.log('Reset URL:', resetUrl);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px 30px 20px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #333333; font-size: 24px; font-weight: bold;">Reset Your Password</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">Hello,</p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">You requested to reset your password for your Zirak HR account. Click the button below to reset it:</p>
                  <p style="margin: 30px 0; text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #d6ff00; color: #000000; font-weight: bold; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Reset Password</a>
                  </p>
                  <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #333333;">If you didn't request this, you can safely ignore this email.</p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">This link will expire in 1 hour for security reasons.</p>
                  <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #333333;">If the button above doesn't work, copy and paste this URL into your browser:</p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.5; color: #666666; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #0066cc; text-decoration: underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="margin: 0; font-size: 14px; color: #666666;">&copy; ${new Date().getFullYear()} Zirak HR. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: 'Reset Your Zirak HR Password',
    html,
  });
};

// Send OTP verification email
export const sendOTPVerificationEmail = async (to: string, otp: string): Promise<EmailResult> => {
  console.log(`Preparing OTP verification email for ${to} with code: ${otp}`);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:company-logo" alt="Zirak HR Logo" style="height: 80px; width: auto;">
      </div>
      <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
      <p style="color: #666; line-height: 1.5;">Thank you for registering with Zirak HR. Please use the following verification code to complete your registration:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        ${otp}
      </div>
      <p style="color: #666; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Zirak HR. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Verify Your Email - Zirak HR',
    html,
    attachments: [
      {
        filename: 'company-logo.png',
        path: './public/favicon/android-chrome-192x192.png',
        cid: 'company-logo'
      }
    ]
  });
};
