# Gmail App Password Instructions

To use Gmail for sending emails in your application, you need to set up an App Password. This is because Gmail has increased security that blocks "less secure apps" from accessing your account with just your regular password.

## Steps to Create a Gmail App Password

1. **Enable 2-Step Verification**
   - Go to your Google Account: https://myaccount.google.com/
   - Select "Security" from the left menu
   - Under "Signing in to Google," select "2-Step Verification" and turn it on
   - Follow the steps to verify your phone number

2. **Create an App Password**
   - After enabling 2-Step Verification, go back to the Security page
   - Under "Signing in to Google," select "App passwords"
   - At the bottom, select "Select app" and choose "Mail"
   - Select "Other (Custom name)" and enter "Zirak HR"
   - Click "Generate"
   - Google will display a 16-character password - **copy this password**

3. **Update Your .env File**
   - Replace your current EMAIL_PASSWORD with this 16-character App Password
   - Make sure there are no spaces in the password

## Example .env Configuration

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Your 16-character App Password
EMAIL_FROM=your-gmail@gmail.com
```

After updating your .env file, restart your development server for the changes to take effect.
