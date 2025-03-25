import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaUser, FaBriefcase } from 'react-icons/fa'
import { FiSettings } from 'react-icons/fi'
import { FiLogOut } from 'react-icons/fi'

interface DashboardLayoutProps {
  children: ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Zirak HR</h2>
        </div>
        
        <nav className="mt-6">
          <ul>
            <li className="px-4 py-2">
              <Link 
                href="/dashboard" 
                className={`flex items-center text-gray-700 dark:text-gray-300 hover:text-[#d6ff00] dark:hover:text-[#d6ff00] ${
                  isActive('/dashboard') && !isActive('/dashboard/settings') ? 'text-[#d6ff00] font-medium' : ''
                }`}
              >
                <FaUser className="mr-3" />
                <span>Profile</span>
              </Link>
            </li>
            <li className="px-4 py-2">
              <Link 
                href="/dashboard/jobs" 
                className={`flex items-center text-gray-700 dark:text-gray-300 hover:text-[#d6ff00] dark:hover:text-[#d6ff00] ${
                  isActive('/dashboard/jobs') ? 'text-[#d6ff00] font-medium' : ''
                }`}
              >
                <FaBriefcase className="mr-3" />
                <span>Jobs</span>
              </Link>
            </li>
            <li className="px-4 py-2">
              <Link 
                href="/dashboard/settings" 
                className={`flex items-center text-gray-700 dark:text-gray-300 hover:text-[#d6ff00] dark:hover:text-[#d6ff00] ${
                  isActive('/dashboard/settings') ? 'text-[#d6ff00] font-medium' : ''
                }`}
              >
                <FiSettings className="mr-3" />
                <span>Settings</span>
              </Link>
            </li>
            <li className="px-4 py-2 mt-auto">
              <Link 
                href="/api/auth/logout" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
              >
                <FiLogOut className="mr-3" />
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
