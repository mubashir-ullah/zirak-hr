'use client'

import { Navbar } from "./components/Navbar"
import { Hero } from "./components/Hero"
import { Footer } from "./components/Footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        <Hero />
      </div>
      <Footer />
    </div>
  )
}

