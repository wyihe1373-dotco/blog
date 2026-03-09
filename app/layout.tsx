import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import CursorSpotlight from '@/components/CursorSpotlight'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: '王一贺 · 前端开发工程师',
  description: '5年前端经验，擅长 Vue / React / Three.js，专注金融 H5 与数据可视化',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={inter.variable}>
      <body className="antialiased overflow-x-hidden">
        <CursorSpotlight />
        <div className="overflow-x-hidden w-full">
          {children}
        </div>
        <Script
          defer
          src="https://blog-umami-analytics.vercel.app/script.js"
          data-website-id="39e85bcb-69d6-4198-afe7-48d81a96d9aa"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
