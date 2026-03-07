import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Your Name — Frontend Engineer',
  description: 'Personal tech blog and portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
