'use client'

import { Navbar } from "./components/Navbar"
import { Hero } from "./components/Hero"
import { Footer } from "./components/Footer"
import { OrganizationJsonLd, WebsiteJsonLd } from "./components/JsonLd"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={true} />
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Hero />
      </div>
      <Footer />
      
      {/* Structured Data */}
      <OrganizationJsonLd
        name="Zirak HR"
        url="https://zirak-hr.vercel.app"
        logo="https://zirak-hr.vercel.app/images/logo.png"
        sameAs={[
          "https://twitter.com/zirakhr",
          "https://www.linkedin.com/company/zirakhr",
          "https://github.com/zirakhr"
        ]}
      />
      <WebsiteJsonLd
        name="Zirak HR | AI-Powered HR Innovation App"
        url="https://zirak-hr.vercel.app"
        description="Zirak HR bridges tech talent gaps between Pakistan and Germany with AI-powered matching, skill assessment, and bias-free recruitment solutions."
        searchUrl="https://zirak-hr.vercel.app/search?q={search_term}"
      />
    </div>
  )
}
