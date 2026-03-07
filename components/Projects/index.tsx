'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
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
