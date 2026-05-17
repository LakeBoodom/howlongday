import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://howlongday.com'),
  title: {
    default: 'HowLongDay — Sunrise, sunset & daylight in 49,000+ cities',
    template: '%s | HowLongDay',
  },
  description:
    'Sunrise, sunset, golden hour, blue hour and daylight duration for cities worldwide. Make the most of daylight.',
  applicationName: 'HowLongDay',
  openGraph: {
    title: 'HowLongDay',
    description: 'Make the most of daylight — sunrise, sunset & golden hour for any city.',
    url: 'https://howlongday.com',
    siteName: 'HowLongDay',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body className="font-sans bg-bg-deepest text-neutral-1 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
