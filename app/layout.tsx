import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zirak HR',
  description: 'Your HR Management Platform',
  icons: {
    icon: [
      { url: '/favicon/favicon-light-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon/favicon-light-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon/favicon-light-48.png', sizes: '48x48', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon/favicon-dark-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon/favicon-dark-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon/favicon-dark-48.png', sizes: '48x48', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/favicon/favicon-light-48.png', sizes: '48x48', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon/favicon-dark-48.png', sizes: '48x48', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-favicon" strategy="afterInteractive">
          {`
            function updateFavicon() {
              const isDark = document.documentElement.classList.contains('dark');
              const icons = document.querySelectorAll("link[rel='icon']");
              icons.forEach(icon => {
                const href = icon.getAttribute('href');
                if (href) {
                  icon.setAttribute('href', href.replace(
                    isDark ? 'favicon-light' : 'favicon-dark',
                    isDark ? 'favicon-dark' : 'favicon-light'
                  ));
                }
              });
            }

            // Update favicon on theme change
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                  updateFavicon();
                }
              });
            });

            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['class']
            });

            // Initial favicon setup
            updateFavicon();
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'