'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface Location {
  name: string
  label: string
  lat: number
  lon: number
  current?: boolean  // marks the user's current city
}

const LOCATIONS: Location[] = [
  { name: '杭州', label: '目前所在', lat: 30.25, lon: 120.15, current: true },
  { name: '南阳', label: '家乡', lat: 33.00, lon: 112.53 },
]

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function LocationMarker({
  location,
  active,
  onActivate,
}: {
  location: Location
  active: boolean
  onActivate: () => void
}) {
  const pulseRef = useRef<THREE.Mesh>(null)
  const pulseProgress = useRef(Math.random())

  // 当前城市（current: true）始终高亮 + 信息卡常驻，不受点击影响
  const isCurrent = !!location.current
  const isActive = isCurrent || active

  useFrame((_, delta) => {
    if (!pulseRef.current) return
    pulseProgress.current = (pulseProgress.current + delta * 0.33) % 1
    const t = pulseProgress.current
    pulseRef.current.scale.setScalar(1 + t * 1.5)
    const mat = pulseRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = (1 - t) * 0.6
  })

  const pos = latLonToVec3(location.lat, location.lon, 1.53)

  return (
    <group position={pos}>
      {/* 发光点 */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation()
          if (!isCurrent) onActivate()
        }}
        onPointerEnter={(e) => { e.stopPropagation() }}
      >
        <sphereGeometry args={[isActive ? 0.055 : 0.04, 8, 8]} />
        <meshBasicMaterial
          color={isActive ? '#6366f1' : '#ffffff'}
          transparent
          opacity={isActive ? 1 : 0.85}
        />
      </mesh>

      {/* 脉冲扩散圈 */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.065, 16]} />
        <meshBasicMaterial
          color={isActive ? '#6366f1' : '#ffffff'}
          transparent
          opacity={0.6}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 信息卡 — current 城市常驻，其他城市激活时显示 */}
      {isActive && (
        <Html occlude distanceFactor={10} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            background: 'rgba(7,7,24,0.88)',
            border: '1px solid rgba(99,102,241,0.5)',
            borderRadius: '8px',
            padding: '8px 12px',
            minWidth: '80px',
            transform: 'translate(12px, -50%)',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
              {location.name}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
              {location.label}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const inViewport = useRef(true)
  const tabVisible = useRef(true)
  const { gl } = useThree()

  const dragging = useRef(false)
  const lastX = useRef(0)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRotate = useRef(true)
  const [activeLocation, setActiveLocation] = useState<string | null>(null)

  const colorMap = useLoader(TextureLoader, `${BASE}/earth-map.jpg`)
  const cloudsMap = useLoader(TextureLoader, `${BASE}/earth-clouds.png`)

  // 离屏暂停
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { inViewport.current = e.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(gl.domElement)
    return () => observer.disconnect()
  }, [gl])

  // Tab 隐藏暂停
  useEffect(() => {
    const onVisibility = () => { tabVisible.current = !document.hidden }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // 拖拽旋转
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const deltaX = e.clientX - lastX.current
      lastX.current = e.clientX
      if (earthRef.current) earthRef.current.rotation.y += deltaX * 0.005
      // 云层保持差速比例（0.667 = 0.08 / 0.12）
      if (cloudsRef.current) cloudsRef.current.rotation.y += deltaX * 0.005 * 0.667
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      gl.domElement.style.cursor = 'grab'
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      resumeTimer.current = setTimeout(() => { autoRotate.current = true }, 1500)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [gl])

  useFrame((_, delta) => {
    if (!inViewport.current || !tabVisible.current) return
    if (!autoRotate.current) return
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.12
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.08
  })

  const seg = isMobile ? 24 : 32

  return (
    <>
      {/* 太阳光 */}
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <ambientLight intensity={0.15} />

      {/* 地球本体 */}
      <mesh
        ref={earthRef}
        onPointerDown={(e) => {
          e.stopPropagation()
          dragging.current = true
          autoRotate.current = false
          lastX.current = e.clientX
          if (resumeTimer.current) clearTimeout(resumeTimer.current)
          gl.domElement.style.cursor = 'grabbing'
          setActiveLocation(null)
        }}
        onPointerEnter={() => { if (!dragging.current) gl.domElement.style.cursor = 'grab' }}
        onPointerLeave={() => { if (!dragging.current) gl.domElement.style.cursor = 'default' }}
      >
        <sphereGeometry args={[1.5, seg, seg]} />
        <meshPhongMaterial
          map={colorMap}
          shininess={15}
          specular={0x222222}
        />
        {LOCATIONS.map(loc => (
          <LocationMarker
            key={loc.name}
            location={loc}
            active={activeLocation === loc.name}
            onActivate={() => setActiveLocation(prev => prev === loc.name ? null : loc.name)}
          />
        ))}
      </mesh>

      {/* 云层（A_c.png 是灰度图，用作 alphaMap） */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.52, seg, seg]} />
        <meshPhongMaterial
          alphaMap={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
          color="#ffffff"
        />
      </mesh>

      {/* 大气层外圈 */}
      <mesh>
        <sphereGeometry args={[1.58, seg, seg]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

export default function Globe() {
  const isMobile = window.innerWidth < 640

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      performance={{ min: 0.5 }}
      dpr={[1, 2]}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene isMobile={isMobile} />
      </Suspense>
    </Canvas>
  )
}
