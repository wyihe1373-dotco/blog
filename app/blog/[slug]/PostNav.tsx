'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PostNav({ title }: { title: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color] duration-300 ${
        scrolled ? 'bg-background/95' : ''
      }`}
      style={{ boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.07)' : 'none' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link
          href="/#blog"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 transition-colors shrink-0"
          aria-label="返回"
        >
          {/* antd-mobile LeftOutline style */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-300"
            />
          </svg>
        </Link>

        <span
          className={`text-sm font-medium text-white truncate transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {title}
        </span>
      </div>
    </nav>
  )
}
