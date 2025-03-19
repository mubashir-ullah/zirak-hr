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
- **Node.js + Express.js**: For API logic, authentication, and data processing.
- **MongoDB**: For flexible and scalable data storage.
- **Python**: For AI/ML model integration and backend processing.

### AI/LLM Integration:
- **Deep Seek API**: For resume parsing, skill assessments, and job matching.
- **OpenAI GPT-4**: Fine-tuned for resume parsing and profile creation.
- **TensorFlow/PyTorch**: For custom AI models (if needed).

### Cloud & Deployment:
- **AWS/GCP**: For scalable, secure, and energy-efficient cloud hosting.
- **Docker + Kubernetes**: For containerization and orchestration to support scalability.

## System Architecture
Zirak HR follows a three-tier architecture:
- **Frontend (User Interface)**: Built with React.js and Next.js for a seamless user experience.
- **Backend (Business Logic & API Layer)**: Powered by Node.js and Express.js for efficient request handling.
- **Database Layer**: MongoDB for storing user profiles, job postings, and AI-generated insights.
- **AI Processing Unit**: Dedicated AI module for resume parsing, job matching, and skill assessments.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v5.0 or higher)
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
Create a `.env` file in the backend and frontend directories. Add the necessary environment variables (e.g., MongoDB URI, API keys).

#### Run the Application:
```bash
# Start the backend server
cd backend
npm start

# Start the frontend development server
cd ../frontend
npm run dev

# Start the AI module
cd ../ai-module
python main.py
```

#### Access the Application:
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

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

## Contributing
We welcome contributions from the community! If you'd like to contribute to Zirak HR, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

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
