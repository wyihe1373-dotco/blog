'use client'

import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'

const STEPS = [
  { id: 'sync',   label: '① 执行同步代码', target: 'stack',    desc: '调用栈逐帧出栈，直到清空' },
  { id: 'micro',  label: '② 清空微任务',   target: 'micro',    desc: 'Promise / async / queueMicrotask 全部跑完' },
  { id: 'macro',  label: '③ 取一个宏任务', target: 'macro',    desc: 'setTimeout / DOM 事件 / 网络回调 各取一个' },
  { id: 'repeat', label: '④ 循环',         target: 'loop',     desc: '回到 ①，继续下一轮' },
]

const MICRO_ITEMS = ['Promise.then', 'async/await', 'queueMicrotask', 'MutationObserver']
const MACRO_ITEMS = ['setTimeout', 'setInterval', 'DOM 事件回调', 'fetch 回调']
const STACK_ITEMS = ['fn3()', 'fn2()', 'fn1()', '(global)']

export default function EventLoopDiagram() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(true)
  const loopCtrl = useAnimationControls()

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setStep(s => (s + 1) % STEPS.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (STEPS[step].target === 'loop') {
      loopCtrl.start({ rotate: [0, 360], transition: { duration: 0.6, ease: 'easeInOut' } })
    }
  }, [step, loopCtrl])

  const active = STEPS[step].target

  return (
    <div
      className="my-6 rounded-xl border border-white/10 bg-[rgba(10,10,25,0.9)] p-5 select-none"
      onClick={() => setRunning(r => !r)}
      title={running ? '点击暂停' : '点击继续'}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-mono text-slate-500">事件循环示意图 · {running ? '运行中' : '已暂停'}</span>
        <span className="text-xs text-slate-600 cursor-pointer hover:text-slate-400 transition-colors">
          {running ? '⏸ 点击暂停' : '▶ 点击继续'}
        </span>
      </div>

      {/* 三栏 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* 调用栈 */}
        <Panel
          label="调用栈"
          sublabel="Call Stack"
          active={active === 'stack'}
          color="indigo"
        >
          {STACK_ITEMS.map((item, i) => (
            <motion.div
              key={item}
              animate={active === 'stack' ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: active === 'stack' ? 1 : 0 }}
              className="text-xs font-mono text-indigo-300 py-0.5"
            >
              {item}
            </motion.div>
          ))}
        </Panel>

        {/* 微任务 */}
        <Panel
          label="微任务队列"
          sublabel="VIP 窗口"
          active={active === 'micro'}
          color="cyan"
        >
          {MICRO_ITEMS.map((item, i) => (
            <motion.div
              key={item}
              animate={active === 'micro' ? { x: [0, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-xs font-mono text-cyan-300 py-0.5"
            >
              {item}
            </motion.div>
          ))}
        </Panel>

        {/* 宏任务 */}
        <Panel
          label="宏任务队列"
          sublabel="普通窗口"
          active={active === 'macro'}
          color="violet"
        >
          {MACRO_ITEMS.map((item, i) => (
            <motion.div
              key={item}
              animate={active === 'macro' ? { x: [0, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-xs font-mono text-violet-300 py-0.5"
            >
              {item}
            </motion.div>
          ))}
        </Panel>
      </div>

      {/* 事件循环指示器 */}
      <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-4 py-3">
        <motion.div
          animate={loopCtrl}
          className="text-lg shrink-0"
        >
          ↻
        </motion.div>
        <div className="min-w-0">
          <div className="flex gap-2 flex-wrap mb-1">
            {STEPS.map((s, i) => (
              <motion.span
                key={s.id}
                animate={{ opacity: step === i ? 1 : 0.3, scale: step === i ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  step === i
                    ? 'border-white/20 text-white bg-white/10'
                    : 'border-white/5 text-slate-600'
                }`}
              >
                {s.label}
              </motion.span>
            ))}
          </div>
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-slate-400"
          >
            {STEPS[step].desc}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

function Panel({
  label,
  sublabel,
  active,
  color,
  children,
}: {
  label: string
  sublabel: string
  active: boolean
  color: 'indigo' | 'cyan' | 'violet'
  children: React.ReactNode
}) {
  const borderColor = {
    indigo: active ? 'border-indigo-500/60' : 'border-white/8',
    cyan:   active ? 'border-cyan-500/60'   : 'border-white/8',
    violet: active ? 'border-violet-500/60' : 'border-white/8',
  }[color]

  const bgColor = {
    indigo: active ? 'bg-indigo-500/8' : 'bg-white/2',
    cyan:   active ? 'bg-cyan-500/8'   : 'bg-white/2',
    violet: active ? 'bg-violet-500/8' : 'bg-white/2',
  }[color]

  const labelColor = {
    indigo: 'text-indigo-400',
    cyan:   'text-cyan-400',
    violet: 'text-violet-400',
  }[color]

  return (
    <motion.div
      animate={{ borderColor: active ? undefined : undefined }}
      className={`rounded-lg border ${borderColor} ${bgColor} p-3 transition-colors duration-300`}
    >
      <div className={`text-xs font-semibold ${labelColor} mb-0.5`}>{label}</div>
      <div className="text-[10px] text-slate-600 mb-2">{sublabel}</div>
      <div className="space-y-0.5">{children}</div>
    </motion.div>
  )
}
