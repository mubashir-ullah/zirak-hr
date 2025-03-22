'use client'

import { useLanguage } from "../contexts/LanguageContext"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  UserCircle, 
  Briefcase, 
  Users, 
  Award, 
  ClipboardList, 
  MousePointerClick,
  Leaf,
  UserRound,
  Sparkles,
  LineChart,
  Shield,
  CheckCircle
} from "lucide-react"
import { useEffect } from 'react';

export function Features() {
  const { t } = useLanguage()

  // Categorized features
  const talentFeatures = [
    {
      icon: <Brain className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Quick Profile Creation'),
      description: t('Create your professional profile in minutes with our AI-powered resume parser and intuitive interface.'),
    },
    {
      icon: <Briefcase className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Job Matching'),
      description: t('Our AI algorithm matches you with the perfect opportunities based on your skills, experience, and preferences.'),
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Skills Assessment Tests'),
      description: t('Showcase your abilities with our comprehensive skills tests and get certified to stand out to potential employers.'),
    },
    {
      icon: <MousePointerClick className="w-12 h-12 text-[#d6ff00]" />,
      title: t('On-Click Job Apply'),
      description: t('Apply to multiple positions with a single click and track your applications in real-time.'),
    },
    {
      icon: <LineChart className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Career Growth Insights'),
      description: t('Get personalized recommendations for skills development and career advancement opportunities.'),
    },
  ]

  const recruiterFeatures = [
    {
      icon: <UserCircle className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Talent Matching'),
      description: t('Our AI-powered system identifies the most qualified candidates for your job openings, saving you time and resources.'),
    },
    {
      icon: <Users className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Talent Pool'),
      description: t('Access a diverse pool of pre-vetted candidates with advanced search filters to find the perfect match.'),
    },
    {
      icon: <Award className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Skill Assessment'),
      description: t('Evaluate candidates with our comprehensive AI-powered skills assessment tools to ensure they meet your requirements.'),
    },
    {
      icon: <ClipboardList className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Application Tracking'),
      description: t('Monitor candidate applications in real-time with our intuitive dashboard and streamlined workflow.'),
    },
  ]

  const platformFeatures = [
    {
      icon: <UserRound className="w-12 h-12 text-[#d6ff00]" />,
      title: t('User Friendly Interface'),
      description: t('Enjoy a clean, intuitive interface designed for maximum efficiency and minimal learning curve.'),
    },
    {
      icon: <Leaf className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Green Coding and Sustainability'),
      description: t('Our eco-friendly application is built with sustainable coding practices to minimize environmental impact.'),
    },
    {
      icon: <Shield className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Data Security'),
      description: t('Your information is protected with enterprise-grade security measures and compliance with international standards.'),
    },
    {
      icon: <Sparkles className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Continuous Innovation'),
      description: t('We regularly update our platform with new features and improvements based on user feedback and industry trends.'),
    },
  ]

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent">
            {t('Innovative HR Features')}
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('From smart resume parsing to intelligent candidate matching – Zirak HR transforms the way you recruit and find opportunities in the global talent marketplace.')}
        </p>
      </div>

      <Tabs defaultValue="talent" className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="talent" className="text-sm md:text-base">
              {t('For Talent')}
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="text-sm md:text-base">
              {t('For Recruiters')}
            </TabsTrigger>
            <TabsTrigger value="platform" className="text-sm md:text-base">
              {t('Platform')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="talent" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {talentFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recruiter" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {recruiterFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="platform" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {platformFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Feature card component with animation
interface FeatureProps {
  feature: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureProps) => {
  useEffect(() => {
    // Create and append style element only on the client side
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-[#d6ff00] dark:hover:border-[#d6ff00] overflow-hidden"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0,
        transform: 'translateY(20px)'
      }}
    >
      <div className="mb-4">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </Card>
  )
}