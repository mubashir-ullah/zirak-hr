'use client'

import { Navbar } from "../components/Navbar"
import { Features } from "../components/Features"
import { Footer } from "../components/Footer"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        <Features />
      </div>
      <Footer />
    </div>
  )
} 