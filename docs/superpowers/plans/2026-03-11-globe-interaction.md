# Globe 交互升级 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为首页地球添加拖拽手动旋转和预设城市标记（杭州·目前所在 / 南阳·家乡）点击展示功能。

**Architecture:** 在现有 `components/Hero/Globe.tsx` 的 Scene 组件中扩展：pointer events 实现拖拽旋转（直接操作 mesh rotation），Earth mesh 子节点 + drei `Html` 组件实现城市标记。只改一个文件，无新依赖（`@react-three/drei` 已在 package.json）。

**Tech Stack:** React Three Fiber, Three.js, @react-three/drei (Html), TypeScript

---

## Chunk 1: 拖拽旋转

### Task 1: 实现拖拽旋转

**Files:**
- Modify: `components/Hero/Globe.tsx`

- [ ] **Step 1: 确认 TypeScript 基线**

```bash
cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"
```

记录当前错误数作为基线。

- [ ] **Step 2: 在 Scene 顶部添加拖拽状态 refs**

在 `const { gl } = useThree()` 之后，`const colorMap = ...` 之前，添加：

```tsx
const dragging = useRef(false)
const lastX = useRef(0)
const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
const autoRotate = useRef(true)
```

- [ ] **Step 3: 添加 window 级别 pointer 事件监听**

在 Tab 隐藏 useEffect（`document.addEventListener('visibilitychange', ...)`）之后，紧接着添加新 useEffect：

```tsx
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
```

- [ ] **Step 4: 修改 useFrame 尊重 autoRotate**

将现有 useFrame：
```tsx
useFrame((_, delta) => {
  if (!inViewport.current || !tabVisible.current) return
  if (earthRef.current) earthRef.current.rotation.y += delta * 0.12
  if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.08
})
```

改为：
```tsx
useFrame((_, delta) => {
  if (!inViewport.current || !tabVisible.current) return
  if (!autoRotate.current) return
  if (earthRef.current) earthRef.current.rotation.y += delta * 0.12
  if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.08
})
```

- [ ] **Step 5: 在 Earth mesh 添加 pointer 事件**

将 `<mesh ref={earthRef}>` 改为：

```tsx
<mesh
  ref={earthRef}
  onPointerDown={(e) => {
    e.stopPropagation()
    dragging.current = true
    autoRotate.current = false
    lastX.current = e.clientX
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    gl.domElement.style.cursor = 'grabbing'
  }}
  onPointerEnter={() => { if (!dragging.current) gl.domElement.style.cursor = 'grab' }}
  onPointerLeave={() => { if (!dragging.current) gl.domElement.style.cursor = 'default' }}
>
```

- [ ] **Step 6: 检查 TypeScript**

```bash
cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"
```

Expected: 错误数不超过基线。

- [ ] **Step 7: 本地验证拖拽**

```bash
cd /Users/wyh/Desktop/self && npm run dev
```

打开 http://localhost:3000，确认：
- 悬停地球：光标变 `grab`
- 按住拖动：地球跟随移动，云层同向更慢，光标变 `grabbing`
- 松开：1.5s 后地球恢复自动旋转
- Console 无报错

- [ ] **Step 8: Commit**

```bash
git add components/Hero/Globe.tsx
git commit -m "feat: add drag-to-rotate interaction to globe"
```

---

## Chunk 2: 城市标记

### Task 2: 添加数据层和坐标转换

**Files:**
- Modify: `components/Hero/Globe.tsx`

- [ ] **Step 1: 在文件顶部添加 imports，更新 react import**

将：
```tsx
import { Suspense, useEffect, useRef } from 'react'
```
改为：
```tsx
import { Suspense, useEffect, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
```

- [ ] **Step 2: 在 `const BASE = ...` 之后添加数据和工具函数**

```tsx
interface Location {
  name: string
  label: string
  lat: number
  lon: number
}

const LOCATIONS: Location[] = [
  { name: '杭州', label: '目前所在', lat: 30.25, lon: 120.15 },
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
```

- [ ] **Step 3: 检查 TypeScript**

```bash
cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"
```

Expected: 0 新增错误。

---

### Task 3: 实现 LocationMarker 组件

**Files:**
- Modify: `components/Hero/Globe.tsx`

在 `latLonToVec3` 函数之后、`Scene` 函数之前，添加 LocationMarker 组件：

- [ ] **Step 1: 添加 LocationMarker 组件**

```tsx
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
  const pulseProgress = useRef(Math.random()) // 错开各标记脉冲相位

  useFrame((_, delta) => {
    if (!pulseRef.current) return
    pulseProgress.current = (pulseProgress.current + delta * 0.33) % 1 // 3s 周期
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
          onActivate()
        }}
        onPointerEnter={(e) => { e.stopPropagation() }}
      >
        <sphereGeometry args={[active ? 0.055 : 0.04, 8, 8]} />
        <meshBasicMaterial
          color={active ? '#6366f1' : '#ffffff'}
          transparent
          opacity={active ? 1 : 0.85}
        />
      </mesh>

      {/* 脉冲扩散圈 */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.065, 16]} />
        <meshBasicMaterial
          color={active ? '#6366f1' : '#ffffff'}
          transparent
          opacity={0.6}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 信息卡（背面自动隐藏） */}
      {active && (
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
```

- [ ] **Step 2: 在 Scene 中添加 activeLocation state**

在 Scene 函数体内，`const dragging = useRef(false)` 之前（或之后均可），添加：

```tsx
const [activeLocation, setActiveLocation] = useState<string | null>(null)
```

- [ ] **Step 3: 在 Earth mesh 内添加标记，并在点击地球时清除激活状态**

Earth mesh 的 `onPointerDown` 改为同时清除 activeLocation：
```tsx
onPointerDown={(e) => {
  e.stopPropagation()
  dragging.current = true
  autoRotate.current = false
  lastX.current = e.clientX
  if (resumeTimer.current) clearTimeout(resumeTimer.current)
  gl.domElement.style.cursor = 'grabbing'
  setActiveLocation(null)
}}
```

在 Earth mesh 的 `</meshPhongMaterial>` 之后、`</mesh>` 之前，嵌入标记：
```tsx
{LOCATIONS.map(loc => (
  <LocationMarker
    key={loc.name}
    location={loc}
    active={activeLocation === loc.name}
    onActivate={() => setActiveLocation(prev => prev === loc.name ? null : loc.name)}
  />
))}
```

最终 Earth mesh 结构如下：
```tsx
<mesh
  ref={earthRef}
  onPointerDown={...}
  onPointerEnter={...}
  onPointerLeave={...}
>
  <sphereGeometry args={[1.5, seg, seg]} />
  <meshPhongMaterial map={colorMap} shininess={15} specular={0x222222} />
  {LOCATIONS.map(loc => (
    <LocationMarker
      key={loc.name}
      location={loc}
      active={activeLocation === loc.name}
      onActivate={() => setActiveLocation(prev => prev === loc.name ? null : loc.name)}
    />
  ))}
</mesh>
```

- [ ] **Step 4: 检查 TypeScript**

```bash
cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"
```

Expected: 错误数不超过基线。

- [ ] **Step 5: 本地验证标记效果**

```bash
cd /Users/wyh/Desktop/self && npm run dev
```

打开 http://localhost:3000，确认：
- 地球上有两个发光白点（杭州约右侧偏上，南阳约右侧中部）
- 每个标记有脉冲扩散圈，两个标记相位错开
- 点击标记：小球变蓝 + 信息卡弹出（城市名 + 描述），卡片在点右侧
- 再次点击同一标记：卡片收起
- 点击地球非标记区域：卡片收起
- 地球旋转到背面时：标记和卡片消失（occlude 生效）
- 拖拽旋转和标记交互兼容（不互相干扰）
- Console 无报错

- [ ] **Step 6: Commit**

```bash
git add components/Hero/Globe.tsx
git commit -m "feat: add city markers with pulse animation and click info cards to globe"
```

---

## 完成检查

- [ ] 拖拽地球可以手动旋转，云层同向但更慢（差速保持）
- [ ] 悬停时光标 `grab`，拖拽时 `grabbing`，离开时 `default`
- [ ] 松开 1.5s 后地球恢复自动旋转
- [ ] 杭州、南阳两个标记可见，有错相脉冲动画
- [ ] 点击标记弹出信息卡，再次点击或点击其他地方收起
- [ ] 标记在地球背面时自动隐藏
- [ ] TypeScript 错误数不超过基线
- [ ] Console 无报错
