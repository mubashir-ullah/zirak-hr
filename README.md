# Zirak HR - AI Powered HR Innovation App

## Overview
Zirak HR is a modern, full-stack Human Resource Management System built with Next.js 15, TypeScript, and MongoDB. This application provides a comprehensive solution for managing employee data, talent acquisition, and HR processes in a user-friendly interface.

## Features
- 🔐 **Authentication & Authorization**
  - Secure login and registration system
  - Role-based access control
  - JWT-based authentication

- 👥 **Employee Management**
  - Employee profiles and information
  - Talent dashboard
  - Employee performance tracking

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/Light mode support
  - Beautiful and intuitive interface
  - Built with Tailwind CSS and Radix UI components

- 🌐 **Internationalization**
  - Multi-language support
  - Easy language switching

- 📱 **Responsive Design**
  - Mobile-first approach
  - Works seamlessly across all devices

## Tech Stack
- **Frontend:**
  - Next.js 15
  - React 19
  - TypeScript
  - Tailwind CSS
  - Radix UI Components
  - React Hook Form
  - Zod for validation

- **Backend:**
  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - JWT for token management

- **Development Tools:**
  - TypeScript
  - ESLint
  - PostCSS
  - Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mubashir-ullah/zirak-hr.git
cd zirak-hr
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add the following variables:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
zirak-hr/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── dashboard/         # Dashboard pages
│   ├── features/          # Feature-specific components
│   └── translations/      # i18n translations
├── public/                # Static assets
├── types/                 # TypeScript type definitions
├── lib/                   # Utility functions
└── models/               # MongoDB models
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Author
- **Mubashir Ullah**
  - GitHub: [mubashir-ullah](https://github.com/mubashir-ullah)
  - LinkedIn: [Mubashir Ullah](https://www.linkedin.com/in/mubashir-ullah/)

## Acknowledgments
- Next.js team for the amazing framework
- Vercel for hosting and deployment
- All contributors and maintainers of the open-source libraries used in this project 
