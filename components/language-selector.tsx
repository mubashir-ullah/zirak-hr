"use client"

import { useLanguage } from "@/app/contexts/LanguageContext"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '/images/us-flag.svg'
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '/images/de-flag.svg'
  },
  {
    code: 'ur',
    name: 'اردو',
    flag: '/images/pk-flag.svg'
  }
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-transparent pl-2 pr-5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#d6ff00] cursor-pointer min-w-[100px]"
      >
        <Image
          src={selectedLang.flag}
          alt={`${selectedLang.name} flag`}
          width={16}
          height={12}
          className="object-contain"
        />
        <span>{selectedLang.name}</span>
        <svg className="h-3 w-3 fill-current absolute right-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as 'en' | 'de' | 'ur')
                setIsOpen(false)
              }}
              className="flex items-center space-x-2 w-full px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Image
                src={lang.flag}
                alt={`${lang.name} flag`}
                width={16}
                height={12}
                className="object-contain"
              />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

