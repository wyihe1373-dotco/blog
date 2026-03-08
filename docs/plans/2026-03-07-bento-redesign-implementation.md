# Bento Grid + Cursor Spotlight 升级实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有深空粒子风格基础上，升级为 Bento Grid 布局 + Cursor Spotlight + Stats 数字卡 + 3D Tilt + CountUp + 导航高亮。

**Architecture:** 不破坏现有 Hero/Blog/Contact 区，仅新增 CursorSpotlight 全局组件，重写 Skills→Stats，升级 Projects 为 Bento 大卡布局，新增 useTilt hook，升级 Navigation。无新依赖（CountUp 手写，Tilt 手写）。

**Tech Stack:** Next.js 14, TypeScript, Framer Motion, Tailwind CSS, React hooks

---

## Task 1: Cursor Spotlight 全局组件

**Files:**
- Create: `components/CursorSpotlight/index.tsx`
- Modify: `app/layout.tsx`

**Step 1: 创建 CursorSpotlight 组件**

```tsx
// components/CursorSpotlight/index.tsx
'use client'
import { useEffect, useRef } from 'react'

export default function CursorSpotlight() {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!divRef.current) return
      divRef.current.style.setProperty('--mx', `${e.clientX}px`)
      divRef.current.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(600px at var(--mx, -999px) var(--my, -999px), rgba(99,102,241,0.07), transparent 80%)',
      }}
    />
  )
}
```

**Step 2: 插入 layout.tsx**

修改 `app/layout.tsx`，在 `<body>` 内第一个子元素位置插入：

```tsx
import CursorSpotlight from '@/components/CursorSpotlight'

// body 内：
<body className="antialiased">
  <CursorSpotlight />
  {children}
</body>
```

**Step 3: 本地验证**

打开 http://localhost:3000，鼠标移动时背景有淡淡的靛蓝光晕跟随。

**Step 4: Commit**

```bash
git add components/CursorSpotlight/index.tsx app/layout.tsx
git commit -m "feat: add cursor spotlight global effect"
```

---

## Task 2: useTilt Hook（卡片 3D 倾斜）

**Files:**
- Create: `lib/useTilt.ts`

**Step 1: 创建 useTilt hook**

```ts
// lib/useTilt.ts
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
```

**Step 2: 在 globals.css 添加卡片 spotlight 样式**

在 `app/globals.css` 追加：

```css
/* Card local spotlight */
.tilt-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    200px at var(--card-mx, 50%) var(--card-my, 50%),
    rgba(255,255,255,0.06),
    transparent 80%
  );
  pointer-events: none;
}
```

**Step 3: Commit**

```bash
git add lib/useTilt.ts app/globals.css
git commit -m "feat: add useTilt hook and card spotlight style"
```

---

## Task 3: Stats Bento 区（替换 Skills）

**Files:**
- Create: `components/Stats/index.tsx`
- Modify: `app/page.tsx`（将 `<Skills />` 替换为 `<Stats />`）
- Modify: `components/Navigation/index.tsx`（导航 Skills → Stats，href 不变）

**Step 1: 创建 Stats 组件**

```tsx
// components/Stats/index.tsx
'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTilt } from '@/lib/useTilt'

const stats = [
  { value: 5,    suffix: ' 年',   label: '前端开发经验',      color: 'from-indigo-500/20 to-indigo-500/5',  border: 'hover:border-indigo-500/50',  span: 'col-span-2' },
  { value: 3,    suffix: '',      label: '主导项目落地',       color: 'from-cyan-500/20 to-cyan-500/5',      border: 'hover:border-cyan-500/50',    span: 'col-span-1' },
  { value: 10,   suffix: '+',     label: '封装业务组件',       color: 'from-purple-500/20 to-purple-500/5',  border: 'hover:border-purple-500/50',  span: 'col-span-1' },
  { value: 60,   suffix: ' fps',  label: 'WebView 优化目标',  color: 'from-amber-500/20 to-amber-500/5',    border: 'hover:border-amber-500/50',   span: 'col-span-1' },
  { value: 4,    suffix: '',      label: '技术方向覆盖',       color: 'from-emerald-500/20 to-emerald-500/5',border: 'hover:border-emerald-500/50', span: 'col-span-1' },
  { value: 5000, suffix: '+',     label: 'Three.js 粒子数',   color: 'from-rose-500/20 to-rose-500/5',      border: 'hover:border-rose-500/50',    span: 'col-span-2' },
]

function StatCard({ stat, delay, isInView }: { stat: typeof stats[0]; delay: number; isInView: boolean }) {
  const [count, setCount] = useState(0)
  const { ref, onMouseMove, onMouseLeave } = useTilt(6)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = stat.value
    const duration = 1500
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    const timer = setTimeout(() => requestAnimationFrame(step), delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, stat.value, delay])

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`tilt-card glass rounded-2xl p-6 relative overflow-hidden cursor-default transition-all duration-300 ${stat.border} ${stat.span}`}
      style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl`} />

      <div className="relative z-10">
        <div className="text-7xl font-bold text-white tracking-tight leading-none mb-2">
          {count}{stat.suffix}
        </div>
        <div className="text-slate-400 text-sm font-mono">{stat.label}</div>
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" className="py-24 px-6 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest mb-2">ABOUT ME</p>
        <h2 className="text-5xl font-bold text-white mb-12 tracking-tight">By the Numbers</h2>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 0.08} isInView={isInView} />
        ))}
      </div>
    </section>
  )
}
```

**Step 2: 更新 app/page.tsx**

```tsx
import Stats from '@/components/Stats'
// 将 <Skills /> 替换为 <Stats />
```

**Step 3: 更新导航标签**（已是 'Skills' href='#skills'，label 改为 'Stats'）

```tsx
// components/Navigation/index.tsx
{ label: 'Stats', href: '#skills' },
```

**Step 4: 验证**

- 滚动到 Stats 区，数字从 0 开始计数动画
- 鼠标悬停卡片有 3D 倾斜 + 局部光晕

**Step 5: Commit**

```bash
git add components/Stats/index.tsx app/page.tsx components/Navigation/index.tsx
git commit -m "feat: replace Skills with Stats Bento grid with CountUp animation"
```

---

## Task 4: Projects Bento Featured Layout

**Files:**
- Modify: `components/Projects/index.tsx`
- Modify: `components/Projects/ProjectCard.tsx`

**Step 1: 更新 ProjectCard，支持 featured 模式**

```tsx
// components/Projects/ProjectCard.tsx
'use client'
import { useTilt } from '@/lib/useTilt'

interface Project {
  title: string
  period?: string
  description: string
  tags: string[]
  github?: string
  demo?: string
  gradient: string
  featured?: boolean
}

export default function ProjectCard({ project }: { project: Project }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5)

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="tilt-card glass rounded-2xl relative overflow-hidden group cursor-default h-full"
      style={{ transition: 'transform 0.2s ease' }}
    >
      {/* Gradient halo */}
      <div
        className={`absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-3xl group-hover:opacity-35 transition-opacity ${project.gradient}`}
      />
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-primary/40 transition-colors" />

      <div className={`relative z-10 ${project.featured ? 'p-8' : 'p-6'} h-full flex flex-col`}>
        {/* Featured: vertical timeline accent */}
        {project.featured && (
          <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-gradient-to-b from-primary via-accent to-transparent rounded-full" />
        )}

        <div className={`flex items-start justify-between mb-3 ${project.featured ? 'pl-4' : ''}`}>
          <h3 className={`text-white font-bold ${project.featured ? 'text-2xl' : 'text-lg'}`}>
            {project.title}
          </h3>
          {project.period && (
            <span className="text-xs font-mono text-slate-500 shrink-0 ml-3 mt-1">{project.period}</span>
          )}
        </div>

        <p className={`text-slate-400 mb-4 flex-1 ${project.featured ? 'text-base pl-4' : 'text-sm'}`}>
          {project.description}
        </p>

        <div className={`flex flex-wrap gap-2 mb-4 ${project.featured ? 'pl-4' : ''}`}>
          {project.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs font-mono text-accent bg-accent/10 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className={`flex gap-3 ${project.featured ? 'pl-4' : ''}`}>
          {project.github && (
            <a href={project.github} className="text-xs text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              GitHub →
            </a>
          )}
          {project.demo && (
            <a href={project.demo} className="text-xs text-accent hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              Live Demo →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: 更新 Projects 布局为 Bento**

```tsx
// components/Projects/index.tsx - 修改 grid 布局部分
<div className="grid grid-cols-3 grid-rows-2 gap-4" style={{ gridAutoRows: '1fr' }}>
  {/* Featured：长桥证券，col-span-2 row-span-2 */}
  <motion.div
    className="col-span-2 row-span-2"
    initial={{ opacity: 0, y: 40 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5 }}
  >
    <ProjectCard project={{ ...projects[0], featured: true }} />
  </motion.div>

  {/* 其余卡片 */}
  {projects.slice(1).map((project, i) => (
    <motion.div
      key={project.title}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
    >
      <ProjectCard project={project} />
    </motion.div>
  ))}
</div>
```

同时将项目数据中第一个加上 `featured: true`，并将 `projects` 数组中的项目描述稍微扩展。

**Step 3: 给容器设置固定高度保证 row-span 生效**

```tsx
// grid 容器样式：
<div className="grid grid-cols-3 gap-4" style={{ gridTemplateRows: 'repeat(2, 200px)' }}>
```

**Step 4: 验证**

- 长桥证券卡片占左侧 2/3，高度两倍
- 右侧两张小卡各占 1/3 高
- 悬停时 3D 倾斜效果生效

**Step 5: Commit**

```bash
git add components/Projects/index.tsx components/Projects/ProjectCard.tsx
git commit -m "feat: upgrade Projects to Bento featured layout with 3D tilt"
```

---

## Task 5: Navigation Active Section 高亮

**Files:**
- Modify: `components/Navigation/index.tsx`

**Step 1: 添加 active section 追踪**

在 `Navigation` 组件中添加：

```tsx
const [activeSection, setActiveSection] = useState('')

useEffect(() => {
  const sections = ['skills', 'projects', 'blog', 'contact']
  const observers = sections.map(id => {
    const el = document.getElementById(id)
    if (!el) return null
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    obs.observe(el)
    return obs
  })
  return () => observers.forEach(obs => obs?.disconnect())
}, [])
```

**Step 2: 更新链接样式**

```tsx
{links.map(link => {
  const sectionId = link.href.slice(1)
  const isActive = activeSection === sectionId
  return (
    <a
      key={link.href}
      href={link.href}
      className="relative text-sm transition-colors duration-200"
      style={{ color: isActive ? '#fff' : '#94a3b8' }}
    >
      {link.label}
      {isActive && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent rounded-full"
          transition={{ type: 'spring', stiffness: 375, damping: 30 }}
        />
      )}
    </a>
  )
})}
```

**Step 3: Commit**

```bash
git add components/Navigation/index.tsx
git commit -m "feat: add active section highlight with animated underline in nav"
```

---

## Task 6: 运行构建验证

**Step 1: 运行 build**

```bash
npm run build
```

Expected: 所有页面正常生成，无 TypeScript 错误，无未使用导入警告。

**Step 2: 本地浏览器验证清单**

- [ ] 鼠标移动时全局光晕跟随
- [ ] Stats 区：滚动进入时数字从 0 开始计数
- [ ] Stats 卡片：鼠标悬停时 3D 倾斜 + 局部光晕
- [ ] Projects：长桥证券大卡占左侧 2/3
- [ ] Projects 卡片：鼠标悬停时 3D 倾斜
- [ ] 导航：滚动到各 section 时对应链接高亮 + 下划线滑动

**Step 3: Final commit if clean**

```bash
git add -A
git commit -m "chore: visual upgrade - Bento grid + cursor spotlight + 3D tilt complete"
```
