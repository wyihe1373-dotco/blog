'use client'

export default function CodeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Perspective grid */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden" style={{ height: '70%' }}>
        <div
          style={{
            width: '200%',
            height: '100%',
            flexShrink: 0,
            transformOrigin: 'bottom center',
            transform: 'perspective(400px) rotateX(55deg)',
            background: `
              repeating-linear-gradient(90deg, rgba(99,102,241,0.18) 0 1px, transparent 1px 80px),
              repeating-linear-gradient(0deg,  rgba(99,102,241,0.18) 0 1px, transparent 1px 80px)
            `,
            animation: 'gridScroll 6s linear infinite',
          }}
        />
      </div>

      {/* Fade: bottom → transparent (hide grid edge) */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background to-transparent" />

      {/* Fade: top → transparent */}
      <div className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-background/80 to-transparent" />

      {/* Center glow */}
      <div
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2"
        style={{
          width: '40%',
          height: '120px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
        }}
      />

      <style>{`
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to   { background-position: 0 80px; }
        }
      `}</style>
    </div>
  )
}
