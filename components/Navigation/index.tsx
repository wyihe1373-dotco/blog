'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const links = [
  { label: 'Stats', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      const bar = document.getElementById('progress-bar')
      if (bar) {
        const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
        bar.style.transform = `scaleX(${progress})`
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Scroll progress bar */}
      <div
        id="progress-bar"
        className="fixed top-0 left-0 h-[2px] w-full bg-gradient-to-r from-primary to-accent z-[60] origin-left scale-x-0"
      />

      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/10' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="font-mono text-primary font-bold text-lg tracking-wider">
            &lt;WYH /&gt;
          </a>
          <div className="flex gap-8">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 hover:text-accent transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  )
}
