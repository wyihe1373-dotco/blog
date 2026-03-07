'use client'
import { motion } from 'framer-motion'

interface Project {
  title: string
  period?: string
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

      <div className="flex items-start justify-between mb-2 relative z-10">
        <h3 className="text-white font-semibold text-lg">{project.title}</h3>
        {project.period && (
          <span className="text-xs font-mono text-slate-500 shrink-0 ml-2 mt-1">{project.period}</span>
        )}
      </div>
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
