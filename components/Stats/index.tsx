'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="skills" className="pt-7.5 pb-10 md:pt-7.5 md:pb-16 px-6 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">ABOUT ME</p>
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">个人简介</h2>
      </motion.div>

      <motion.p
        className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        前端工程师，热爱技术也享受生活。平时喜欢关注前端领域的新动态与 AI 工程化进展，
        写博客是我沉淀和整理技术思路的方式——把遇到的问题、踩过的坑、摸索出的方案都记录下来，
        方便日后回顾，快速定位及解决问题。
      </motion.p>
    </section>
  )
}
