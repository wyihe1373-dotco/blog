'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { PostMeta } from '@/lib/posts'

export default function BlogCarousel({ posts }: { posts: PostMeta[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragLeft = -(posts.length * 400 - 1200)

  return (
    <motion.div
      ref={trackRef}
      className="flex gap-5 px-6 cursor-grab active:cursor-grabbing select-none"
      drag="x"
      dragConstraints={{ right: 0, left: Math.min(dragLeft, -20) }}
      dragElastic={0.1}
      whileTap={{ cursor: 'grabbing' }}
    >
      {posts.map((post, i) => (
        <motion.a
          key={post.slug}
          href={`/blog/${post.slug}/`}
          className="glass rounded-2xl p-6 shrink-0 w-[340px] md:w-[380px] group hover:border-primary/50 transition-all block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          onClick={(e) => {
            const el = trackRef.current
            if (!el) return
            const match = el.style.transform?.match(/-?\d+\.?\d*/)
            const delta = Math.abs(parseFloat(match?.[0] ?? '0'))
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
  )
}
