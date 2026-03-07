'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTilt } from '@/lib/useTilt'

const stats = [
  { value: 5,    suffix: ' 年',   label: '前端开发经验',      color: 'from-indigo-500/20 to-indigo-500/5',  border: 'hover:border-indigo-500/50',  span: 'col-span-2' },
  { value: 3,    suffix: '',      label: '主导项目落地',       color: 'from-cyan-500/20 to-cyan-500/5',      border: 'hover:border-cyan-500/50',    span: 'col-span-1' },
  { value: 10,   suffix: '+',     label: '封装业务组件',       color: 'from-purple-500/20 to-purple-500/5',  border: 'hover:border-purple-500/50',  span: 'col-span-1' },
  { value: 60,   suffix: ' fps',  label: 'WebView 优化目标',  color: 'from-amber-500/20 to-amber-500/5',    border: 'hover:border-amber-500/50',   span: 'col-span-1' },
  { value: 4,    suffix: '',      label: '技术方向覆盖',       color: 'from-emerald-500/20 to-emerald-500/5',border: 'hover:border-emerald-500/50', span: 'col-span-1' },
  { value: 5000, suffix: '+',     label: 'Three.js 粒子数',   color: 'from-rose-500/20 to-rose-500/5',      border: 'hover:border-rose-500/50',    span: 'col-span-2' },
]

function StatCard({ stat, delay, isInView }: { stat: typeof stats[0]; delay: number; isInView: boolean }) {
  const [count, setCount] = useState(0)
  const { ref, onMouseMove, onMouseLeave } = useTilt(6)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = stat.value
    const duration = 1500
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    const timer = setTimeout(() => requestAnimationFrame(step), delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, stat.value, delay])

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`tilt-card glass rounded-2xl p-6 relative overflow-hidden cursor-default transition-all duration-300 ${stat.border} ${stat.span}`}
      style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl`} />

      <div className="relative z-10">
        <div className="text-7xl font-bold text-white tracking-tight leading-none mb-2">
          {count}{stat.suffix}
        </div>
        <div className="text-slate-400 text-sm font-mono">{stat.label}</div>
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" className="py-24 px-6 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">ABOUT ME</p>
        <h2 className="text-5xl font-bold text-white mb-12 tracking-tight">By the Numbers</h2>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 0.08} isInView={isInView} />
        ))}
      </div>
    </section>
  )
}
