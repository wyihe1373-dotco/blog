'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { getAllPosts } from '@/lib/posts'

export default function Blog() {
  const posts = getAllPosts()
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <section id="blog" className="py-24 overflow-hidden">
      <div className="px-6 max-w-6xl mx-auto mb-10">
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">WRITING</p>
        <div className="flex items-end justify-between">
          <h2 className="text-5xl font-bold text-white tracking-tight">Latest Posts</h2>
          <span className="text-slate-500 text-sm font-mono hidden md:block">← drag to explore →</span>
        </div>
      </div>

      <motion.div
        ref={trackRef}
        className="flex gap-5 px-6 cursor-grab active:cursor-grabbing select-none"
        drag="x"
        dragConstraints={{ right: 0, left: -(posts.length * 380 - (typeof window !== 'undefined' ? window.innerWidth - 48 : 1200)) }}
        dragElastic={0.1}
        whileTap={{ cursor: 'grabbing' }}
      >
        {posts.map((post, i) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}/`}
            className="glass rounded-2xl p-6 shrink-0 w-85 md:w-95 group hover:border-primary/50 transition-all block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            onClick={(e) => {
              // Prevent navigation if the user was dragging
              const el = trackRef.current
              if (!el) return
              const delta = Math.abs(parseFloat(el.style.transform?.match(/-?\d+\.?\d*/)?.[0] ?? '0'))
              if (delta > 5) e.preventDefault()
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2 flex-wrap">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0 ml-2">{post.readingTime}</span>
            </div>

            <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
              {post.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">{post.date}</span>
              <span className="text-accent text-xs group-hover:translate-x-1 transition-transform">Read →</span>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  )
}
