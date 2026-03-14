'use client'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Typewriter from './Typewriter'

const Particles = dynamic(() => import('@/components/Particles'), { ssr: false })
const CodeBackground = dynamic(() => import('./CodeBackground'), { ssr: false })

export default function Hero() {
  return (
    <section className="relative min-h-130 sm:h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Code background */}
      <CodeBackground />

      {/* Aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-50 h-50 md:w-125 md:h-125 bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 md:w-100 md:h-100 bg-accent/15 rounded-full blur-[60px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-35 h-35 md:w-87.5 md:h-87.5 bg-purple-500/10 rounded-full blur-[50px] md:blur-[90px] animate-pulse" style={{ animationDelay: '3s', animationDuration: '5s' }} />
      </div>

      {/* Particles */}
      <Particles
        particleCount={120}
        particleSpread={10}
        speed={0.06}
        particleColors={['#6366f1', '#a78bfa', '#22d3ee', '#818cf8']}
        moveParticlesOnHover
        particleHoverFactor={0.3}
        alphaParticles
        particleBaseSize={80}
        sizeRandomness={1.2}
        cameraDistance={22}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex items-center justify-center py-10 sm:py-0">

        <div className="flex-1 text-center">
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
        </div>

      </div>
    </section>
  )
}
