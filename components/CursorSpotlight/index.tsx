'use client'
import { useEffect, useRef } from 'react'

export default function CursorSpotlight() {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!divRef.current) return
      divRef.current.style.setProperty('--mx', `${e.clientX}px`)
      divRef.current.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(600px at var(--mx, -999px) var(--my, -999px), rgba(99,102,241,0.07), transparent 80%)',
      }}
    />
  )
}
