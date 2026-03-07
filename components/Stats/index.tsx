'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  {
    value: 5,  suffix: '+',    label: '年前端经验',
    line: 'from-indigo-400 to-violet-500',
    num:  'from-indigo-300 to-violet-400',
  },
  {
    value: 36, suffix: '+',    label: 'H5 应用上线',
    line: 'from-cyan-400 to-teal-400',
    num:  'from-cyan-300 to-teal-300',
  },
  {
    value: 4,  suffix: ' 端',  label: '多平台兼容',
    line: 'from-purple-400 to-pink-500',
    num:  'from-purple-300 to-pink-400',
  },
  {
    value: 60, suffix: ' fps', label: 'WebView 优化',
    line: 'from-amber-400 to-orange-400',
    num:  'from-amber-300 to-orange-300',
  },
]

function StatCard({ stat, delay, isInView }: { stat: typeof stats[0]; delay: number; isInView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = stat.value
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / 1400, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    const timer = setTimeout(() => requestAnimationFrame(step), delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, stat.value, delay])

  return (
    <motion.div
      className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden cursor-default"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${stat.line}`} />

      <div className={`text-4xl md:text-5xl font-bold tracking-tight leading-none mb-2 bg-linear-to-r ${stat.num} bg-clip-text text-transparent`}>
        {count}{stat.suffix}
      </div>
      <div className="text-slate-400 text-xs md:text-sm font-mono">{stat.label}</div>
    </motion.div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="skills" className="pt-16 pb-20 px-6 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">ABOUT ME</p>
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">By the Numbers</h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 0.1} isInView={isInView} />
        ))}
      </div>
    </section>
  )
}
