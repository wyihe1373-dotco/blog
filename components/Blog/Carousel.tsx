'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'

const MotionLink = motion(Link)

const CATEGORIES = [
  { label: '全部', tags: [] },
  { label: 'JS 基础', tags: ['JavaScript', 'ES6', '基础', '数组', '工具库'] },
  { label: '学习笔记', tags: ['React', 'Vue3', 'Vue2', 'Next.js', '学习笔记', 'Composition API'] },
  { label: '组件封装', tags: ['组件封装', '全局调用', '设计思路'] },
  { label: '工程化', tags: ['工程化', 'TypeScript', 'Vite', 'Monorepo', 'AI', '代码生成', 'CI/CD'] },
  { label: '业务实践', tags: ['前端工程', '性能优化', '安全', '微信支付', 'H5', 'Canvas'] },
  { label: '经典问题', tags: ['经典问题', '浏览器', '闭包', '内存'] },
]

export default function BlogCarousel({ posts }: { posts: PostMeta[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })
  const [active, setActive] = useState('全部')

  useEffect(() => {
    const saved = sessionStorage.getItem('blog-tab')
    if (saved) setActive(saved)
  }, [])

  const handleTabChange = (label: string) => {
    setActive(label)
    sessionStorage.setItem('blog-tab', label)
  }

  const filtered = active === '全部'
    ? posts
    : posts.filter(p => CATEGORIES.find(c => c.label === active)!.tags.some(t => p.tags.includes(t)))

  return (
    <div ref={ref}>
      {/* Category tabs */}
      <div className="flex gap-2 px-6 max-w-6xl mx-auto mb-8 flex-wrap justify-center sm:justify-start">
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => handleTabChange(cat.label)}
            className={`relative px-4 py-1.5 rounded-full text-sm font-mono transition-colors duration-200 cursor-pointer border ${
              active === cat.label
                ? 'text-white border-transparent'
                : 'text-slate-500 border-white/10 hover:text-slate-300 hover:border-white/20'
            }`}
          >
            {active === cat.label && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-primary/20 border border-primary/40 cursor-pointer"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-5 px-6 justify-center max-w-6xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              className="relative rounded-2xl overflow-hidden p-px w-[calc(100vw-3rem)] sm:w-80 md:w-88"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.97 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              layout
            >
              {/* Rotating light band */}
              <motion.div
                className="absolute -inset-full pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, #6366f1 15%, #a78bfa 22%, #22d3ee 28%, transparent 40%)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Card */}
              <MotionLink
                href={`/blog/${post.slug}/`}
                className="relative rounded-[14px] p-6 group transition-all block h-full"
                style={{ background: 'rgba(7, 7, 24, 0.95)', backdropFilter: 'blur(12px)' }}
              >
                <div className="flex gap-2 flex-wrap mb-3">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.description}</p>

                <span className="text-xs text-slate-500 font-mono">{post.date}</span>
              </MotionLink>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
