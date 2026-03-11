# Globe 贴图升级 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页地球从 wireframe 线框升级为带真实贴图、云层、大气层光晕的写实风格，并更新性能优化技术文档。

**Architecture:** 保留 R3F Canvas 结构和全部性能优化（IntersectionObserver、visibilitychange、移动端降级）；Scene 内改为三层球体（地球本体 + 云层 + 大气层）+ Phong 光照；纹理通过 `useLoader(TextureLoader)` 懒加载，配合 `<Suspense>` 隔离。Globe 在 Hero/index.tsx 已通过 `dynamic({ ssr: false })` 加载，SSR 安全。

**Tech Stack:** React Three Fiber, Three.js, TextureLoader, sips (macOS 图片处理)

---

## Chunk 1: 准备贴图资源

### Task 1: 转换地球颜色贴图为 WebP

**Files:**
- Create: `public/earth-color.webp`
- Create: `public/earth-color-mobile.webp`

- [ ] **Step 1: 确认 sips 支持 WebP**

```bash
sips --help | grep -i webp
```

Expected: 输出中包含 `webp`，macOS 12+ 支持

- [ ] **Step 2: 转换为全分辨率 WebP**

```bash
sips -s format webp "/Users/wyh/Downloads/C4D Earth/r/cd.jpg" \
  --out /Users/wyh/Desktop/self/public/earth-color.webp
```

- [ ] **Step 3: 转换并缩小移动端版本（512px 宽）**

```bash
sips -s format webp --resampleWidth 512 \
  "/Users/wyh/Downloads/C4D Earth/r/cd.jpg" \
  --out /Users/wyh/Desktop/self/public/earth-color-mobile.webp
```

- [ ] **Step 4: 确认两个文件大小合理**

```bash
ls -lh /Users/wyh/Desktop/self/public/earth-color*.webp
```

Expected: `earth-color.webp` < 600KB，`earth-color-mobile.webp` 明显更小（< 60KB）

---

### Task 2: 转换云层贴图为 WebP

**Files:**
- Create: `public/earth-clouds.webp`

- [ ] **Step 1: 转换云层 alpha 贴图**

```bash
sips -s format webp "/Users/wyh/Downloads/C4D Earth/r/A_c.png" \
  --out /Users/wyh/Desktop/self/public/earth-clouds.webp
```

- [ ] **Step 2: 确认文件存在且大小合理**

```bash
ls -lh /Users/wyh/Desktop/self/public/earth-clouds.webp
```

Expected: 文件存在，大小 < 500KB

- [ ] **Step 3: Commit 贴图资源**

```bash
cd /Users/wyh/Desktop/self
git add public/earth-color.webp public/earth-color-mobile.webp public/earth-clouds.webp
git commit -m "assets: add earth texture maps (WebP) for globe upgrade"
```

---

## Chunk 2: 重写 Globe.tsx

### Task 3: 确认 SSR 安全（只读确认，不改动）

**Files:**
- Read: `components/Hero/index.tsx`

- [ ] **Step 1: 确认 Globe 已用 dynamic ssr:false 加载**

检查 `components/Hero/index.tsx`，确认有：

```tsx
const Globe = dynamic(() => import('./Globe'), { ssr: false })
```

Expected: 该行已存在。若不存在，需在 Hero/index.tsx 中添加。无需修改。

---

### Task 4: 重写 Globe.tsx

**Files:**
- Modify: `components/Hero/Globe.tsx` (全量替换)

- [ ] **Step 1: 确认 TypeScript 基线**

```bash
cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"
```

记录当前错误数作为基线。

- [ ] **Step 2: 重写 Globe.tsx**

用以下内容完整替换 `components/Hero/Globe.tsx`：

```tsx
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

  const colorMap = useLoader(
    TextureLoader,
    isMobile ? `${BASE}/earth-color-mobile.webp` : `${BASE}/earth-color.webp`
  )
  const cloudsMap = useLoader(TextureLoader, `${BASE}/earth-clouds.webp`)

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

  const seg = isMobile ? 12 : 32

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
          specular={new THREE.Color(0x222222)}
        />
      </mesh>

      {/* 云层（A_c.webp 是灰度图，用作 alphaMap） */}
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
      dpr={[1, isMobile ? 1 : 1.5]}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene isMobile={isMobile} />
      </Suspense>
    </Canvas>
  )
}
```

- [ ] **Step 3: 检查 TypeScript**

```bash
cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"
```

Expected: 错误数量不超过基线

- [ ] **Step 4: 本地启动，目视验证效果**

```bash
cd /Users/wyh/Desktop/self && npm run dev
```

在浏览器打开 `http://localhost:3000`，确认：
- 地球显示真实贴图（蓝色海洋 + 绿色大陆）
- 地球缓慢自转
- 云层半透明叠加（若云层不可见/全白，检查 `A_c.webp` 是否为灰度图；可临时改 `opacity={0.8}` 测试）
- 外圈有淡蓝色大气层光晕
- Console 无报错

- [ ] **Step 5: 移动端验证**

在 Chrome DevTools 切换到移动端模拟（375px 宽），确认：
- 地球正常渲染（`isMobile=true` 路径）
- Network 面板中加载的是 `earth-color-mobile.webp`（而非全分辨率版本）

- [ ] **Step 6: Commit**

```bash
git add components/Hero/Globe.tsx
git commit -m "feat: upgrade globe to textured earth with clouds and atmosphere"
```

---

## Chunk 3: 更新技术文档

### Task 5: webgl-performance.mdx 追加贴图优化章节

**Files:**
- Modify: `content/posts/webgl-performance.mdx`

- [ ] **Step 1: 在文档末尾小结表格中追加两行，并新增「优化六」章节**

在 `content/posts/webgl-performance.mdx` 末尾的 `| 省电模式 | ...` 行之后追加两行到已有表格，然后新增完整章节：

```markdown
| 移动端低分辨率贴图 | `sips --resampleWidth 512` + WebP | 减少 ~90% 纹理内存 |
| 懒加载贴图 | `useLoader` + `Suspense` | 贴图未就绪时不渲染，避免白球闪烁 |

---

## 优化六：贴图加载策略

升级为真实地球贴图后，需要额外关注贴图的加载性能。

### 格式与分辨率

原始贴图为 2048×1536 JPEG，直接使用有两个问题：体积较大，以及移动端渲染同等分辨率没有收益。

```bash
# 转换为 WebP 并生成移动端低分辨率版本（512px 宽），体积减少约 90%
sips -s format webp --resampleWidth 512 earth-color.jpg --out earth-color-mobile.webp
```

```tsx
// 根据设备选择贴图
const colorMap = useLoader(
  TextureLoader,
  isMobile ? `${BASE}/earth-color-mobile.webp` : `${BASE}/earth-color.webp`
)
```

### useLoader + Suspense 懒加载

R3F 的 `useLoader` 会在贴图加载完成前挂起组件，配合 `<Suspense fallback={null}>` 让地球在贴图准备好之前静默等待，避免白球闪烁过渡态。

```tsx
<Canvas>
  <Suspense fallback={null}>
    <Scene isMobile={isMobile} />
  </Suspense>
</Canvas>
```

贴图加载是异步的，Hero 区域的其他内容（文字动画、粒子背景）不受影响，地球静默等待贴图就位后再出现。
```

- [ ] **Step 2: 确认文档渲染正常**

```bash
cd /Users/wyh/Desktop/self && npm run dev
```

在浏览器访问 `http://localhost:3000`，点击 blog，找到 "WebGL 动画的性能优化实践" 文章，确认新章节正常渲染，无 Markdown 语法错误。

- [ ] **Step 3: Commit**

```bash
git add content/posts/webgl-performance.mdx
git commit -m "docs: add texture loading optimization section to webgl-performance"
```

---

## 完成检查

- [ ] `public/earth-color.webp` 和 `public/earth-color-mobile.webp` 存在且大小合理
- [ ] `public/earth-clouds.webp` 存在
- [ ] 首页地球显示真实贴图，有云层，有大气层光晕
- [ ] 移动端尺寸（< 640px）下地球正常显示
- [ ] `webgl-performance.mdx` 新增「优化六」章节且渲染正常
- [ ] `npx tsc --noEmit` 错误数不超过基线
