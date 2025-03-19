'use client'

import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

export default function About() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        
        {/* Hero Section */}
        <section className="mt-8 md:mt-16 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-tight">
                  {t('about.hero.title')}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0">
                  {t('about.hero.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <button 
                  onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-8 py-4 font-medium hover:opacity-90 transition-opacity text-lg flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  {t('about.hero.watchStory')}
                </button>
                <button 
                  onClick={() => document.getElementById('whitepaper-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-8 py-4 font-medium hover:opacity-90 transition-opacity text-lg flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t('about.hero.downloadWhitepaper')}
                </button>
              </div>
            </div>
            <div className="relative flex justify-center mt-8 md:mt-0">
              <div className="relative z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#d6ff00]/20 to-transparent rounded-3xl"></div>
                <Image
                  src="/images/team-illustration.svg"
                  alt="Team Illustration"
                  width={500}
                  height={500}
                  className="w-[300px] sm:w-[400px] md:w-[500px] h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.journey.title')}</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.origin.title')}</h3>
              <p>{t('about.journey.origin.text')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.challenges.title')}</h3>
              <p>{t('about.journey.challenges.text')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.growth.title')}</h3>
              <p>{t('about.journey.growth.text')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.vision.title')}</h3>
              <p>{t('about.journey.vision.text')}</p>
            </div>
          </div>
          <div className="mt-12 text-center italic text-xl">
            {t('about.journey.quote')}
          </div>
        </section>

        {/* Video Section */}
        <section id="video-section" className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.video.title')}</h2>
          <div className="max-w-4xl mx-auto aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
            {/* Replace with actual video embed */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Video embed placeholder</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">{t('about.team.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((member) => (
              <div key={member} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <h3 className="text-xl font-medium mb-2">Team Member {member}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('about.team.role')}</p>
                <p className="text-sm mb-4">Brief bio about the team member and their contributions to the project.</p>
                <div className="flex justify-center gap-4">
                  <Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    {t('about.team.linkedin')}
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    {t('about.team.github')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Whitepaper Section */}
        <section id="whitepaper-section" className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.whitepaper.title')}</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="mb-8">
              {t('about.whitepaper.description')}
            </p>
            <button className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity">
              {t('about.whitepaper.download')}
            </button>
          </div>
        </section>

        {/* Competition Highlights */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.competition.title')}</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-8">
              {t('about.competition.description')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Replace with actual competition logos */}
              {[1, 2, 3, 4].map((logo) => (
                <div key={logo} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xl mb-8">
              {t('about.contact.text')}
            </p>
            <button className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity">
              {t('about.contact.button')}
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
} 