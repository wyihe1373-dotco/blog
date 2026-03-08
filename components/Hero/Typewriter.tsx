'use client'
import { useEffect, useState } from 'react'

const roles = ['前端开发工程师 · 6 年', 'Vue / React', 'Echarts', 'H5 Web 混合开发']

export default function Typewriter() {
  const [display, setDisplay] = useState('')
  const [roleIdx, setRoleIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing')

  useEffect(() => {
    const target = roles[roleIdx]
    const timeout = setTimeout(() => {
      if (phase === 'typing') {
        if (display.length < target.length) {
          setDisplay(target.slice(0, display.length + 1))
        } else {
          setTimeout(() => setPhase('deleting'), 2000)
        }
      } else {
        if (display.length > 0) {
          setDisplay(display.slice(0, -1))
        } else {
          setRoleIdx((i) => (i + 1) % roles.length)
          setPhase('typing')
        }
      }
    }, phase === 'typing' ? 80 : 40)
    return () => clearTimeout(timeout)
  }, [display, phase, roleIdx])

  return (
    <span className="text-accent font-mono">
      {display}
     
    </span>
  )
}
