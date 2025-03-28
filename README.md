# Zirak HR: AI-Based HR Innovation App

## Overview
Zirak HR is an AI-powered HR innovation platform designed to streamline the hiring process by connecting IT professionals in Pakistan with hiring managers in Germany. The platform leverages advanced AI technologies, including Large Language Models (LLMs), to automate candidate assessments, job matching, and profile management. Zirak HR aims to make hiring faster, fairer, and more efficient while promoting sustainable and eco-friendly practices through green coding.

## Key Features

### For HR Managers:
- **AI-Powered Candidate Matching**: Automatically matches candidates to job openings based on skills, experience, and job requirements.
- **Advanced Search Filters**: Filter candidates by skills, location, German language proficiency (A1-B2), visa status, and availability.
- **Live Talent Pool**: Access a real-time database of candidates with up-to-date availability and profiles.
- **Bias-Free Recruitment**: Ensures hiring decisions are based solely on skills and qualifications, eliminating subjective biases.

### For Job Seekers:
- **1-Click Signup**: Sign up using Apple ID, GitHub, LinkedIn, or Google.
- **AI-Driven Profile Creation**: Automatically create profiles by uploading a resume or importing from LinkedIn.
- **AI-Powered Job Recommendations**: Receive tailored job recommendations based on skills and experience.
- **Skill Assessments**: Take AI-generated skill tests to improve visibility to recruiters.

### Eco-Friendly Practices:
- **Green Coding**: Optimized algorithms and cloud infrastructure to minimize energy consumption.
- **Sustainable Development**: Focus on reducing the environmental impact of AI technology.

## Technology Stack

### Frontend:
- **React.js + Next.js**: For a fast, responsive, and SEO-friendly user interface.
- **Material-UI (MUI) and Tailwind CSS**: For modern and customizable UI components.
- **Redux Toolkit**: For global state management.

### Backend:
- **Next.js API Routes**: For serverless API endpoints.
- **Supabase**: For authentication, database, and storage.
- **PostgreSQL**: For relational data storage via Supabase.
- **Python**: For AI/ML model integration and backend processing.

### AI/LLM Integration:
- **Deep Seek API**: For resume parsing, skill assessments, and job matching.
- **OpenAI GPT-4**: Fine-tuned for resume parsing and profile creation.
- **TensorFlow/PyTorch**: For custom AI models (if needed).
- **JobBERT Model**: JobBERT (jjzha/JobBERT) is a specialized transformer-based model adapted from the BERT architecture (bert-base-cased), specifically tailored for skill extraction from English job postings. It has undergone extensive domain-specific pre-training on approximately 3.2 million sentences from job advertisements, enhancing its understanding of employment-related language and terminology.
- **Apizhai/Albert-IT-JobRecommendation**: A lightweight transformer model built on ALBERT, optimized for job recommendation tasks. It was pre-trained using job-resume matching datasets in the IT sector, making it highly suitable for predicting job titles from resume text.

### Cloud & Deployment:
- **AWS/GCP**: For scalable, secure, and energy-efficient cloud hosting.
- **Docker + Kubernetes**: For containerization and orchestration to support scalability.

## Database Migration
Zirak HR has successfully migrated from MongoDB to Supabase to leverage Supabase's built-in authentication, real-time capabilities, and PostgreSQL database. The migration included:

### Key Components Migrated:
1. **Authentication System**: Replaced NextAuth.js with Supabase Auth
2. **Database Schema**: Created equivalent tables in Supabase for all MongoDB collections
3. **API Routes**: Updated all API routes to use Supabase client instead of MongoDB
4. **Storage**: Implemented file storage using Supabase Storage

### Benefits of Migration:
- **Improved Performance**: PostgreSQL's robust query capabilities enhance application performance
- **Real-time Capabilities**: Supabase's real-time subscriptions enable instant updates
- **Simplified Authentication**: Built-in auth with social providers streamlines user management
- **Row-Level Security**: Enhanced data protection with PostgreSQL's RLS policies
- **Reduced Complexity**: Single platform for auth, database, and storage reduces integration complexity



## System Architecture
Zirak HR follows a three-tier architecture:
- **Frontend (User Interface)**: Built with React.js and Next.js for a seamless user experience.
- **Backend (Business Logic & API Layer)**: Powered by Node.js and Express.js for efficient request handling.
- **Database Layer**: Supabase for storing user profiles, job postings, and AI-generated insights.
- **AI Processing Unit**: Dedicated AI module for resume parsing, job matching, and skill assessments.

## Project Structure

```
zirak-hr/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication related pages
│   ├── dashboard/         # Dashboard pages (talent & hiring manager)
│   ├── components/        # Shared components
│   └── contexts/          # React contexts
├── public/                # Static files
├── styles/                # Global styles
├── types/                 # TypeScript type definitions
├── lib/                   # Shared utilities
│   ├── supabase/         # Supabase related utilities
│   └── utils/            # General utilities
├── supabase/             # Supabase configurations and migrations
└── ai-service/           # Python AI service
```

## Best Practices

1. **File Organization**
   - Components are organized by feature/module
   - Shared components are in the components directory
   - API routes follow the same structure as the frontend pages
   - Utilities are properly separated in the lib directory

2. **Code Style**
   - TypeScript for type safety
   - ESLint and Prettier for code formatting
   - Absolute imports using @/ prefix
   - Proper error handling and logging

3. **Authentication**
   - Supabase Auth for authentication
   - Role-based access control
   - Protected API routes and pages
   - Secure session management

4. **Performance**
   - Server components where possible
   - Proper image optimization
   - API route optimization
   - Efficient database queries

5. **Testing**
   - Jest for unit tests
   - React Testing Library for component tests
   - API route testing
   - E2E testing with Cypress

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Supabase (v1.0 or higher)
- Docker (for containerization)

### Installation
#### Clone the Repository:
```bash
git clone https://github.com/your-repo/zirak-hr.git
cd zirak-hr
```

#### Install Dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Module
cd ../ai-module
pip install -r requirements.txt
```

#### Set Up Environment Variables:
Create a `.env` file in the backend and frontend directories. Add the necessary environment variables (e.g., Supabase URI, API keys).

#### Run the Application:
```bash
# Install Node Modules Dependencies
npm install
npm run dev

```

#### Access the Application:
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Technical Whitepaper

In the website's about us page, you will find the technical whitepaper and video about the team behind Zirak HR.

## Development Methodology
Zirak HR follows Agile Development with Scrum-based sprints:
- **Sprint Planning**: Every 2 weeks.
- **Daily Standups**: To sync progress and resolve issues.
- **CI/CD Pipeline**: Automated testing and deployment for stable releases.
- **User Testing & Feedback Loop**: Regular testing with HR managers and job seekers for real-world validation.

## Performance and Scalability

### Performance Goals:
- **Load Time**: Under 2 seconds for up to 1,000 concurrent users.
- **AI Accuracy**: 85% accuracy in candidate ranking and resume parsing.

### Scalability Plan:
- **Horizontal Scaling**: Using Docker and Kubernetes for dynamic resource allocation.
- **Future Goals**: Support over 50,000 users with optimized AI models and server infrastructure.

## Testing and Validation

### Testing Strategy:
- **Unit Tests**: For backend logic and AI modules.
- **Integration Tests**: For system interactions and API endpoints.
- **Beta Testing**: With 10 real users to validate core functionalities.

### Success Metrics:
- **Processing Speed**: 90% of requests processed within 2 seconds.
- **AI Accuracy**: 80% precision and recall in candidate matching.
- **User Satisfaction**: 85% of users satisfied with profile creation and job recommendations.

## Future Roadmap

### Next Steps:
- **Advanced AI Features**:
  - Automated job descriptions.
  - Adaptive interview questions.
  - HR queries chatbot.
- **Market Readiness**:
  - Add enterprise-level features.
  - Improve UI/UX for recruiters and job seekers.
- **SaaS Development**:
  - Transition to a fully scalable SaaS product.
- **Performance Optimization**:
  - Improve app speed and AI model accuracy.
- **Global Expansion**:
  - Expand to other countries and industries.

### Long-Term Vision:
Establish Zirak HR as the leading AI-powered hiring platform for the IT industry, connecting professionals worldwide with sustainable and efficient recruitment practices.


## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For inquiries or collaboration opportunities, please contact:

**Mubashir Ullah (Team Lead)**:
- 📧 1.mubashirullah@gmail.com
- 🔗 [LinkedIn](https://www.linkedin.com/in/mubashir-ullah/)
- 🐙 [GitHub](https://github.com/mubashir-ullah)

**Mansoor Khan**:
- 📧 mansoorkhan3799@gmail.com
- 🔗 [LinkedIn](https://www.linkedin.com/in/mansoor-khan-882019245/)
- 🐙 [GitHub](https://github.com/Mansoorkhan799)

**Muhammad Hamza Sirang**:
- 📧 hamzasirang.123@gmail.com
- 🔗 [LinkedIn](https://www.linkedin.com/in/muhammad-hamza-sirang-179b04268/)
- 🐙 [GitHub](https://github.com/HamxaSirang)

## Acknowledgments
We extend our gratitude to Ähdus Technology and MLSA SZABIST Islamabad Chapter for their support and guidance throughout this project. Special thanks to our mentors, team members, and beta testers for their invaluable contributions.

Thank you for exploring Zirak HR!
We are committed to revolutionizing the hiring process with AI-driven, sustainable, and efficient solutions.
