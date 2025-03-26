# Email Configuration Instructions

To enable email sending in development, you need to configure the email settings in your `.env.local` file. Follow these steps:

## Option 1: Use Gmail SMTP (Recommended for testing)

1. Add the following to your `.env.local` file:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-gmail@gmail.com
```

2. For `EMAIL_PASSWORD`, you need to use an App Password:
   - Go to your Google Account > Security
   - Enable 2-Step Verification if not already enabled
   - Go to App passwords
   - Select "Mail" and "Other" (Custom name), name it "Zirak HR"
   - Copy the generated 16-character password

## Option 2: Use Mailtrap (Alternative for testing)

1. Sign up for a free account at [Mailtrap](https://mailtrap.io/)
2. Go to Email Testing > Inboxes > SMTP Settings
3. Select "Nodemailer" from the dropdown
4. Copy the configuration to your `.env.local` file

## Option 3: Continue using Ethereal (Current setup)

The current setup uses Ethereal, which creates temporary test email accounts. When you register, check the server logs for a URL that looks like:

```
📧 TEST EMAIL PREVIEW URL:
https://ethereal.email/message/...
```

Open this URL to view the email with your OTP code.

## After Configuration

After updating your `.env.local` file, restart the development server:

```
npm run dev
```
