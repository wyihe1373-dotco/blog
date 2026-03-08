'use client'
import { useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'

const projects = [
  {
    title: '长桥证券 · H5 混合开发',
    period: '2024.09 – 2025.09',
    description:
      '负责长桥证券 App 内嵌 H5 核心业务研发，主导基金持仓完整交易链路开发：持仓日报可视化、基金买入下单、跨账户转仓全流程。封装高复用业务组件库，统一 JSBridge 通信与 Token 鉴权，多技术栈（React + TS / Vue2 / Vue3）并行交付。',
    tags: ['React', 'TypeScript', 'Vue3', 'Vue2', 'JSBridge', 'H5'],
    color: '#6366f1',
    gradient: 'bg-primary',
    num: '01',
  },
  {
    title: '招商银行 · 中台项目',
    period: '2022.09 – 2024.08',
    description:
      '面向业务经理的金融理财可视化配置平台。负责项目从零搭建，涵盖菜单路由权限体系、jsplumb 流程图绘制与保存、自定义区域拖拽复制、复杂表单缓存校验等，显著提升团队开发效率。',
    tags: ['Vue2', 'ElementUI', 'ECharts', 'jsplumb', 'Html2canvas'],
    color: '#22d3ee',
    gradient: 'bg-cyan-500',
    num: '02',
  },
  {
    title: '东华重工信息化平台',
    period: '2021.05 – 2021.12',
    description:
      '工厂信息化项目，包含质检流程改造、设备物料管理系统及关键设备数据大屏展示。驻场国企外派，独立负责全链路，配合建模工程师完成工厂 3D 模型展示与交互。',
    tags: ['Vue2', 'Three.js', 'UniApp', 'ECharts', '大屏可视化'],
    color: '#a78bfa',
    gradient: 'bg-purple-500',
    num: '03',
  },
]

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 18}deg) rotateX(${-y * 12}deg) translateZ(20px) scale(1.03)`
    el.style.boxShadow = `0 25px 60px rgba(0,0,0,0.5), 0 0 40px ${project.color}26`
    el.style.setProperty('--card-mx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--card-my', `${(y + 0.5) * 100}%`)
    el.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`)
  }, [project.color])

  const onMouseLeave = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)'
    el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)'
    el.style.setProperty('--card-mx', '50%')
    el.style.setProperty('--card-my', '50%')
    el.style.setProperty('--glare-x', '-100%')
    el.style.setProperty('--glare-y', '50%')
  }, [])

  return (
    <motion.div
      className="shrink-0 w-[calc(100vw-3rem)] sm:w-105 md:w-120"
      variants={{
        hidden: { opacity: 0, y: 32, scale: 0.93 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.65, delay: index * 0.13, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Floating idle animation — each card has a slightly different timing */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3.2 + index * 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.5 + 0.8,
        }}
      >
        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="tilt-card relative rounded-2xl overflow-hidden group cursor-default min-h-70 flex flex-col p-7"
          style={{
            background: 'rgba(7, 7, 24, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          }}
        >
          {/* Colored halo */}
          <div
            className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15 blur-3xl group-hover:opacity-30 transition-opacity duration-500 ${project.gradient}`}
          />

          {/* Glare — follows mouse position */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background:
                'radial-gradient(circle at var(--glare-x, -100%) var(--glare-y, 50%), rgba(255,255,255,0.13) 0%, transparent 55%)',
            }}
          />

          {/* Number watermark */}
          <span className="absolute top-5 right-6 text-6xl font-bold text-white/4 select-none font-mono leading-none">
            {project.num}
          </span>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 shrink-0 ${project.gradient}`} />
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl leading-tight group-hover:text-primary transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-slate-500 text-xs font-mono mt-1">{project.period}</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-4">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/6">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs font-mono text-accent/80 bg-accent/10 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-100px 0px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const rawY = useTransform(scrollYProgress, [0, 1], [30, -30])
  const headerY = useSpring(rawY, { stiffness: 80, damping: 20 })

  return (
    <section id="projects" className="pt-7.5 pb-16 md:pb-24" ref={sectionRef}>
      <motion.div className="px-6 max-w-6xl mx-auto mb-12" style={{ y: headerY }}>
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">PORTFOLIO</p>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">主要项目</h2>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-5 px-6 max-w-6xl mx-auto justify-center"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </motion.div>
    </section>
  )
}
