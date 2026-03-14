'use client'
import { useRef, useEffect } from 'react'

// ── Config ────────────────────────────────────────────────
const CFG = {
  headGlow: 9,
  tailPct:  0.12,
  tailGlow: 1.5,
  alphaPow: 2,
  durMs:    2600,
  steps:    38,
  gb:       18,   // canvas bleed beyond card edge
}

// ── Path helpers ─────────────────────────────────────────
function borderPathStr(w: number, h: number, r: number) {
  const cx = w / 2
  return [
    `M ${cx} 0`, `L ${w - r} 0`,
    `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `L ${r} ${h}`,
    `Q 0 ${h} 0 ${h - r}`,
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    `L ${cx} 0`,
  ].join(' ')
}

function makeBorderPath2D(w: number, h: number, r: number) {
  return new Path2D(borderPathStr(w, h, r))
}

function makeDonutClip(w: number, h: number, r: number, gb: number) {
  const p = new Path2D()
  p.rect(-gb, -gb, w + gb * 2, h + gb * 2)
  p.moveTo(r, 0); p.lineTo(w - r, 0)
  p.quadraticCurveTo(w, 0, w, r)
  p.lineTo(w, h - r)
  p.quadraticCurveTo(w, h, w - r, h)
  p.lineTo(r, h)
  p.quadraticCurveTo(0, h, 0, h - r)
  p.lineTo(0, r)
  p.quadraticCurveTo(0, 0, r, 0)
  p.closePath()
  return p
}

// ── Timing ───────────────────────────────────────────────
function getOpacity(p: number) {
  if (p < 0.05) return 0
  if (p < 0.18) return Math.pow((p - 0.05) / 0.13, 3)
  if (p < 0.75) return 1
  if (p < 0.97) return 1 - (p - 0.75) / 0.22
  return 0
}

function getHeadDist(p: number, perim: number) {
  if (p < 0.18) return 0
  if (p > 0.90) return perim / 2
  return ((p - 0.18) / 0.72) * perim / 2
}

// ── Draw comet ───────────────────────────────────────────
function drawComet(
  ctx: CanvasRenderingContext2D,
  pathEl: SVGPathElement,
  headDist: number,
  perim: number,
  color: [number, number, number],
) {
  const { headGlow, tailGlow, tailPct, alphaPow, steps } = CFG
  const cometLen = perim * tailPct
  const [r, g, b] = color

  for (let comet = 0; comet < 2; comet++) {
    const head = headDist + comet * (perim / 2)

    for (let i = 0; i <= steps; i++) {
      const t    = i / steps
      const dist = head - (1 - t) * cometLen
      if (dist < 0) continue

      const pt    = pathEl.getPointAtLength(dist % perim)
      const alpha = Math.pow(t, alphaPow)
      if (alpha < 0.004) continue

      const radius = tailGlow + t * (headGlow - tailGlow)

      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius)
      grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha.toFixed(3)})`)
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${(alpha * 0.5).toFixed(3)})`)
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`)
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Extra bright core near head
      if (t > 0.85) {
        const coreAlpha = ((t - 0.85) / 0.15) * alpha
        const coreR     = radius * 0.35
        const core = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, coreR)
        core.addColorStop(0,   `rgba(220,235,255,${coreAlpha.toFixed(3)})`)
        core.addColorStop(0.5, `rgba(${r},${g},${b},${(coreAlpha * 0.6).toFixed(3)})`)
        core.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, coreR, 0, Math.PI * 2)
        ctx.fillStyle = core
        ctx.fill()
      }
    }
  }
}

// ── Component ─────────────────────────────────────────────
interface BeamCardProps {
  children: React.ReactNode
  className?: string
  borderRadius?: number
  color?: [number, number, number]
}

export function BeamCard({
  children,
  className = '',
  borderRadius = 14,
  color = [99, 102, 241],
}: BeamCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const startRef     = useRef<number>(0)
  const pathElRef    = useRef<SVGPathElement | null>(null)
  const perimRef     = useRef<number>(0)
  const borderRef    = useRef<Path2D | null>(null)
  const donutRef     = useRef<Path2D | null>(null)
  const { gb }       = CFG

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    // Off-screen SVG for getPointAtLength / getTotalLength
    const ns  = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg') as SVGSVGElement
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
    const pathEl = document.createElementNS(ns, 'path') as SVGPathElement
    svg.appendChild(pathEl)
    document.body.appendChild(svg)
    pathElRef.current = pathEl

    function setup() {
      const w   = container!.clientWidth
      const h   = container!.clientHeight
      const r   = borderRadius
      const dpr = window.devicePixelRatio || 1
      canvas!.width        = (w + gb * 2) * dpr
      canvas!.height       = (h + gb * 2) * dpr
      canvas!.style.width  = `${w + gb * 2}px`
      canvas!.style.height = `${h + gb * 2}px`
      canvas!.style.left   = `-${gb}px`
      canvas!.style.top    = `-${gb}px`
      pathEl.setAttribute('d', borderPathStr(w, h, r))
      perimRef.current = pathEl.getTotalLength()
      borderRef.current = makeBorderPath2D(w, h, r)
      donutRef.current  = makeDonutClip(w, h, r, gb)
    }

    setup()
    startRef.current = performance.now()

    function frame(now: number) {
      const progress = ((now - startRef.current) % CFG.durMs) / CFG.durMs
      const ctx = canvas!.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      const opacity  = getOpacity(progress)
      const headDist = getHeadDist(progress, perimRef.current)

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.translate(gb, gb)

      if (opacity > 0.005) {
        // Dim border ring
        ctx.save()
        ctx.globalAlpha  = opacity * 0.2
        ctx.strokeStyle  = `rgb(${color[0]},${color[1]},${color[2]})`
        ctx.lineWidth    = 1
        ctx.shadowBlur   = 3
        ctx.shadowColor  = `rgb(${color[0]},${color[1]},${color[2]})`
        ctx.stroke(borderRef.current!)
        ctx.restore()

        // Comet (clipped to outside card only)
        ctx.save()
        ctx.clip(donutRef.current!, 'evenodd')
        ctx.globalAlpha = opacity
        drawComet(ctx, pathEl, headDist, perimRef.current, color)
        ctx.restore()
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    const ro = new ResizeObserver(setup)
    ro.observe(container)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      document.body.removeChild(svg)
    }
  }, [borderRadius, color, gb])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="absolute pointer-events-none" style={{ zIndex: 0 }} />
      <div className="relative" style={{ zIndex: 1 }}>{children}</div>
    </div>
  )
}
