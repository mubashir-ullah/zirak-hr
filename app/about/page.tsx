'use client'

import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

export default function About() {
  const { t } = useLanguage()

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
                  {t('about.hero.title')}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  {t('about.hero.subtitle')}
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
                  {t('about.hero.watchStory')}
                </button>
                <button 
                  onClick={() => document.getElementById('whitepaper-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-black to-black hover:to-[#D6FF00] text-white hover:text-black rounded-xl px-6 py-3 font-medium transition-all duration-300 text-base flex items-center justify-center gap-2 border border-[#D6FF00]/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t('about.hero.downloadWhitepaper')}
                </button>
              </div>
            </div>
            <div className="relative flex justify-center mt-8 md:mt-0">
              <div className="relative z-10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#D6FF00] opacity-20"></div>
                <Image
                  src="/images/team/team-highlanders-logo.svg"
                  alt="Team Highlanders"
                  width={400}
                  height={400}
                  className="w-[200px] sm:w-[300px] md:w-[400px] h-auto object-contain drop-shadow-2xl p-2 dark:invert dark:brightness-0 dark:filter"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-[#D6FF00] blur-3xl opacity-10 -z-10 rounded-2xl"></div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.journey.title')}</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.origin.title')}</h3>
              <p>{t('about.journey.origin.text')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.challenges.title')}</h3>
              <p>{t('about.journey.challenges.text')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.growth.title')}</h3>
              <p>{t('about.journey.growth.text')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-medium mb-4">{t('about.journey.vision.title')}</h3>
              <p>{t('about.journey.vision.text')}</p>
            </div>
          </div>
          <div className="mt-12 text-center italic text-xl">
            {t('about.journey.quote')}
          </div>
        </section>

        {/* Video Section */}
        <section id="video-section" className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.video.title')}</h2>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/mE9d-if0Szs" 
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
            <h2 className="text-4xl md:text-5xl font-serif mb-4">The Team Behind Zirak HR</h2>
            <h3 className="text-2xl md:text-3xl font-serif text-gray-600 dark:text-gray-300">Team Highlanders</h3>
          </div>

          {/* Team Logo and Story */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex justify-center mb-12">
              <div className="w-[200px] h-[200px] relative rounded-2xl overflow-hidden bg-gradient-to-br from-black via-black to-[#D6FF00] p-2">
                <Image
                  src="/images/team/team-highlanders-logo.svg"
                  alt="Team Highlanders Logo"
                  fill
                  className="object-contain p-2 dark:invert dark:brightness-0 dark:filter"
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
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
                We're not just teammates—we're friends who love building things. We share a 
                love for solving problems in the most "wait, that actually worked?" way possible 
                and figuring stuff out (even if it means staying up all night with snacks and 
                random jokes flying around). We're all about learning by doing, and we bring our 
                own style to the team—ideas, code, support, and a lot of laughs.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
                We're proud of where we come from and want to show that no matter where you're 
                from if you've got the drive, you can do something great. This is just the 
                beginning — Team Highlanders is here to make it count and ready to raise the bar.
              </p>
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
                bio: t('about.team.bio1'),
                linkedin: "https://www.linkedin.com/in/mansoor-khan-882019245/",
                github: "https://github.com/Mansoorkhan799",
                email: "mansoorkhan3799@gmail.com"
              },
              {
                name: "Mubashir Ullah",
                role: "Team Lead",
                image: "/images/team/mubashir.png",
                bio: t('about.team.bio2'),
                linkedin: "https://www.linkedin.com/in/mubashir-ullah/",
                github: "https://github.com/mubashir-ullah",
                email: "1.mubashirullah@gmail.com"
              },
              {
                name: "Muhammad Hamza Sirang",
                role: "Team Member",
                image: "/images/team/hamza.png",
                bio: t('about.team.bio3'),
                linkedin: "https://www.linkedin.com/in/muhammad-hamza-sirang-179b04268/",
                github: "https://github.com/HamxaSirang",
                email: "hamzasirang.123@gmail.com"
              }
            ].map((member, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-black via-black to-[#D6FF00] p-6 rounded-xl text-center group hover:to-[#D6FF00]/80 transition-all duration-300 shadow-lg border border-[#D6FF00]/20"
              >
                <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden bg-white/10 shadow-lg border-2 border-[#D6FF00]/50">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    priority={true}
                    quality={100}
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center 20%'
                    }}
                  />
                </div>
                <h3 className="text-xl font-medium mb-2 text-[#D6FF00]">{member.name}</h3>
                <p className="text-[#D6FF00]/90 mb-2">{member.role}</p>
                <p className="text-sm mb-4 text-gray-300">
                  <a href={`mailto:${member.email}`} className="hover:text-[#D6FF00] transition-colors">
                    {member.email}
                  </a>
                </p>
                <div className="flex justify-center gap-4">
                  <Link 
                    href={member.linkedin}
                    target="_blank"
                    className="text-gray-300 hover:text-[#0077b5] transition-colors"
                  >
                    <Image
                      src="/images/linkedin.svg"
                      alt="LinkedIn"
                      width={24}
                      height={24}
                      className="opacity-75 hover:opacity-100 transition-opacity"
                      style={{ filter: "invert(29%) sepia(100%) saturate(1622%) hue-rotate(173deg) brightness(95%) contrast(96%)" }}
                    />
                  </Link>
                  <Link 
                    href={member.github}
                    target="_blank"
                    className="text-gray-300 hover:text-[#D6FF00] transition-colors"
                  >
                    <Image
                      src="/images/github.svg"
                      alt="GitHub"
                      width={24}
                      height={24}
                      className="opacity-75 hover:opacity-100 transition-opacity invert"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Whitepaper Section */}
        <section id="whitepaper-section" className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.whitepaper.title')}</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="mb-8">
              {t('about.whitepaper.description')}
            </p>
            <Link 
              href="/documents/zirak-hr_technical-whitepaper.pdf" 
              target="_blank"
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {t('about.whitepaper.download')}
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              PDF format • 775 KB
            </p>
          </div>
        </section>

        {/* Competition Highlights */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">{t('about.competition.title')}</h2>
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
              {t('about.contact.text')}
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
              {t('about.contact.button')}
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}