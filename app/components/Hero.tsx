'use client'

import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

export function Hero() {
  const { t } = useLanguage()

  return (
    <div className="mt-4 md:mt-[-2rem] grid md:grid-cols-2 gap-8 items-center">
      <div className="text-center md:text-left md:pl-4">
        <h2 className="text-base md:text-lg uppercase font-medium mb-2">{t('hero.subtitle')}</h2>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-1">{t('hero.title1')}</h1>
        <div className="flex items-center justify-center md:justify-start">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif">{t('hero.title2')}</h1>
          <Image
            src="/images/robot.svg"
            alt="Robot Icon"
            width={45}
            height={45}
            className="ml-2 md:ml-3 md:w-[80px] md:h-[80px] dark:invert"
          />
        </div>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <Link
            href="/"
            className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-3 py-2 flex items-center justify-center w-full sm:w-auto border-[1.5px] border-black dark:border-white"
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
            className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-3 py-2 flex items-center justify-center w-full sm:w-auto border-[1.5px] border-black dark:border-white"
          >
            <Image
              src="/images/google-play.svg"
              alt="Google Play Logo"
              width={20}
              height={20}
              className="mr-2 md:w-[24px] md:h-[24px] invert dark:invert-0"
            />
            <div>
              <div className="text-xs">{t('hero.playStore.text1')}</div>
              <div className="font-bold text-sm">{t('hero.playStore.text2')}</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="relative flex justify-center mt-4 md:mt-0">
        <div className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[320px] md:h-[320px] bg-[#d6ff00] rounded-full mt-8 sm:-mt-8 md:mt-8 opacity-90"></div>
        <div className="relative z-10 -mt-2 sm:-mt-4 md:-mt-12">
          <Image
            src="/images/phone-mockup.png"
            alt="Phone Mockup"
            width={500}
            height={1000}
            className="w-[260px] sm:w-[300px] md:w-[500px] h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </div>
  )
} 