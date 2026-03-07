'use client'
import { motion } from 'framer-motion'
import Typewriter from './Typewriter'

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[160px] h-[160px] md:w-[400px] md:h-[400px] bg-accent/15 rounded-full blur-[60px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[140px] h-[140px] md:w-[350px] md:h-[350px] bg-purple-500/10 rounded-full blur-[50px] md:blur-[90px] animate-pulse" style={{ animationDelay: '3s', animationDuration: '5s' }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]" />

      <div className="relative z-10 text-center px-6">
        <motion.p
          className="shimmer-text font-mono text-sm tracking-widest mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Hi, 我是
        </motion.p>

        <motion.h1
          className="text-4xl md:text-7xl font-bold text-white mb-4 flex justify-center gap-[0.05em]"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
            hidden: {},
          }}
        >
          {'王一贺'.split('').map((char, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 40, rotateX: -90 },
                visible: { opacity: 1, y: 0, rotateX: 0 },
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
            >
              {char}
            </motion.span>
          ))}
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
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="#projects"
            className="w-36 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-80 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.5)] text-center"
          >
            查看项目
          </a>
          <a
            href="#blog"
            className="w-36 py-3 glass text-white rounded-lg font-medium hover:border-accent/50 transition-all text-center"
          >
            工作亮点
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
