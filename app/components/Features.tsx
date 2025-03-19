'use client'

import { useLanguage } from "../contexts/LanguageContext"
import { Card } from "@/components/ui/card"
import { 
  Brain, 
  UserCircle, 
  Briefcase, 
  Users, 
  Award, 
  ClipboardList, 
  MousePointerClick,
  Leaf,
  UserRound
} from "lucide-react"

export function Features() {
  const { t } = useLanguage()

  const features = [
    {
      icon: <Brain className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Quick Profile Creation'),
      description: t('Let candidates create their profiles in minutes, making it easy to find the right talent.'),
    },
    {
      icon: <Briefcase className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Job Matching'),
      description: t('AI powered matching to find oppurtunities for candidates.'),
    },
    {
      icon: <MousePointerClick className="w-12 h-12 text-[#d6ff00]" />,
      title: t('On-Click Job Apply'),
      description: t('Candidates can apply to jobs with a single click, making it easy to find the right talent.'),
    },
    {
      icon: <UserCircle className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Talent Matching'),
      description: t('AI powered to find the best skillfull candidates for your job openings.'),
    },
    {
      icon: <Users className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Talent Pool'),
      description: t('A talent pool to find the best candidates with advanced search filters.'),
    },
    {
      icon: <Award className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Skill Assessment'),
      description: t('AI powered skills assessment to assess the skills of candidates.'),
    },
    {
      icon: <ClipboardList className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Application Tracking'),
      description: t('Real time application tracking to see the status of the job applications.'),
    },
    {
      icon: <UserRound className="w-12 h-12 text-[#d6ff00]" />,
      title: t('User Friendly Interface'),
      description: t('A user friendly interface to make it easy to find the right talent.'),
    },
    {
      icon: <Leaf className="w-12 h-12 text-[#d6ff00]" />,
      title: t('Green Coding and Sustainable App'),
      description: t('A green coding and sustainable app which cares for the environment.'),
    },
  ]

  return (
    <div className="py-8 md:py-2">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          {t('App Features')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('From smart resume parsing to intelligent candidate matching – Zirak HR transforms the way you recruit.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 border-2 hover:border-[#d6ff00] dark:hover:border-[#d6ff00]">
            <div className="mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
} 