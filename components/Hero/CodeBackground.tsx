'use client'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

const TOKENS = [
  { text: 'const fn = async () =>', color: '#22d3ee' },
  { text: 'await Promise.all([])', color: '#a78bfa' },
  { text: 'interface Props {}', color: '#6366f1' },
  { text: '.map(x => x * 2)', color: '#818cf8' },
  { text: 'type T = string | null', color: '#22d3ee' },
  { text: 'useEffect(() => {}, [])', color: '#a78bfa' },
  { text: 'export default {}', color: '#6366f1' },
  { text: 'Promise.resolve(data)', color: '#818cf8' },
  { text: '// TODO: optimize', color: '#334155' },
  { text: 'catch (err) {}', color: '#22d3ee' },
  { text: 'return <Component />', color: '#a78bfa' },
  { text: 'useState<string>()', color: '#6366f1' },
  { text: 'Object.entries(map)', color: '#818cf8' },
  { text: 'Array.from({ length })', color: '#22d3ee' },
  { text: 'try { await fetch() }', color: '#a78bfa' },
  { text: 'import { ref } from', color: '#6366f1' },
  { text: '.filter(Boolean)', color: '#818cf8' },
  { text: 'debounce(fn, 300)', color: '#22d3ee' },
]

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export default function CodeBackground() {
  const tokens = useMemo(() => {
    return TOKENS.map((t, i) => {
      const rand = seededRand(i * 7919 + 31337)
      return {
        ...t,
        id: i,
        left: 2 + rand() * 90,
        top: 5 + rand() * 85,
        fontSize: 10 + rand() * 4,
        opacity: 0.12 + rand() * 0.18,
        duration: 8 + rand() * 10,
        delay: rand() * -14,
        rotateFrom: -6 + rand() * 12,
        rotateTo: -6 + rand() * 12,
        yOffset: 18 + rand() * 20,
      }
    })
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: '600px' }}>
      {tokens.map(t => (
        <motion.div
          key={t.id}
          style={{
            position: 'absolute',
            left: `${t.left}%`,
            top: `${t.top}%`,
            fontFamily: 'monospace',
            fontSize: `${t.fontSize}px`,
            color: t.color,
            whiteSpace: 'nowrap',
            opacity: t.opacity,
          }}
          animate={{
            y: [`0px`, `-${t.yOffset}px`, `0px`],
            rotateY: [t.rotateFrom, t.rotateTo, t.rotateFrom],
            rotateX: [2, -2, 2],
          }}
          transition={{
            duration: t.duration,
            delay: t.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {t.text}
        </motion.div>
      ))}
    </div>
  )
}
