import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Press_Start_2P } from 'next/font/google'
import './globals.css'

const body = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const display = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Replay',
  description:
    'REPLAY is a real arcade built for the generation that invented arcade culture. Real joysticks, real leaderboards, calibrated sound, step-free floor. First game is free.',
  generator: 'v0.app',
  openGraph: {
    title: 'REPLAY',
    description:
      'The original arcade generation, back on the board. Real cabinets, real high scores, in Bay Ridge, Brooklyn.',
    type: 'website',
  },
  icons: {
    // Primary tab icon (favicon)
    icon: '/logoig-removebg-preview.png',
    // Apple touch icon fallback
    apple: '/logoig-removebg-preview.png',
  },
};
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#12172B',
  userScalable: true,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${body.variable} ${display.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
