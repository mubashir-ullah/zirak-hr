'use client'

import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import Image from "next/image"
import Link from "next/link"
import { OrganizationJsonLd, PersonJsonLd, FAQJsonLd } from "../components/JsonLd"

// Note: Metadata must be in a separate file for client components
// The metadata is defined in about/metadata.ts

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        {/* Hero Section */}
        <section className="mt-4 md:mt-12 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent">
                  Zirak HR
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Transforming the hiring landscape with AI-powered matching and seamless connections between talent and opportunities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                <button 
                  onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-black to-black hover:to-[#D6FF00] text-white hover:text-black rounded-xl px-6 py-3 font-medium transition-all duration-300 text-base flex items-center justify-center gap-2 border border-[#D6FF00]/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Our Story
                </button>
                <button 
                  onClick={() => document.getElementById('whitepaper-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-black to-black hover:to-[#D6FF00] text-white hover:text-black rounded-xl px-6 py-3 font-medium transition-all duration-300 text-base flex items-center justify-center gap-2 border border-[#D6FF00]/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Whitepaper
                </button>
              </div>
            </div>
            <div className="relative flex justify-center mt-8 md:mt-0">
              <div className="relative z-10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#D6FF00] opacity-20"></div>
                <Image
                  src="/favicon/android-chrome-512x512.png"
                  alt="Zirak HR Logo"
                  width={400}
                  height={400}
                  className="w-[200px] sm:w-[300px] md:w-[400px] h-auto object-contain drop-shadow-2xl p-2"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-[#D6FF00] blur-3xl opacity-10 -z-10 rounded-2xl"></div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent mx-auto w-full">Our Journey</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4 bg-gradient-to-r from-black to-[#4a9c2d] dark:from-white dark:to-[#9cff57] bg-clip-text text-transparent">The Origin</h3>
              <p>Zirak HR was born from a simple observation: the traditional hiring process was broken. Talented individuals struggled to find the right opportunities, while companies faced challenges in identifying the perfect candidates. Our founders, with backgrounds in AI and HR, set out to bridge this gap.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4 bg-gradient-to-r from-black to-[#4a9c2d] dark:from-white dark:to-[#9cff57] bg-clip-text text-transparent">The Challenges</h3>
              <p>Building an AI-powered matching system that truly understands human potential was no small feat. We spent years refining our algorithms, gathering feedback, and iterating on our platform to ensure it delivered exceptional results for both talent and hiring managers.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4 bg-gradient-to-r from-black to-[#4a9c2d] dark:from-white dark:to-[#9cff57] bg-clip-text text-transparent">The Growth</h3>
              <p>As we continued to grow and learn, we expanded our team and refined our approach. We developed a deeper understanding of the hiring landscape and the needs of our users, allowing us to create a more effective and efficient platform.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4 bg-gradient-to-r from-black to-[#4a9c2d] dark:from-white dark:to-[#9cff57] bg-clip-text text-transparent">The Vision</h3>
              <p>Our vision is to revolutionize the hiring process, making it more efficient, effective, and enjoyable for all parties involved. We believe that by harnessing the power of AI and machine learning, we can create a better future for talent and hiring managers alike.</p>
            </div>
          </div>
          <div className="mt-12 text-center italic text-xl">
            "The future belongs to those who believe in the beauty of their dreams."
          </div>
        </section>

        {/* Video Section */}
        <section id="video-section" className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent mx-auto w-full">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/JYhSpX5e2Sc" 
                title="Zirak HR: Our Story"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Watch our journey from concept to creation and learn about the technology behind Zirak HR.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-serif mb-4 bg-gradient-to-r from-black via-[#4a9c2d] to-[#D6FF00] dark:from-white dark:via-[#9cff57] dark:to-[#D6FF00] bg-clip-text text-transparent mx-auto w-full">The Team Behind Zirak HR</h2>
            <br />
            <h3 className="text-2xl md:text-3xl font-serif text-gray-600 dark:text-gray-300 bg-gradient-to-r from-[#4a9c2d] to-[#D6FF00] dark:from-[#9cff57] dark:to-[#D6FF00] bg-clip-text text-transparent inline-block">Team Highlanders</h3>
          </div>

          {/* Team Logo and Story */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex justify-center mb-12">
              <div className="w-[200px] h-[200px] relative rounded-2xl overflow-hidden bg-gradient-to-br from-black via-black to-[#D6FF00] p-2">
                <Image
                  src="/images/team/team-highlanders-logo.svg"
                  alt="Team Highlanders Logo"
                  fill
                  className="object-contain brightness-0 invert filter"
                  priority
                  quality={100}
                />
              </div>
            </div>
            <div className="prose prose-lg dark:prose-invert mx-auto space-y-6">
              <p className="text-xl leading-relaxed text-center">
                We're Team Highlanders, straight outta the highlands, where the air is fresh, 
                the ideas are wild, and the hustle is next level—two of us from Chitral and 
                one from Gilgit. Together, we've poured our mountain energy into this 
                competition — because when you're from the top, you aim even higher.
              </p>
              <br />
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
                We're not just teammates—we're friends who love building things. We share a 
                love for solving problems in the most "wait, that actually worked?" way possible 
                and figuring stuff out (even if it means staying up all night with snacks and 
                random jokes flying around). We're all about learning by doing, and we bring our 
                own style to the team—ideas, code, support, and a lot of laughs.
              </p>
              <br />
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
                We're proud of where we come from and want to show that no matter where you're 
                from if you've got the drive, you can do something great. This is just the 
                beginning — Team Highlanders is here to make it count and ready to raise the bar.
              </p>
              <br />
              <p className="text-xl font-semibold text-center italic mt-8">
                Team Highlanders<br/>
                <span className="text-lg font-normal">Raise the bar, always high.</span>
              </p>
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mansoor Khan",
                role: "Team Member",
                image: "/images/team/mansoor.png",
                linkedin: "https://www.linkedin.com/in/mansoor-khan-882019245/",
                github: "https://github.com/Mansoorkhan799",
                email: "mansoorkhan3799@gmail.com"
              },
              {
                name: "Mubashir Ullah",
                role: "Team Lead",
                image: "/images/team/mubashir.png",
                linkedin: "https://www.linkedin.com/in/mubashir-ullah/",
                github: "https://github.com/mubashir-ullah",
                email: "1.mubashirullah@gmail.com"
              },
              {
                name: "Muhammad Hamza Sirang",
                role: "Team Member",
                image: "/images/team/hamza.png",
                linkedin: "https://www.linkedin.com/in/muhammad-hamza-sirang-179b04268/",
                github: "https://github.com/HamxaSirang",
                email: "hamzasirang.123@gmail.com"
              }
            ].map((member, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-black via-black to-[#D6FF00] p-6 rounded-xl text-center group hover:to-[#D6FF00]/80 transition-all duration-300 shadow-lg border border-[#D6FF00]/20 flex flex-col items-center"
              >
                <div className="relative w-48 h-48 md:w-56 md:h-56 bg-white rounded-full overflow-hidden border-4 border-[#D6FF00] shadow-xl mb-6 transform transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-[#D6FF00] mb-6 text-lg">{member.role}</p>
                <div className="flex justify-center space-x-6">
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#D6FF00] transition-colors transform hover:scale-110 transition-transform duration-300"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a 
                    href={member.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#D6FF00] transition-colors transform hover:scale-110 transition-transform duration-300"
                    aria-label={`${member.name}'s GitHub`}
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a 
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${member.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#D6FF00] transition-colors transform hover:scale-110 transition-transform duration-300"
                    aria-label={`Email ${member.name} via Gmail`}
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Whitepaper Section */}
        <section id="whitepaper-section" className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent mx-auto w-full">Whitepaper</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="mb-8">
              Our whitepaper provides an in-depth look at the technology and methodology behind Zirak HR. Learn more about our AI-powered matching system and how it can benefit your business.
            </p>
            <Link 
              href="/documents/zirak-hr_technical-whitepaper.pdf" 
              target="_blank"
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Whitepaper
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              PDF format • 829 KB
            </p>
          </div>
        </section>

        {/* Competition Highlights */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center bg-gradient-to-r from-black via-black to-[#D6FF00] dark:from-white dark:via-white dark:to-[#D6FF00] bg-clip-text text-transparent mx-auto w-full">Competition Highlights</h2>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Zirak HR emerged from CodeFlow 2025, an innovative hackathon organized by Ahdus Technologies 
                and MLSA SZABIST Islamabad Chapter. Our team took on the challenge to revolutionize 
                the HR industry through cutting-edge technology and innovative solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-black via-black to-[#D6FF00]/20 p-8 rounded-xl border border-[#D6FF00]/20">
                <h3 className="text-xl font-medium mb-4 text-[#D6FF00]">Event Details</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-[#D6FF00] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>CodeFlow 2025 Hackathon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-[#D6FF00] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Organized by Ahdus Technologies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-[#D6FF00] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>In collaboration with MLSA SZABIST Islamabad</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-black via-black to-[#D6FF00]/20 p-8 rounded-xl border border-[#D6FF00]/20">
                <h3 className="text-xl font-medium mb-4 text-[#D6FF00]">Our Solution</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-[#D6FF00] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>AI-powered resume screening and candidate matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-[#D6FF00] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automated skill assessment and evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-6 h-6 text-[#D6FF00] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Bias-free hiring process implementation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black via-black to-[#D6FF00]/10 p-8 rounded-xl border border-[#D6FF00]/20">
              <h3 className="text-xl font-medium mb-8 text-center text-[#D6FF00]">Event Organizers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48 bg-white rounded-xl p-4">
                    <Image
                      src="/images/organizers/mlsa.png"
                      alt="MLSA SZABIST Islamabad"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-base text-gray-300 mt-4 font-medium">MLSA SZABIST Islamabad</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48 bg-white rounded-xl p-4">
                    <Image
                      src="/images/organizers/ahdus.png"
                      alt="Ahdus Technologies"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-base text-gray-300 mt-4 font-medium">Ahdus Technologies</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xl mb-8">
              Have any questions or want to learn more about Zirak HR? We'd love to hear from you!
            </p>
            <Link 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=1.mubashirullah@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Get in Touch
            </Link>
          </div>
        </section>
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
      
      {/* Team Members Structured Data */}
      <PersonJsonLd
        name="Mansoor Khan"
        jobTitle="Team Member"
        image="https://zirak-hr.vercel.app/images/team/mansoor.png"
        sameAs={[
          "https://www.linkedin.com/in/mansoor-khan-882019245/",
          "https://github.com/Mansoorkhan799"
        ]}
      />
      
      <PersonJsonLd
        name="Mubashir Ullah"
        jobTitle="Team Lead"
        image="https://zirak-hr.vercel.app/images/team/mubashir.png"
        sameAs={[
          "https://www.linkedin.com/in/mubashir-ullah/",
          "https://github.com/mubashir-ullah"
        ]}
      />
      
      <PersonJsonLd
        name="Muhammad Hamza Sirang"
        jobTitle="Team Member"
        image="https://zirak-hr.vercel.app/images/team/hamza.png"
        sameAs={[
          "https://www.linkedin.com/in/muhammad-hamza-sirang-179b04268/",
          "https://github.com/HamxaSirang"
        ]}
      />
      
      {/* FAQ Structured Data */}
      <FAQJsonLd
        questions={[
          {
            question: "What is Zirak HR?",
            answer: "Zirak HR is an AI-powered HR innovation app that bridges tech talent gaps between Pakistan and Germany, offering AI-powered matching, skill assessment, and bias-free recruitment solutions."
          },
          {
            question: "How does Zirak HR match talent with employers?",
            answer: "Zirak HR uses advanced AI algorithms to analyze candidate skills, experience, and preferences to match them with suitable job opportunities from German employers looking for Pakistani tech talent."
          },
          {
            question: "Who created Zirak HR?",
            answer: "Zirak HR was created by Team Highlanders, a team of three developers from the highlands of Pakistan - two from Chitral and one from Gilgit."
          },
          {
            question: "What makes Zirak HR different from other HR platforms?",
            answer: "Zirak HR stands out with its focus on connecting Pakistani tech talent with German companies, AI-powered matching algorithms, bias-free recruitment processes, and eco-friendly practices through green coding."
          }
        ]}
      />
    </div>
  )
}