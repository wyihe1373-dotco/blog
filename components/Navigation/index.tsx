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
  const [activeSection, setActiveSection] = useState('')

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

  useEffect(() => {
    const sections = ['skills', 'projects', 'blog', 'contact']
    const observers = sections.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
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
            {links.map(link => {
              const sectionId = link.href.slice(1)
              const isActive = activeSection === sectionId
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-sm transition-colors duration-200 py-1"
                  style={{ color: isActive ? '#fff' : '#94a3b8' }}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              )
            })}
          </div>
        </div>
      </motion.nav>
    </>
  )
}
