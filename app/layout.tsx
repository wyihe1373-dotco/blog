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
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "90f1971fc9ae4053b8bf0751f1b4d697"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
