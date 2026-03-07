'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}

export default function MagneticButton({ href, children, className = '', target, rel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    setPos({
      x: (e.clientX - cx) * 0.35,
      y: (e.clientY - cy) * 0.35,
    })
  }

  const onMouseLeave = () => setPos({ x: 0, y: 0 })

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.5 }}
    >
      {children}
    </motion.a>
  )
}
