# Zirak HR Platform

A modern HR platform built with Next.js that connects talent with hiring managers. The platform offers a seamless experience for both job seekers and recruiters with features tailored to their specific needs.

## Features

### Authentication & User Roles
- Secure email/password authentication
- Social login options (Google, LinkedIn, GitHub, Apple)
- Dual user roles: Talent and Hiring Manager
- Protected routes based on user roles

### User Interface
- Modern, responsive design
- Dark/Light theme support
- Multi-language support (English, German, Urdu)
- Intuitive navigation with mobile-friendly design

### Talent Features
- Professional profile creation
- Skills and experience showcase
- GitHub integration for developers
- Job search and application tracking

### Hiring Manager Features
- Company profile management
- Job posting and management
- Candidate search and filtering
- Application review system

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **State Management**: React Context
- **Icons**: React Icons
- **Internationalization**: Custom i18n implementation

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/your-username/zirak-hr.git
cd zirak-hr
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
zirak-hr/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Shared components
│   ├── contexts/          # React contexts
│   └── translations/      # Language files
├── components/            # UI components
├── lib/                   # Utility functions
├── models/               # Database models
├── public/               # Static files
└── styles/               # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 