'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const skills = [
  {
    category: 'Frontend',
    items: ['React', 'Vue 3', 'Vue 2', 'TypeScript', 'Next.js', 'Vite'],
  },
  {
    category: '3D & 可视化',
    items: ['Three.js', 'WebGL', 'ECharts', 'Canvas 2D', 'Html2canvas'],
  },
  {
    category: '工程化',
    items: ['Webpack', 'Rollup', 'ESLint', 'Vitest', 'Git', 'CI/CD'],
  },
  {
    category: '移动端 & 混合',
    items: ['JSBridge', 'WebView', 'UniApp', 'H5 性能优化', 'Vant'],
  },
]

const experience = [
  {
    company: '长桥证券',
    role: '前端开发工程师',
    period: '2024.09 – 至今',
    desc: '主导基金持仓交易链路 H5 研发，封装高复用业务组件库与 JSBridge 通信层，多技术栈并行交付。',
    tags: ['React', 'TypeScript', 'JSBridge', 'H5'],
  },
  {
    company: '招商银行（驻场）',
    role: '前端开发工程师',
    period: '2022.09 – 2024.08',
    desc: '主导资产配置策略平台从零搭建，实现 jsplumb 流程图、复杂权限路由体系及自定义拖拽复制能力。',
    tags: ['Vue2', 'ECharts', 'jsplumb', 'ElementUI'],
  },
  {
    company: '东华重工（驻场）',
    role: '前端开发工程师',
    period: '2020.07 – 2022.02',
    desc: '独立负责工厂信息化系统全链路，配合建模工程师完成 Three.js 3D 工厂可视化大屏。',
    tags: ['Vue2', 'Three.js', 'UniApp', '大屏可视化'],
  },
]

export default function Skills() {
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
        <h2 className="text-4xl font-bold text-white mb-12">Skills & Experience</h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Skills Grid */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-white font-semibold text-lg mb-6 font-mono">// 技术栈</h3>
          <div className="space-y-5">
            {skills.map((group) => (
              <div key={group.category}>
                <p className="text-slate-500 text-xs font-mono mb-2 uppercase tracking-widest">{group.category}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 glass rounded-md text-sm text-slate-300 font-mono hover:border-accent/50 hover:text-accent transition-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Experience Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-white font-semibold text-lg mb-6 font-mono">// 工作经历</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent" />

            <div className="space-y-8">
              {experience.map((exp, i) => (
                <motion.div
                  key={exp.company}
                  className="pl-10 relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  {/* Dot */}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full glass border border-primary/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>

                  <div className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-white font-semibold">{exp.company}</span>
                      <span className="text-slate-500 text-xs font-mono shrink-0 ml-2">{exp.period}</span>
                    </div>
                    <p className="text-accent text-xs font-mono mb-2">{exp.role}</p>
                    <p className="text-slate-400 text-sm mb-3">{exp.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags.map(tag => (
                        <span key={tag} className="text-xs font-mono text-accent/70 bg-accent/10 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
