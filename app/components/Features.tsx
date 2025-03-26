'use client'

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
  // Categorized features
  const talentFeatures = [
    {
      icon: <Brain className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Quick Profile Creation',
      description: 'Create your professional profile in minutes with our AI-powered resume parser and intuitive interface.',
    },
    {
      icon: <Briefcase className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Job Matching',
      description: 'Our AI algorithm matches you with the perfect opportunities based on your skills, experience, and preferences.',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Skills Assessment Tests',
      description: 'Showcase your abilities with our comprehensive skills tests and get certified to stand out to potential employers.',
    },
    {
      icon: <MousePointerClick className="w-12 h-12 text-[#d6ff00]" />,
      title: 'On-Click Job Apply',
      description: 'Apply to multiple positions with a single click and track your applications in real-time.',
    },
    {
      icon: <LineChart className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Career Growth Insights',
      description: 'Get personalized recommendations for skills development and career advancement opportunities.',
    },
  ]

  const recruiterFeatures = [
    {
      icon: <UserCircle className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Talent Matching',
      description: 'Our AI-powered system identifies the most qualified candidates for your job openings, saving you time and resources.',
    },
    {
      icon: <Users className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Talent Pool',
      description: 'Access a diverse pool of pre-vetted candidates with advanced search filters to find the perfect match.',
    },
    {
      icon: <Award className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Skill Assessment',
      description: 'Evaluate candidates with our comprehensive AI-powered skills assessment tools to ensure they meet your requirements.',
    },
    {
      icon: <ClipboardList className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Application Tracking',
      description: 'Monitor candidate applications in real-time with our intuitive dashboard and streamlined workflow.',
    },
  ]

  const platformFeatures = [
    {
      icon: <UserRound className="w-12 h-12 text-[#d6ff00]" />,
      title: 'User Friendly Interface',
      description: 'Enjoy a clean, intuitive interface designed for maximum efficiency and minimal learning curve.',
    },
    {
      icon: <Leaf className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Green Coding and Sustainability',
      description: 'Our eco-friendly application is built with sustainable coding practices to minimize environmental impact.',
    },
    {
      icon: <Shield className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Data Security',
      description: 'Your information is protected with enterprise-grade security measures and compliance with international standards.',
    },
    {
      icon: <Sparkles className="w-12 h-12 text-[#d6ff00]" />,
      title: 'Continuous Innovation',
      description: 'We regularly update our platform with new features and improvements based on user feedback and industry trends.',
    },
  ]

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif mb-4 relative">
            <span className="bg-gradient-to-r from-black via-[#4a9c2d] to-[#d6ff00] dark:from-white dark:via-[#9cff57] dark:to-[#d6ff00] bg-clip-text text-transparent inline-block pb-2">
              Platform Features
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how our platform connects Pakistani tech talent with German employers through innovative features
          </p>
        </div>
        
        <Tabs defaultValue="talent" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="talent" className="text-sm md:text-base">For Talent</TabsTrigger>
            <TabsTrigger value="recruiters" className="text-sm md:text-base">For Employers</TabsTrigger>
            <TabsTrigger value="platform" className="text-sm md:text-base">Platform</TabsTrigger>
          </TabsList>
          
          <TabsContent value="talent" className="mt-2">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {talentFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recruiters" className="mt-2">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {recruiterFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="platform" className="mt-2">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {platformFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

// Feature card component with animation
interface FeatureProps {
  feature: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
  index: number
}

function FeatureCard({ feature, index }: FeatureProps) {
  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-500 hover:shadow-xl relative group">
      {/* Animated border effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#d6ff00] rounded-lg transition-all duration-500"></div>
      
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#d6ff00]/0 group-hover:to-[#d6ff00]/10 transition-all duration-500"></div>
      
      <div className="p-6 relative z-10">
        <div className="mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold mb-2 transition-all duration-300 group-hover:text-[#d6ff00] group-hover:translate-x-1">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-300">
          {feature.description}
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#d6ff00]/10 rounded-full transition-all duration-500 group-hover:scale-[2.5] group-hover:bg-[#d6ff00]/20"></div>
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-[#d6ff00]/5 border-l-[40px] border-l-transparent transition-all duration-500 group-hover:border-t-[#d6ff00]/20"></div>
      
      {/* Corner accent */}
      <div className="absolute bottom-0 left-0 w-0 h-0 opacity-0 group-hover:opacity-100 border-b-[40px] border-b-[#d6ff00]/20 border-r-[40px] border-r-transparent transition-all duration-500"></div>
    </Card>
  )
}