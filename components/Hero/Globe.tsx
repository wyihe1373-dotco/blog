'use client'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function Scene({ isMobile }: { isMobile: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const inViewport = useRef(true)
  const tabVisible = useRef(true)
  const { gl } = useThree()

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

  useFrame((_, delta) => {
    if (!inViewport.current || !tabVisible.current) return
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
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.5, seg, seg]} />
        <meshPhongMaterial
          map={colorMap}
          shininess={15}
          specular={0x222222}
        />
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
