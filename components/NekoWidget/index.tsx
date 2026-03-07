'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

type State = 'sleep' | 'idle' | 'alert' | 'run'
type Dir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

const SPEED = 3
const WAKE_DIST = 180
const REACH_DIST = 24
const SLEEP_AFTER = 5000
const SIZE = 32

/* ── pixel cat frames (16×16 grid, scaled ×2) ─────────────────────── */
// Each frame is a 16×16 array: 0=transparent, 1=body, 2=outline, 3=eye/detail
const FRAMES: Record<string, number[][]> = {
  sit: [
    [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    [0,0,0,0,2,1,1,2,2,1,1,2,0,0,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,2,1,1,3,1,1,1,1,3,1,1,2,0,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,2,1,1,1,2,1,1,2,1,1,1,2,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
    [0,0,0,2,1,1,2,0,0,2,1,1,2,0,0,0],
    [0,0,2,1,1,1,1,2,2,1,1,1,1,2,0,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
    [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  ],
  sleep: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,2,2,0,0,2,2,0,0,0,0,0,0,0,0],
    [0,2,1,1,2,2,1,1,2,0,0,3,0,3,0,0],
    [0,2,1,1,1,1,1,1,2,0,0,0,3,0,0,0],
    [0,2,1,2,1,1,2,1,2,0,0,3,0,3,0,0],
    [0,2,1,1,1,1,1,1,2,0,0,0,0,0,0,0],
    [0,0,2,1,1,1,1,2,0,0,0,0,0,0,0,0],
    [0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,0,2,2,2,1,1,1,1,2,2,2,0,0,0],
    [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  ],
  run1: [
    [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    [0,0,0,0,2,1,1,2,2,1,1,2,0,0,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,2,1,1,3,1,1,1,1,3,1,1,2,0,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,2,1,1,1,2,1,1,2,1,1,1,2,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
    [0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0],
    [0,0,2,1,1,1,1,2,0,0,0,0,0,0,0,0],
    [0,2,1,1,1,1,1,1,2,0,0,0,0,0,0,0],
    [0,0,2,1,1,1,1,2,0,0,0,0,2,1,1,2],
    [0,0,0,2,2,1,1,1,1,1,1,2,1,1,1,2],
    [0,0,0,0,0,2,1,1,1,1,1,1,1,1,2,0],
    [0,0,0,0,0,0,2,1,1,1,1,1,1,2,0,0],
    [0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0],
  ],
  run2: [
    [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    [0,0,0,0,2,1,1,2,2,1,1,2,0,0,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,2,1,1,3,1,1,1,1,3,1,1,2,0,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,2,1,1,1,2,1,1,2,1,1,1,2,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
    [0,2,1,2,0,0,0,0,0,0,0,2,1,1,2,0],
    [2,1,1,1,2,0,0,0,0,0,2,1,1,1,1,2],
    [0,2,1,1,1,2,0,0,0,2,1,1,1,1,2,0],
    [0,0,2,1,1,1,2,2,2,1,1,1,1,2,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,0,0,2,2,1,1,1,1,2,2,0,0,0,0],
    [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
}

const COLORS = ['transparent', '#e2e8f0', '#475569', '#6366f1']

function drawFrame(ctx: CanvasRenderingContext2D, frame: number[][], scale: number) {
  ctx.clearRect(0, 0, 16 * scale, 16 * scale)
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const v = frame[row][col]
      if (v === 0) continue
      ctx.fillStyle = COLORS[v]
      ctx.fillRect(col * scale, row * scale, scale, scale)
    }
  }
}

export default function NekoWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth - 80 : 400, y: typeof window !== 'undefined' ? window.innerHeight - 80 : 400 })
  const cursorRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef<State>('sleep')
  const frameRef = useRef(0)
  const tickRef = useRef(0)
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rafRef = useRef<number | undefined>(undefined)
  const [visible, setVisible] = useState(true)
  const scale = 2

  const getDir = useCallback((): Dir => {
    const dx = cursorRef.current.x - posRef.current.x
    const dy = cursorRef.current.y - posRef.current.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    if (angle > -22.5 && angle <= 22.5)  return 'e'
    if (angle > 22.5  && angle <= 67.5)  return 'se'
    if (angle > 67.5  && angle <= 112.5) return 's'
    if (angle > 112.5 && angle <= 157.5) return 'sw'
    if (angle > 157.5 || angle <= -157.5) return 'w'
    if (angle > -157.5 && angle <= -112.5) return 'nw'
    if (angle > -112.5 && angle <= -67.5)  return 'n'
    return 'ne'
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      if (stateRef.current === 'sleep') {
        const dx = e.clientX - posRef.current.x
        const dy = e.clientY - posRef.current.y
        if (Math.sqrt(dx * dx + dy * dy) < WAKE_DIST) {
          stateRef.current = 'alert'
          clearTimeout(sleepTimerRef.current)
        }
      }
      resetSleepTimer()
    }

    const resetSleepTimer = () => {
      clearTimeout(sleepTimerRef.current)
      sleepTimerRef.current = setTimeout(() => {
        stateRef.current = 'sleep'
        frameRef.current = 0
      }, SLEEP_AFTER)
    }

    window.addEventListener('mousemove', onMouseMove)

    const loop = () => {
      tickRef.current++

      const pos = posRef.current
      const cursor = cursorRef.current
      const dx = cursor.x - pos.x
      const dy = cursor.y - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      let frameName = 'sit'

      if (stateRef.current === 'sleep') {
        frameName = 'sleep'
      } else if (stateRef.current === 'alert') {
        frameName = 'sit'
        if (dist > REACH_DIST + 10) {
          stateRef.current = 'run'
        }
      } else if (stateRef.current === 'run') {
        if (dist <= REACH_DIST) {
          stateRef.current = 'idle'
          frameRef.current = 0
        } else {
          // move toward cursor
          const nx = dx / dist
          const ny = dy / dist
          posRef.current = { x: pos.x + nx * SPEED, y: pos.y + ny * SPEED }
          canvas.style.left = `${posRef.current.x - SIZE / 2}px`
          canvas.style.top  = `${posRef.current.y - SIZE / 2}px`

          // alternate run frames every 8 ticks
          if (tickRef.current % 8 === 0) frameRef.current = frameRef.current === 0 ? 1 : 0
          frameName = frameRef.current === 0 ? 'run1' : 'run2'
        }
      } else {
        // idle
        frameName = 'sit'
        if (dist > WAKE_DIST) {
          stateRef.current = 'run'
        }
      }

      // flip horizontally if going left
      const dir = getDir()
      const flipX = ['w', 'nw', 'sw'].includes(dir)

      ctx.save()
      if (flipX) {
        ctx.translate(16 * scale, 0)
        ctx.scale(-1, 1)
      }
      drawFrame(ctx, FRAMES[frameName], scale)
      ctx.restore()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      clearTimeout(sleepTimerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [getDir])

  if (!visible) return null

  return (
    <div
      className="fixed z-[999] pointer-events-none"
      style={{
        left: posRef.current.x - SIZE / 2,
        top: posRef.current.y - SIZE / 2,
      }}
    >
      <canvas
        ref={canvasRef}
        width={16 * scale}
        height={16 * scale}
        style={{ imageRendering: 'pixelated', width: SIZE, height: SIZE }}
      />
      {/* dismiss button */}
      <button
        className="pointer-events-auto absolute -top-3 -right-3 w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[8px] flex items-center justify-center hover:bg-slate-600 leading-none"
        onClick={() => setVisible(false)}
        style={{ fontSize: 8 }}
      >
        ×
      </button>
    </div>
  )
}
