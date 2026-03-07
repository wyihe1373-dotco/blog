import { useRef, useCallback } from 'react'

export function useTilt(maxDeg = 8) {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5  // -0.5 ~ 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    el.style.transform = `perspective(1000px) rotateY(${x * maxDeg * 2}deg) rotateX(${-y * maxDeg * 2}deg) translateZ(4px)`

    // 局部 spotlight
    el.style.setProperty('--card-mx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--card-my', `${(y + 0.5) * 100}%`)
  }, [maxDeg])

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)'
    el.style.setProperty('--card-mx', '50%')
    el.style.setProperty('--card-my', '50%')
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
