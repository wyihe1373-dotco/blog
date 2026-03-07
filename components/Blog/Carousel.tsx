'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'

const MotionLink = motion(Link)

export default function BlogCarousel({ posts }: { posts: PostMeta[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragLeft, setDragLeft] = useState(-800)
  const [canDrag, setCanDrag] = useState(true)
  const [cardW, setCardW] = useState(380)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  useEffect(() => {
    const vw = window.innerWidth
    const w = vw < 640 ? vw - 48 : vw < 768 ? 340 : 380
    setCardW(w)
    const totalW = posts.length * (w + 20)
    const overflow = totalW - vw + 48
    if (overflow <= 0) {
      setCanDrag(false)
      setDragLeft(0)
    } else {
      setDragLeft(-overflow)
    }
  }, [posts.length])

  return (
    <motion.div
      ref={ref}
      className={`flex gap-5 px-6 select-none flex-wrap justify-center ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'flex-wrap justify-center'}`}
      drag={canDrag ? 'x' : false}
      dragConstraints={{ right: 0, left: dragLeft }}
      dragElastic={0.08}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      whileTap={canDrag ? { cursor: 'grabbing' } : {}}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {posts.map((post, i) => (
        <MotionLink
          key={post.slug}
          href={`/blog/${post.slug}/`}
          className="glass rounded-2xl p-6 shrink-0 group hover:border-primary/50 transition-all block"
          style={{ width: cardW }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => {
            const el = ref.current
            if (!el) return
            const match = el.style.transform?.match(/-?\d+\.?\d*/)
            const delta = Math.abs(parseFloat(match?.[0] ?? '0'))
            if (delta > 5) e.preventDefault()
          }}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap">
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
          </div>
        </MotionLink>
      ))}
    </motion.div>
  )
}
