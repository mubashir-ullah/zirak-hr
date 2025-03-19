'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { FaUser, FaFileAlt, FaSearch, FaClipboardList, FaTools, FaSignOutAlt, FaMoon, FaSun, FaBell, FaBars, FaTimes, FaCog } from 'react-icons/fa'

interface Skill {
  name: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export default function TalentDashboard() {
  const { theme, setTheme } = useTheme()
  const [isOnline, setIsOnline] = useState(true)
  const [skills, setSkills] = useState<Skill[]>([
    { name: 'JavaScript' },
    { name: 'React' },
    { name: 'Node.js' }
  ])

  const [profileData, setProfileData] = useState({
    fullName: 'Sarah Khan',
    title: 'Junior Web Developer',
    email: 'sarahkhan@email.com',
    country: 'Pakistan',
    city: 'Islamabad',
    germanLevel: 'A1',
    joiningAvailability: 'Immediate',
    visaRequired: 'Yes',
    linkedinProfile: 'linkedin.com/in/sarahkhan',
    githubProfile: 'github.com/sarahkhan'
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle image upload logic here
      console.log('Uploading image:', file)
    }
  }

  const handleAddSkill = () => {
    // Add skill logic
  }

  const handleSaveChanges = () => {
    // Save changes logic
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image 
              src="/images/zirak-hr-logo.svg" 
              alt="Zirak HR" 
              width={100} 
              height={32} 
              className="dark:invert"
            />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Talent Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <FaBell className="w-5 h-5" />
            </button>
            <select className="border rounded-lg px-2 py-1 dark:bg-gray-800 dark:border-gray-700">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="ur">اردو</option>
            </select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 lg:flex-shrink-0">
          <div className="h-full">
            <div className="bg-[#d6ff00] rounded-lg p-4 text-center mb-6 mx-4">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4">
                <Image
                  src="/images/default-avatar.png"
                  alt="Profile"
                  width={128}
                  height={128}
                  className="rounded-full"
                />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-black">{profileData.fullName}</h2>
              <p className="text-sm text-black">{profileData.title}</p>
              <div className="flex items-center justify-center mt-2">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isOnline ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </button>
              </div>
            </div>

            <nav className="space-y-2 px-4">
              <button className="w-full flex items-center space-x-3 px-4 py-2 bg-black text-white rounded-lg">
                <FaUser className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <FaFileAlt className="w-5 h-5" />
                <span>My Resume</span>
                <div className="flex items-center ml-auto">
                  <Image
                    src="/images/robot.svg"
                    alt="AI"
                    width={32}
                    height={32}
                    className="dark:invert"
                  />
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <FaSearch className="w-5 h-5" />
                <span>Jobs</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <FaClipboardList className="w-5 h-5" />
                <span>Applications</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <FaTools className="w-5 h-5" />
                <span>Skill Tests</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <FaCog className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>

            <button
              onClick={() => {/* Handle logout */}}
              className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg mt-8 mx-4"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-[#d6ff00] rounded-lg p-4 lg:p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-black">Your Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Country</label>
                <select
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="Germany">Germany</option>
                  {/* Add more countries */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">City</label>
                <select
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                >
                  <option value="Islamabad">Islamabad</option>
                  <option value="Berlin">Berlin</option>
                  {/* Add more cities */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">German Language Proficiency</label>
                <select
                  value={profileData.germanLevel}
                  onChange={(e) => setProfileData({ ...profileData, germanLevel: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Joining Availability</label>
                <select
                  value={profileData.joiningAvailability}
                  onChange={(e) => setProfileData({ ...profileData, joiningAvailability: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">LinkedIn Profile</label>
                <input
                  type="text"
                  value={profileData.linkedinProfile}
                  onChange={(e) => setProfileData({ ...profileData, linkedinProfile: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">GitHub Profile</label>
                <input
                  type="text"
                  value={profileData.githubProfile}
                  onChange={(e) => setProfileData({ ...profileData, githubProfile: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-black">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill.name}
                    <button
                      onClick={() => {/* Handle skill removal */}}
                      className="ml-2 text-white hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddSkill}
                  className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  + Add Skill
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveChanges}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 