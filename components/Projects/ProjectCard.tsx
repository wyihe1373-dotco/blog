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
          <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-linear-to-b from-primary via-accent to-transparent rounded-full" />
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
