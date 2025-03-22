'use client'

import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

export function Hero() {
  const { t } = useLanguage()

  return (
    <div className="mt-4 md:mt-[-2rem] grid md:grid-cols-2 gap-8 items-start">
      <div className="text-center md:text-left md:pl-4">
        <p className="text-base md:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2 mt-4">Zirak HR: AI-Powered HR Innovation App</p>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif inline-block pb-2">
            <span className="bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent">Bridging Tech</span>
          </h1>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif inline-block pb-2">
            <span className="bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent">Talent Gaps</span>
          </h1>
          <Image
            src="/images/robot.svg"
            alt="Robot Icon"
            width={45}
            height={45}
            className="ml-2 md:ml-3 md:w-[80px] md:h-[80px] dark:invert"
          />
        </div>
        
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
          We're building the bridge between Pakistan's rising tech stars and Germany's innovation-driven companies.
        </p>
        
        <div className="mt-3 flex flex-col md:flex-row text-sm text-gray-600 dark:text-gray-400 gap-2 md:gap-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">AI-powered matching</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">On-Click Job Apply</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Skill Assessment</span>
          </div>
        </div>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <div className="inline-block bg-gradient-to-r from-green-600 to-[#D6FF00] px-4 py-1 rounded-full">
            <h2 className="text-sm md:text-base font-medium text-white">Pakistan ↔ Germany</h2>
          </div>
        </div>
        
        {/* Registration CTA Button */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/register?role=talent"
            className="bg-[#D6FF00] hover:bg-[#c2eb00] text-black font-bold text-lg rounded-xl px-6 py-3 inline-block transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-[#D6FF00] hover:border-black group"
          >
            For Pakistani IT Talent
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          
          <Link
            href="/register?role=hiring_manager"
            className="bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-xl px-6 py-3 inline-block transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-black group"
          >
            For German Employers
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
          </svg>
          Connecting talent with opportunities across borders
        </p>

      </div>

      <div className="relative flex flex-col items-center mt-4 md:mt-0 pt-0">
        <div className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[320px] md:h-[320px] bg-[#d6ff00] rounded-full mt-20 sm:mt-10 md:mt-24 opacity-90"></div>
        <div className="relative z-10 mt-4 sm:mt-6 md:mt-4">
          <Image
            src="/images/phone-mockup.png"
            alt="Phone Mockup"
            width={500}
            height={1000}
            className="w-[260px] sm:w-[300px] md:w-[500px] h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>
        
        {/* App Store Buttons moved below the phone image */}
        <div className="flex gap-3 mt-4 md:mt-6 justify-center z-10">
          <Link
            href="/"
            className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-3 py-2 flex items-center justify-center w-auto border-[1.5px] border-black dark:border-white"
          >
            <Image
              src="/images/apple-logo.svg"
              alt="Apple Logo"
              width={20}
              height={20}
              className="mr-2 md:w-[24px] md:h-[24px] invert dark:invert-0"
            />
            <div>
              <div className="text-xs">{t('hero.appStore.text1')}</div>
              <div className="font-bold text-sm">{t('hero.appStore.text2')}</div>
            </div>
          </Link>

          <Link
            href="/"
            className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-3 py-2 flex items-center justify-center w-auto border-[1.5px] border-black dark:border-white"
          >
            <Image
              src="/images/google-play.svg"
              alt="Google Play Logo"
              width={20}
              height={20}
              className="mr-2 md:w-[24px] md:h-[24px] invert dark:invert-0"
            />
            <div>
              <div className="text-xs">Download on</div>
              <div className="font-bold text-sm">Google Play</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}