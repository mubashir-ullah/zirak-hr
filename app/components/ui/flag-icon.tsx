'use client'

import Image from 'next/image'

const flagMap = {
  en: {
    src: '/images/flags/gb.svg',
    alt: 'English',
  },
  de: {
    src: '/images/flags/de.svg',
    alt: 'German',
  },
  ur: {
    src: '/images/flags/pk.svg',
    alt: 'Urdu',
  },
}

interface FlagIconProps {
  code: keyof typeof flagMap
  size?: number
}

export function FlagIcon({ code, size = 20 }: FlagIconProps) {
  const flag = flagMap[code]
  
  return (
    <Image
      src={flag.src}
      alt={flag.alt}
      width={size}
      height={size}
      className="rounded-sm object-cover"
    />
  )
}
