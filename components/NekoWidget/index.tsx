'use client'
import { useEffect, useRef, useState } from 'react'

type State = 'sleep' | 'idle' | 'alert' | 'run'

const SCALE = 2
const SIZE = 16 * SCALE

/* pixel frames 16×16: 0=transparent 1=body 2=outline 3=accent */
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
    [0,0,2,1,1,1,1,2,0,0,0,2,1,1,2,0],
    [0,0,0,2,2,1,1,1,1,1,2,1,1,1,1,2],
    [0,0,0,0,0,2,1,1,1,1,1,1,1,1,2,0],
    [0,0,0,0,0,0,2,1,1,1,1,1,2,0,0,0],
    [0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0],
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

const COLORS = ['transparent', '#e2e8f0', '#64748b', '#6366f1']

function drawFrame(ctx: CanvasRenderingContext2D, frame: number[][], flipX: boolean) {
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.save()
  if (flipX) {
    ctx.translate(SIZE, 0)
    ctx.scale(-1, 1)
  }
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const v = frame[row][col]
      if (v === 0) continue
      ctx.fillStyle = COLORS[v]
      ctx.fillRect(col * SCALE, row * SCALE, SCALE, SCALE)
    }
  }
  ctx.restore()
}

export default function NekoWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<State>('sleep')
  const runFrameRef = useRef(0)
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rafRef = useRef<number | undefined>(undefined)
  const cursorRef = useRef({ x: -999, y: -999 })
  const catPosRef = useRef({ x: 0, y: 0 })  // will init on mount
  const [visible, setVisible] = useState(true)
  const [flipX, setFlipX] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    // init cat position bottom-right
    catPosRef.current = { x: window.innerWidth - 60, y: window.innerHeight - 60 }

    const resetSleep = () => {
      clearTimeout(sleepTimerRef.current)
      sleepTimerRef.current = setTimeout(() => {
        stateRef.current = 'sleep'
      }, 6000)
    }

    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      if (stateRef.current === 'sleep') stateRef.current = 'alert'
      resetSleep()
    }
    window.addEventListener('mousemove', onMouseMove)
    resetSleep()

    let tick = 0
    const loop = () => {
      tick++
      const cat = catPosRef.current
      const cur = cursorRef.current
      const dx = cur.x - cat.x
      const dy = cur.y - cat.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // decide flip direction based on cursor
      if (Math.abs(dx) > 4) setFlipX(dx < 0)

      let frameName: string
      const state = stateRef.current

      if (state === 'sleep') {
        frameName = 'sleep'
      } else if (state === 'alert') {
        frameName = 'sit'
        if (dist > 40) stateRef.current = 'run'
      } else if (state === 'run') {
        if (dist < 36) {
          stateRef.current = 'idle'
        } else {
          // move toward cursor
          const speed = Math.min(4, dist * 0.08)
          catPosRef.current = {
            x: cat.x + (dx / dist) * speed,
            y: cat.y + (dy / dist) * speed,
          }
          // clamp to viewport
          catPosRef.current.x = Math.max(20, Math.min(window.innerWidth  - 20, catPosRef.current.x))
          catPosRef.current.y = Math.max(20, Math.min(window.innerHeight - 20, catPosRef.current.y))

          if (canvas.parentElement) {
            canvas.parentElement.style.left = `${catPosRef.current.x - SIZE / 2}px`
            canvas.parentElement.style.top  = `${catPosRef.current.y - SIZE / 2}px`
          }
        }
        // alternate run frames every 8 ticks
        if (tick % 8 === 0) runFrameRef.current = runFrameRef.current === 0 ? 1 : 0
        frameName = runFrameRef.current === 0 ? 'run1' : 'run2'
      } else {
        // idle: stay put, check if cursor moved far
        frameName = 'sit'
        if (dist > 60) stateRef.current = 'run'
      }

      drawFrame(ctx, FRAMES[frameName], flipX)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      clearTimeout(sleepTimerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [flipX])

  if (!visible) return null

  return (
    <div
      className="fixed z-999"
      style={{
        right: 24,
        bottom: 24,
        width: SIZE,
        height: SIZE,
      }}
    >
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
      <button
        className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-700/80 text-slate-400 flex items-center justify-center hover:bg-slate-600 leading-none"
        style={{ fontSize: 9 }}
        onClick={() => setVisible(false)}
        title="关闭小猫"
      >
        ×
      </button>
    </div>
  )
}
