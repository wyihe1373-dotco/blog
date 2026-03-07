'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ProjectCard from './ProjectCard'

const projects = [
  {
    title: '长桥证券 · H5 混合开发',
    period: '2024.09 – 2025.09',
    description:
      '负责长桥证券 App 内嵌 H5 核心业务研发，主导基金持仓完整交易链路开发：持仓日报可视化、基金买入下单、跨账户转仓全流程。封装高复用业务组件库，统一 JSBridge 通信与 Token 鉴权，多技术栈（React + TS / Vue2 / Vue3）并行交付，保障 WebView 下高性能体验。',
    tags: ['React', 'TypeScript', 'Vue3', 'Vue2', 'JSBridge', 'H5'],
    gradient: 'bg-primary',
  },
  {
    title: '资产配置策略平台',
    period: '2022.09 – 2024.08',
    description:
      '面向业务经理的金融理财可视化配置平台。负责项目从零搭建，涵盖菜单路由权限体系、jsplumb 流程图绘制与保存、自定义区域拖拽复制、复杂表单缓存校验等。对核心组件进行二次封装，显著提升团队开发效率。',
    tags: ['Vue2', 'ElementUI', 'ECharts', 'jsplumb', 'Html2canvas'],
    gradient: 'bg-accent',
  },
  {
    title: '东华重工信息化平台',
    period: '2021.05 – 2021.12',
    description:
      '工厂信息化项目，包含质检流程改造、设备物料管理系统及关键设备数据大屏展示。驻场国企外派，独立负责需求收集、方案设计到开发落地全链路，并配合建模工程师完成工厂 3D 模型展示与交互。',
    tags: ['Vue2', 'Three.js', 'UniApp', 'ECharts', '大屏可视化'],
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
        <p className="shimmer-text font-mono text-sm tracking-widest mb-2">PORTFOLIO</p>
        <h2 className="text-4xl font-bold text-white mb-12">Featured Projects</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-4" style={{ gridTemplateRows: 'repeat(2, 220px)' }}>
        {/* Featured: first project takes col-span-2 row-span-2 */}
        <motion.div
          className="col-span-2 row-span-2"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <ProjectCard project={{ ...projects[0], featured: true }} />
        </motion.div>

        {/* Remaining cards */}
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
    </section>
  )
}
