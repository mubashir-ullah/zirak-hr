import { FaGoogle, FaGithub, FaLinkedin, FaApple } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export type Provider = 'google' | 'github' | 'linkedin' | 'apple'

export interface SocialLoginButtonsProps {
  onProviderClick: (provider: Provider) => Promise<void>
}

const providers = [
  {
    id: 'google' as Provider,
    name: 'Google',
    icon: FaGoogle,
    className: 'hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800'
  },
  {
    id: 'github' as Provider,
    name: 'GitHub',
    icon: FaGithub,
    className: 'hover:bg-gray-50 dark:hover:bg-gray-800/30 border-gray-200 dark:border-gray-700'
  },
  {
    id: 'linkedin' as Provider,
    name: 'LinkedIn',
    icon: FaLinkedin,
    className: 'hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-800'
  },
  {
    id: 'apple' as Provider,
    name: 'Apple',
    icon: FaApple,
    className: 'hover:bg-gray-50 dark:hover:bg-gray-800/30 border-gray-200 dark:border-gray-700'
  }
]

export const SocialLoginButtons: FC<SocialLoginButtonsProps> = ({ onProviderClick }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map(({ id, name, icon: Icon, className }) => (
        <button
          key={id}
          onClick={() => onProviderClick(id)}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium",
            "text-gray-700 dark:text-gray-300",
            "bg-white dark:bg-black",
            "border-2 rounded-lg",
            "transition-all duration-200",
            "hover:shadow-md",
            className
          )}
        >
          <Icon className="w-5 h-5" />
          <span>{name}</span>
        </button>
      ))}
    </div>
  )
}
