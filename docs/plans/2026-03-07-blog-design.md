# Personal Tech Blog Homepage — Design Document

**Date:** 2026-03-07
**Project:** self
**Status:** Approved

---

## Overview

A personal frontend tech blog homepage with a futuristic / immersive 3D aesthetic. Built with Next.js 14 + Three.js. Single-page scroll with four sections: Hero, Projects, Blog, Contact.

Target audience: recruiters, fellow developers, and blog readers.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| 3D / WebGL | Three.js |
| Scroll Animation | GSAP + ScrollTrigger |
| Component Animation | Framer Motion |
| Styling | Tailwind CSS |
| Blog Content | MDX |

---

## Visual Design

### Color Palette

| Role | Value |
|------|-------|
| Background | `#050510` (deep cosmic black) |
| Primary | `#6366f1` (indigo) |
| Accent | `#22d3ee` (cyan) |
| Text | `#e2e8f0` |
| Glass card | `rgba(255,255,255,0.05)` + `backdrop-blur` |

### Design Language
- Glassmorphism cards with gradient light halos
- Neon glow borders and buttons
- Deep space particle background
- Smooth scroll-triggered entrance animations

---

## Page Sections

### 1. Hero
- **Background:** Three.js canvas — 5000+ particles forming a nebula, slow rotation
- **Mouse interaction:** Particle parallax offset on mouse move
- **Content:** Name, title (typewriter effect cycling through roles), CTA buttons (View Projects / Read Blog)
- **Bottom:** Breathing scroll-down arrow

### 2. Projects
- 3–6 project cards in a responsive grid
- **Card design:** Glassmorphism + top colorful gradient halo
- **Hover state:** Y-axis -8px lift + 3D tilt 5° + border glow
- **Card content:** Project name, tech tags, short description, GitHub + Demo links

### 3. Blog List
- Latest 3 articles from MDX files
- Scroll-triggered fade-in + slide-up animation
- Each post shows: title, date, tags, reading time estimate

### 4. Contact
- Email, GitHub, and social links
- Glowing CTA buttons
- Subtle background grid pattern

---

## Navigation

- Fixed top navbar
- Transparent on Hero, glassmorphism after scroll
- Scroll progress bar: thin line at top, indigo gradient

---

## Performance Strategy

- Three.js canvas lazy-loaded
- Mobile fallback: CSS animated gradient background (no WebGL)
- All images via Next.js `<Image>` with optimization
- GSAP animations only trigger when element enters viewport

---

## Project Structure

```
self/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── blog/
│       └── [slug]/page.tsx
├── components/
│   ├── Hero/
│   │   ├── index.tsx
│   │   └── ParticleCanvas.tsx
│   ├── Projects/
│   ├── Blog/
│   ├── Contact/
│   └── Navigation/
├── content/
│   └── posts/          # MDX blog files
├── lib/
│   └── posts.ts        # MDX utilities
└── docs/
    └── plans/
```

---

## Approved

Design reviewed and approved on 2026-03-07.
