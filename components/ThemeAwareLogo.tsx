'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ThemeAwareLogoProps {
  width?: number
  height?: number
  className?: string
}

export function ThemeAwareLogo({ width = 240, height = 80, className = '' }: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // After mounting, we can safely show the logo that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ width, height }} />
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark'
  
  // Apply a filter to make the logo yellow (#d6ff00) in dark mode
  const logoStyle = isDark ? {
    filter: 'brightness(0) saturate(100%) invert(83%) sepia(31%) saturate(1066%) hue-rotate(35deg) brightness(107%) contrast(104%)'
  } : {}

  return (
    <div className={className}>
      <Image
        src="/images/zirak-hr-logo.svg"
        alt="Zirak HR Logo"
        width={width}
        height={height}
        style={{...logoStyle, width: `${width}px`, height: `${height}px`}}
      />
    </div>
  )
}
