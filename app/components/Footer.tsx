'use client'

import { useLanguage } from "../contexts/LanguageContext"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-4 md:py-5 border-t border-gray-200 dark:border-gray-800 mt-8 md:mt-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <p className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            {t('footer.text')}
          </p>
        </div>
      </div>
    </footer>
  )
} 