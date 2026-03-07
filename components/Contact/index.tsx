'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const links = [
  { label: 'GitHub', href: 'https://github.com/yourusername' },
  { label: 'Twitter', href: 'https://twitter.com/yourusername' },
  { label: 'Email', href: 'mailto:you@example.com' },
]

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="contact" className="relative py-24 px-6 text-center overflow-hidden" ref={ref}>
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        className="relative z-10 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest mb-2">GET IN TOUCH</p>
        <h2 className="text-4xl font-bold text-white mb-4">Let&apos;s Work Together</h2>
        <p className="text-slate-400 mb-10">
          Open to frontend engineering roles, freelance projects, and interesting collaborations.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 glass rounded-lg text-white font-medium hover:border-accent/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-slate-600 text-sm mt-16 font-mono">
          Built with Next.js + Three.js — {new Date().getFullYear()}
        </p>
      </motion.div>
    </section>
  )
}
