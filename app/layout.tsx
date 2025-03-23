import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

// Define default metadata that will be used as fallback
// Page-specific metadata will override these values when defined
export const metadata: Metadata = {
  title: {
    template: '%s | Zirak HR',
    default: 'Zirak HR | AI-Powered HR Innovation App',
  },
  description: "Zirak HR bridges tech talent gaps between Pakistan and Germany with AI-powered matching, skill assessment, and bias-free recruitment solutions.",
  keywords: "HR technology, AI recruitment, talent matching, Pakistan tech talent, German employers, job matching, skill assessment",
  authors: [{ name: "Team Highlanders" }],
  creator: "Team Highlanders",
  publisher: "Zirak HR",
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.png', type: 'image/png' }
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/favicon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zirak-hr.vercel.app/",
    title: {
      template: '%s | Zirak HR',
      default: 'Zirak HR | AI-Powered HR Innovation App',
    },
    description: "Connecting Pakistani tech talent with German innovation-driven companies through AI-powered matching and bias-free recruitment.",
    siteName: "Zirak HR",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zirak HR - Bridging Tech Talent Gaps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: '%s | Zirak HR',
      default: 'Zirak HR | AI-Powered HR Innovation App',
    },
    description: "Connecting Pakistani tech talent with German innovation-driven companies through AI-powered matching and bias-free recruitment.",
    images: ["/images/og-image.jpg"],
    creator: "@zirakhr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://zirak-hr.vercel.app/",
    languages: {
      'en-US': "https://zirak-hr.vercel.app/",
      'de-DE': "https://zirak-hr.vercel.app/de",
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  metadataBase: new URL("https://zirak-hr.vercel.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "l5rlxvpg2n");
            `,
          }}
        />
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KQVBVZ5Z');
            `,
          }}
        />
        <Script
          id="ga-script"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-FVKBDWLQ2S"
        />
        <Script
          id="ga-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FVKBDWLQ2S');
            `,
          }}
        />
        <Script
          id="hotjar-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:3809272,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}