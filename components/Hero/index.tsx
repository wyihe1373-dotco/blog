'use client'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Typewriter from './Typewriter'

const Particles = dynamic(() => import('@/components/Particles'), { ssr: false })

export default function Hero() {
  return (
    <section className="relative h-75 sm:h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[160px] h-[160px] md:w-[400px] md:h-[400px] bg-accent/15 rounded-full blur-[60px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[140px] h-[140px] md:w-[350px] md:h-[350px] bg-purple-500/10 rounded-full blur-[50px] md:blur-[90px] animate-pulse" style={{ animationDelay: '3s', animationDuration: '5s' }} />
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
{/* Gradient overlay */}
<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#050510] pointer-events-none" />
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

       
      </div>

    </section>
  )
}
