# Email Configuration for Password Reset

To enable email sending for password reset functionality, you need to add the following environment variables to your `.env.local` file:

```
# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@zirak-hr.com
```

## Options for Email Providers:

### 1. Gmail SMTP (for testing)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```
Note: For Gmail, you'll need to use an "App Password" instead of your regular password. You can generate one at https://myaccount.google.com/apppasswords

### 2. Outlook/Hotmail SMTP
```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-outlook@outlook.com
EMAIL_PASSWORD=your-password
```

### 3. Transactional Email Services (Recommended for Production)

#### SendGrid
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

## Development Testing

In development mode, if you don't configure these variables, the system will automatically use Ethereal (https://ethereal.email) to create a temporary test email account. You'll see a preview URL in the console or in the response when you request a password reset.

After adding these environment variables, restart your development server for the changes to take effect.
