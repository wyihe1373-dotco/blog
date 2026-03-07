'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { useTilt } from '@/lib/useTilt'

const projects = [
  {
    title: '长桥证券 · H5 混合开发',
    period: '2024.09 – 2025.09',
    description:
      '负责长桥证券 App 内嵌 H5 核心业务研发，主导基金持仓完整交易链路开发：持仓日报可视化、基金买入下单、跨账户转仓全流程。封装高复用业务组件库，统一 JSBridge 通信与 Token 鉴权，多技术栈（React + TS / Vue2 / Vue3）并行交付。',
    tags: ['React', 'TypeScript', 'Vue3', 'Vue2', 'JSBridge', 'H5'],
    gradient: 'bg-primary',
    num: '01',
  },
  {
    title: '资产配置策略平台',
    period: '2022.09 – 2024.08',
    description:
      '面向业务经理的金融理财可视化配置平台。负责项目从零搭建，涵盖菜单路由权限体系、jsplumb 流程图绘制与保存、自定义区域拖拽复制、复杂表单缓存校验等，显著提升团队开发效率。',
    tags: ['Vue2', 'ElementUI', 'ECharts', 'jsplumb', 'Html2canvas'],
    gradient: 'bg-cyan-500',
    num: '02',
  },
  {
    title: '东华重工信息化平台',
    period: '2021.05 – 2021.12',
    description:
      '工厂信息化项目，包含质检流程改造、设备物料管理系统及关键设备数据大屏展示。驻场国企外派，独立负责全链路，配合建模工程师完成工厂 3D 模型展示与交互。',
    tags: ['Vue2', 'Three.js', 'UniApp', 'ECharts', '大屏可视化'],
    gradient: 'bg-purple-500',
    num: '03',
  },
]

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4)

  return (
    <motion.div
      className="shrink-0 w-[calc(100vw-3rem)] sm:w-[420px] md:w-[480px]"
      variants={{
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="tilt-card glass rounded-2xl relative overflow-hidden group cursor-default min-h-70 flex flex-col p-7"
        style={{ transition: 'transform 0.25s ease' }}
      >
        {/* Gradient halo */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15 blur-3xl group-hover:opacity-30 transition-opacity duration-500 ${project.gradient}`} />
        <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-300" />

        {/* Number watermark */}
        <span className="absolute top-5 right-6 text-6xl font-bold text-white/[0.04] select-none font-mono leading-none">
          {project.num}
        </span>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 shrink-0 ${project.gradient}`} />
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl leading-tight group-hover:text-primary transition-colors duration-200">
                {project.title}
              </h3>
              <p className="text-slate-500 text-xs font-mono mt-1">{project.period}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-4">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/[0.06]">
            {project.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs font-mono text-accent/80 bg-accent/10 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [dragLeft, setDragLeft] = useState(-800)
  const inView = useInView(sectionRef, { once: true, margin: '-100px 0px' })

  useEffect(() => {
    const vw = window.innerWidth
    const cardW = vw < 640 ? vw - 48 : vw < 768 ? 420 : 480
    const gap = 20
    const totalW = projects.length * (cardW + gap) - gap
    const overflow = totalW - vw + 48
    setDragLeft(overflow > 0 ? -overflow : 0)
  }, [])

  // GSAP-style scroll progress for header parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const rawY = useTransform(scrollYProgress, [0, 1], [30, -30])
  const headerY = useSpring(rawY, { stiffness: 80, damping: 20 })

  return (
    <section id="projects" className="py-12 md:py-24 overflow-hidden" ref={sectionRef}>
      {/* Header with parallax */}
      <motion.div className="px-6 max-w-6xl mx-auto mb-12" style={{ y: headerY }}>
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">PORTFOLIO</p>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">主要项目</h2>
        </div>
      </motion.div>

      {/* Horizontal drag track */}
      <motion.div
        ref={trackRef}
        className="flex gap-5 px-6 cursor-grab active:cursor-grabbing select-none flex-wrap justify-center  "
        drag="x"
        dragConstraints={{ right: 0, left: dragLeft }}
        dragElastic={0.08}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        whileTap={{ cursor: 'grabbing' }}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}

        {/* End spacer */}
        <div className="shrink-0 w-6" />
      </motion.div>
    </section>
  )
}
