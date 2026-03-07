'use client'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Typewriter from './Typewriter'

const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), { ssr: false })

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden hero-bg">
      <ParticleCanvas />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]" />

      <div className="relative z-10 text-center px-6">
        <motion.p
          className="text-accent font-mono text-sm tracking-widest mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Hi, 我是
        </motion.p>

        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          王一贺
        </motion.h1>

        <motion.div
          className="text-xl md:text-2xl text-slate-300 mb-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Typewriter />
        </motion.div>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="#projects"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-80 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            查看项目
          </a>
          <a
            href="#blog"
            className="px-6 py-3 glass text-white rounded-lg font-medium hover:border-accent/50 transition-all"
          >
            技术博客
          </a>
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
