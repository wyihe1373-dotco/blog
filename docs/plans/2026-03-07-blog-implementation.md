# Personal Tech Blog Homepage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a futuristic personal frontend tech blog homepage with Three.js particle Hero, glassmorphism project cards, MDX blog, and contact section.

**Architecture:** Next.js 14 App Router single-page scroll site. Three.js renders a 5000-particle nebula in the Hero canvas. GSAP ScrollTrigger drives section entrance animations. Framer Motion handles component-level interactions.

**Tech Stack:** Next.js 14, TypeScript, Three.js, GSAP + ScrollTrigger, Framer Motion, Tailwind CSS, MDX (@next/mdx)

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `/Users/wyh/Desktop/self/` (project root)

**Step 1: Init project**

```bash
cd /Users/wyh/Desktop/self
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

Expected: Project files created, `npm run dev` starts on localhost:3000

**Step 2: Install dependencies**

```bash
npm install three @types/three gsap @gsap/react framer-motion @next/mdx @mdx-js/react gray-matter reading-time
```

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: "Ready on http://localhost:3000" in terminal

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 project with dependencies"
```

---

## Task 2: Global Styles & Tailwind Config

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Step 1: Update tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050510',
        primary: '#6366f1',
        accent: '#22d3ee',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 2: Update app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: 'Inter', sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #050510;
  color: #e2e8f0;
  overflow-x: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #050510; }
::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }

/* Glass card utility */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Step 3: Update app/layout.tsx with fonts**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Your Name — Frontend Engineer',
  description: 'Personal tech blog and portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "style: add global styles, tailwind config, and fonts"
```

---

## Task 3: Navigation Component

**Files:**
- Create: `components/Navigation/index.tsx`

**Step 1: Create Navigation component**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const links = [
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/10' : ''
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-mono text-primary font-bold text-lg tracking-wider">
          &lt;YN /&gt;
        </a>
        <div className="flex gap-8">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 hover:text-accent transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
```

**Step 2: Add scroll progress bar to Navigation**

Replace the return in Navigation with:

```tsx
return (
  <>
    {/* Scroll progress bar */}
    <motion.div
      className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-primary to-accent z-[60]"
      style={{ scaleX: 0, transformOrigin: '0%' }}
      id="progress-bar"
    />
    <motion.nav ...>
      {/* existing nav content */}
    </motion.nav>
  </>
)
```

Add scroll progress logic in useEffect:

```tsx
useEffect(() => {
  const onScroll = () => {
    setScrolled(window.scrollY > 50)
    const bar = document.getElementById('progress-bar')
    if (bar) {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      bar.style.transform = `scaleX(${progress})`
    }
  }
  window.addEventListener('scroll', onScroll)
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Navigation with glassmorphism scroll effect and progress bar"
```

---

## Task 4: Three.js Particle Canvas (Hero Background)

**Files:**
- Create: `components/Hero/ParticleCanvas.tsx`

**Step 1: Create ParticleCanvas component**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 3

    // Particles
    const count = 5000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      // Mix indigo and cyan
      const t = Math.random()
      colors[i * 3] = 0.38 + t * (0.13 - 0.38)
      colors[i * 3 + 1] = 0.4 + t * (0.83 - 0.4)
      colors[i * 3 + 2] = 0.94 + t * (0.93 - 0.94)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      points.rotation.y += 0.0003
      points.rotation.x += 0.0001
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Three.js particle nebula canvas"
```

---

## Task 5: Hero Section

**Files:**
- Create: `components/Hero/index.tsx`
- Create: `components/Hero/Typewriter.tsx`

**Step 1: Create Typewriter component**

```tsx
'use client'
import { useEffect, useState } from 'react'

const roles = ['Frontend Engineer', 'UI Crafter', 'React Developer', 'Web Performance Nerd']

export default function Typewriter() {
  const [display, setDisplay] = useState('')
  const [roleIdx, setRoleIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing')

  useEffect(() => {
    const target = roles[roleIdx]
    const timeout = setTimeout(() => {
      if (phase === 'typing') {
        if (display.length < target.length) {
          setDisplay(target.slice(0, display.length + 1))
        } else {
          setTimeout(() => setPhase('deleting'), 2000)
        }
      } else {
        if (display.length > 0) {
          setDisplay(display.slice(0, -1))
        } else {
          setRoleIdx((i) => (i + 1) % roles.length)
          setPhase('typing')
        }
      }
    }, phase === 'typing' ? 80 : 40)
    return () => clearTimeout(timeout)
  }, [display, phase, roleIdx])

  return (
    <span className="text-accent font-mono">
      {display}
      <span className="animate-pulse">|</span>
    </span>
  )
}
```

**Step 2: Create Hero section**

```tsx
'use client'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Typewriter from './Typewriter'

const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), { ssr: false })

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <ParticleCanvas />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 text-center px-6">
        <motion.p
          className="text-accent font-mono text-sm tracking-widest mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          HELLO, I&apos;M
        </motion.p>

        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Your Name
        </motion.h1>

        <motion.div
          className="text-xl md:text-2xl text-slate-300 mb-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Typewriter />
        </motion.div>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="#projects"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            View Projects
          </a>
          <a
            href="#blog"
            className="px-6 py-3 glass text-white rounded-lg font-medium hover:border-accent/50 transition-all"
          >
            Read Blog
          </a>
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Hero section with typewriter and particle background"
```

---

## Task 6: Projects Section

**Files:**
- Create: `components/Projects/index.tsx`
- Create: `components/Projects/ProjectCard.tsx`

**Step 1: Create ProjectCard component**

```tsx
'use client'
import { motion } from 'framer-motion'

interface Project {
  title: string
  description: string
  tags: string[]
  github?: string
  demo?: string
  gradient: string
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      className="glass rounded-xl p-6 relative overflow-hidden group cursor-pointer"
      whileHover={{ y: -8, rotateX: 5, rotateY: 5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Gradient halo */}
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity ${project.gradient}`}
      />

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-primary/50 transition-colors" />

      <h3 className="text-white font-semibold text-lg mb-2 relative z-10">{project.title}</h3>
      <p className="text-slate-400 text-sm mb-4 relative z-10">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {project.tags.map(tag => (
          <span key={tag} className="px-2 py-1 text-xs font-mono text-accent bg-accent/10 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-3 relative z-10">
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
    </motion.div>
  )
}
```

**Step 2: Create Projects section**

```tsx
'use client'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { motion } from 'framer-motion'
import ProjectCard from './ProjectCard'

const projects = [
  {
    title: 'Project Alpha',
    description: 'A high-performance React dashboard with real-time data visualization.',
    tags: ['React', 'TypeScript', 'WebSocket', 'D3.js'],
    github: 'https://github.com',
    demo: 'https://example.com',
    gradient: 'bg-primary',
  },
  {
    title: 'Project Beta',
    description: 'Full-stack app with Next.js and serverless backend.',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'Vercel'],
    github: 'https://github.com',
    gradient: 'bg-accent',
  },
  {
    title: 'Project Gamma',
    description: 'Design system with 40+ accessible components.',
    tags: ['React', 'Storybook', 'Radix UI', 'CSS-in-JS'],
    demo: 'https://example.com',
    gradient: 'bg-purple-500',
  },
]

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest mb-2">PORTFOLIO</p>
        <h2 className="text-4xl font-bold text-white mb-12">Featured Projects</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Projects section with 3D glassmorphism cards"
```

---

## Task 7: MDX Blog Setup & Blog Section

**Files:**
- Modify: `next.config.ts`
- Create: `lib/posts.ts`
- Create: `content/posts/hello-world.mdx`
- Create: `components/Blog/index.tsx`

**Step 1: Configure MDX in next.config.ts**

```ts
import createMDX from '@next/mdx'

const withMDX = createMDX({})

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

export default withMDX(nextConfig)
```

**Step 2: Create lib/posts.ts**

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDir = path.join(process.cwd(), 'content/posts')

export interface PostMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  readingTime: string
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir)
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(file => {
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8')
      const { data, content } = matter(raw)
      return {
        slug: file.replace('.mdx', ''),
        title: data.title,
        date: data.date,
        tags: data.tags ?? [],
        description: data.description ?? '',
        readingTime: readingTime(content).text,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
```

**Step 3: Create sample post content/posts/hello-world.mdx**

```mdx
---
title: "Hello World — Building This Blog"
date: "2026-03-07"
tags: ["Next.js", "Three.js", "Frontend"]
description: "How I built this blog with Next.js 14, Three.js particles, and glassmorphism design."
---

# Hello World

This is my first post...
```

**Step 4: Create Blog section component**

```tsx
import { getAllPosts } from '@/lib/posts'
import { motion } from 'framer-motion'

// Note: This is a Server Component - no 'use client'
export default function Blog() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <section id="blog" className="py-24 px-6 max-w-6xl mx-auto">
      <p className="text-accent font-mono text-sm tracking-widest mb-2">WRITING</p>
      <h2 className="text-4xl font-bold text-white mb-12">Latest Posts</h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block glass rounded-xl p-6 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{post.description}</p>
                <div className="flex gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 shrink-0 ml-4">
                <div>{post.date}</div>
                <div>{post.readingTime}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add MDX blog setup and Blog section"
```

---

## Task 8: Contact Section

**Files:**
- Create: `components/Contact/index.tsx`

**Step 1: Create Contact component**

```tsx
'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const links = [
  { label: 'GitHub', href: 'https://github.com/yourusername', icon: 'GH' },
  { label: 'Twitter', href: 'https://twitter.com/yourusername', icon: 'TW' },
  { label: 'Email', href: 'mailto:you@example.com', icon: '@' },
]

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="contact" className="py-24 px-6 text-center" ref={ref}>
      {/* Grid background */}
      <div
        className="absolute left-0 right-0 h-full opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        className="relative z-10 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest mb-2">GET IN TOUCH</p>
        <h2 className="text-4xl font-bold text-white mb-4">Let&apos;s Work Together</h2>
        <p className="text-slate-400 mb-10">
          Open to frontend engineering roles, freelance projects, and interesting collaborations.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 glass rounded-lg text-white font-medium hover:border-accent/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-slate-600 text-sm mt-16 font-mono">
          Built with Next.js + Three.js — {new Date().getFullYear()}
        </p>
      </motion.div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Contact section"
```

---

## Task 9: Wire Everything Together

**Files:**
- Modify: `app/page.tsx`
- Create: `app/blog/[slug]/page.tsx`

**Step 1: Update app/page.tsx**

```tsx
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Projects from '@/components/Projects'
import Blog from '@/components/Blog'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <Projects />
      <Blog />
      <Contact />
    </main>
  )
}
```

**Step 2: Create blog post page app/blog/[slug]/page.tsx**

```tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const file = fs.readFileSync(
    path.join(process.cwd(), 'content/posts', `${params.slug}.mdx`),
    'utf-8'
  )
  const { data, content } = matter(file)

  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-white mb-4">{data.title}</h1>
      <p className="text-slate-500 font-mono text-sm mb-12">{data.date}</p>
      <article className="prose prose-invert prose-indigo max-w-none">
        <MDXRemote source={content} />
      </article>
    </main>
  )
}
```

Note: Install `next-mdx-remote` if using MDXRemote:
```bash
npm install next-mdx-remote
```

**Step 3: Verify full page renders**

```bash
npm run dev
```

Open http://localhost:3000 — should see Hero with particles, Projects, Blog, Contact sections.

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: wire all sections into main page and add blog post route"
```

---

## Task 10: Polish & Mobile Responsiveness

**Files:**
- Review all components for mobile breakpoints

**Step 1: Verify responsive layout**

Check on mobile viewport (375px width in DevTools):
- Hero: text sizes scale down (`text-5xl` → `text-3xl` on small screens)
- Projects: grid collapses to 1 column on mobile
- Three.js canvas: on mobile (`window.innerWidth < 768`), skip canvas, use CSS gradient:

In `ParticleCanvas.tsx`, add mobile check:

```tsx
useEffect(() => {
  if (window.innerWidth < 768) return  // Skip WebGL on mobile
  // ... rest of Three.js setup
}, [])
```

For mobile Hero background, add to globals.css:
```css
@media (max-width: 768px) {
  .hero-bg {
    background: radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, #050510 70%);
  }
}
```

**Step 2: Run build to catch any errors**

```bash
npm run build
```

Expected: Build completes with no errors.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: mobile responsiveness and performance polish"
```

---

## Running Locally

```bash
cd /Users/wyh/Desktop/self
npm run dev
# Open http://localhost:3000
```
