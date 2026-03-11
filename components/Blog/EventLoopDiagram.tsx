'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'

const STEPS = [
  {
    id: 'sync',
    label: '① 执行同步代码',
    target: 'stack' as const,
    desc: '主线程逐行执行，函数调用依次入栈、出栈。调用栈清空前，任何队列里的任务都不会执行。',
    arrow: null,
  },
  {
    id: 'micro',
    label: '② 清空微任务',
    target: 'micro' as const,
    desc: '调用栈空了，大堂经理优先处理 VIP 窗口——把所有微任务全部跑完，一个不剩，才进行下一步。',
    arrow: 'micro→stack' as const,
  },
  {
    id: 'macro',
    label: '③ 取一个宏任务',
    target: 'macro' as const,
    desc: '微任务清空后，从普通出餐口取出一个宏任务交给主线程执行。注意：每次只取一个，执行完再回到 ②。',
    arrow: 'macro→stack' as const,
  },
  {
    id: 'repeat',
    label: '④ 重复循环',
    target: 'loop' as const,
    desc: '宏任务执行完毕后，再次检查微任务队列……如此往复，永不停止。这就是"事件循环"名字的由来。',
    arrow: null,
  },
]

const MICRO_ITEMS = [
  { label: 'Promise.then', note: '最常见' },
  { label: 'async/await', note: '语法糖' },
  { label: 'queueMicrotask', note: '手动入队' },
  { label: 'MutationObserver', note: 'DOM 变化' },
]

const MACRO_ITEMS = [
  { label: 'setTimeout', note: '延时执行' },
  { label: 'setInterval', note: '定时执行' },
  { label: 'DOM 事件回调', note: '点击/输入' },
  { label: 'fetch 回调', note: '网络请求' },
]

const STACK_ITEMS = [
  { label: 'fn3()', note: '栈顶' },
  { label: 'fn2()', note: '' },
  { label: 'fn1()', note: '' },
  { label: '(global)', note: '栈底' },
]

export default function EventLoopDiagram() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)  // 默认暂停，让用户主动探索

  const next = useCallback(() => setStep(s => (s + 1) % STEPS.length), [])
  const prev = useCallback(() => setStep(s => (s - 1 + STEPS.length) % STEPS.length), [])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(next, 3000)
    return () => clearInterval(timer)
  }, [running, next])

  const active = STEPS[step].target
  const currentStep = STEPS[step]

  return (
    <div className="my-6 rounded-xl border border-white/10 bg-[rgba(10,10,25,0.95)] p-5 select-none">

      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-500">事件循环示意图</span>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setStep(i); setRunning(false) }}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                step === i ? 'bg-white scale-125' : 'bg-white/20 hover:bg-white/40'
              }`}
              title={s.label}
            />
          ))}
        </div>
      </div>

      {/* 三栏 + 箭头 */}

      {/* 移动端：上下排列 + 向下箭头 */}
      <div className="sm:hidden flex flex-col gap-3 mb-1">
        <Panel label="调用栈" sublabel="Call Stack" active={active === 'stack'} color="indigo"
          onClick={() => { setStep(0); setRunning(false) }}>
          {STACK_ITEMS.map((item, i) => (
            <motion.div key={item.label} animate={active === 'stack' ? { backgroundColor: ['rgba(99,102,241,0)', 'rgba(99,102,241,0.15)', 'rgba(99,102,241,0)'] } : {}} transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }} className="flex items-center justify-between text-xs font-mono text-indigo-300 py-1 px-1.5 rounded">
              <span>{item.label}</span>
              {item.note && <span className="text-[10px] text-indigo-600">{item.note}</span>}
            </motion.div>
          ))}
        </Panel>
        <AnimatePresence>
          {active === 'micro' && (
            <div className="flex justify-center pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-px h-4 bg-linear-to-b from-cyan-400 to-cyan-400/30" />
                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-cyan-400" />
              </div>
            </div>
          )}
        </AnimatePresence>
        <Panel label="微任务队列" sublabel="VIP 快取窗口" active={active === 'micro'} color="cyan"
          onClick={() => { setStep(1); setRunning(false) }}>
          {MICRO_ITEMS.map((item, i) => (
            <motion.div key={item.label} animate={active === 'micro' ? { x: [0, 6, 0], backgroundColor: ['rgba(34,211,238,0)', 'rgba(34,211,238,0.12)', 'rgba(34,211,238,0)'] } : { x: 0 }} transition={{ duration: 0.6, delay: i * 0.12 }} className="flex items-center justify-between text-xs font-mono text-cyan-300 py-1 px-1.5 rounded">
              <span>{item.label}</span>
              <span className="text-[10px] text-cyan-700">{item.note}</span>
            </motion.div>
          ))}
        </Panel>
        <AnimatePresence>
          {active === 'macro' && (
            <div className="flex justify-center pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-px h-4 bg-linear-to-b from-violet-400 to-violet-400/30" />
                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-violet-400" />
              </div>
            </div>
          )}
        </AnimatePresence>
        <Panel label="宏任务队列" sublabel="普通出餐窗口" active={active === 'macro'} color="violet"
          onClick={() => { setStep(2); setRunning(false) }}>
          {MACRO_ITEMS.map((item, i) => (
            <motion.div key={item.label} animate={active === 'macro' ? { x: [0, 6, 0], backgroundColor: ['rgba(167,139,250,0)', 'rgba(167,139,250,0.12)', 'rgba(167,139,250,0)'] } : { x: 0 }} transition={{ duration: 0.6, delay: i * 0.12 }} className="flex items-center justify-between text-xs font-mono text-violet-300 py-1 px-1.5 rounded">
              <span>{item.label}</span>
              <span className="text-[10px] text-violet-700">{item.note}</span>
            </motion.div>
          ))}
        </Panel>
      </div>

      {/* 桌面端：三列网格 + 水平箭头 */}
      <div className="hidden sm:grid relative grid-cols-3 gap-3 mb-1">
        <Panel label="调用栈" sublabel="Call Stack" active={active === 'stack'} color="indigo"
          onClick={() => { setStep(0); setRunning(false) }}>
          {STACK_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              animate={active === 'stack' ? {
                backgroundColor: ['rgba(99,102,241,0)', 'rgba(99,102,241,0.15)', 'rgba(99,102,241,0)'],
              } : {}}
              transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
              className="flex items-center justify-between text-xs font-mono text-indigo-300 py-1 px-1.5 rounded"
            >
              <span>{item.label}</span>
              {item.note && <span className="text-[10px] text-indigo-600">{item.note}</span>}
            </motion.div>
          ))}
        </Panel>

        <Panel label="微任务队列" sublabel="VIP 快取窗口" active={active === 'micro'} color="cyan"
          onClick={() => { setStep(1); setRunning(false) }}>
          {MICRO_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              animate={active === 'micro' ? {
                x: [0, 6, 0],
                backgroundColor: ['rgba(34,211,238,0)', 'rgba(34,211,238,0.12)', 'rgba(34,211,238,0)'],
              } : { x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex items-center justify-between text-xs font-mono text-cyan-300 py-1 px-1.5 rounded"
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-cyan-700">{item.note}</span>
            </motion.div>
          ))}
        </Panel>

        <Panel label="宏任务队列" sublabel="普通出餐窗口" active={active === 'macro'} color="violet"
          onClick={() => { setStep(2); setRunning(false) }}>
          {MACRO_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              animate={active === 'macro' ? {
                x: [0, 6, 0],
                backgroundColor: ['rgba(167,139,250,0)', 'rgba(167,139,250,0.12)', 'rgba(167,139,250,0)'],
              } : { x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex items-center justify-between text-xs font-mono text-violet-300 py-1 px-1.5 rounded"
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-violet-700">{item.note}</span>
            </motion.div>
          ))}
        </Panel>

        {/* 箭头：微任务 → 调用栈 */}
        {active === 'micro' && (
          <div className="absolute top-1/2 left-[33.3%] w-[33.3%] -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-linear-to-l from-cyan-400 to-transparent relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-cyan-400" />
            </div>
          </div>
        )}

        {/* 箭头：宏任务 → 调用栈 */}
        {active === 'macro' && (
          <div className="absolute top-1/2 right-0 w-[66.6%] -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-linear-to-l from-violet-400 to-transparent relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-violet-400" />
            </div>
          </div>
        )}
      </div>


      {/* 当前步骤说明 */}
      <div className="mt-4 rounded-lg border border-white/5 bg-white/3 p-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {active === 'loop' ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
                className="inline-block text-base"
              >↻</motion.span>
            ) : (
              <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                active === 'stack' ? 'bg-indigo-500/30 text-indigo-300' :
                active === 'micro' ? 'bg-cyan-500/30 text-cyan-300' :
                'bg-violet-500/30 text-violet-300'
              }`}>
                {step + 1}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-white mb-1">{currentStep.label}</div>
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs text-slate-400 leading-relaxed"
              >
                {currentStep.desc}
                {active === 'loop' && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="ml-2 text-white/50 font-mono"
                  >→ 回到 ①</motion.span>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="text-xs font-mono px-3 py-1.5 rounded-md border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
          >
            ← 上一步
          </button>
          <button
            onClick={next}
            className="text-xs font-mono px-3 py-1.5 rounded-md border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
          >
            下一步 →
          </button>
        </div>
        <button
          onClick={() => setRunning(r => !r)}
          className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
            running
              ? 'border-white/20 text-white bg-white/8 hover:bg-white/12'
              : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
          }`}
        >
          {running ? '⏸ 暂停' : '▶ 自动播放'}
        </button>
      </div>
    </div>
  )
}

function Panel({
  label, sublabel, active, color, children, onClick,
}: {
  label: string
  sublabel: string
  active: boolean
  color: 'indigo' | 'cyan' | 'violet'
  children: React.ReactNode
  onClick?: () => void
}) {
  const styles = {
    indigo: { border: active ? 'border-indigo-500/50' : 'border-white/8', bg: active ? 'bg-indigo-500/6' : 'bg-white/2', label: 'text-indigo-400' },
    cyan:   { border: active ? 'border-cyan-500/50'   : 'border-white/8', bg: active ? 'bg-cyan-500/6'   : 'bg-white/2', label: 'text-cyan-400' },
    violet: { border: active ? 'border-violet-500/50' : 'border-white/8', bg: active ? 'bg-violet-500/6' : 'bg-white/2', label: 'text-violet-400' },
  }[color]

  return (
    <motion.div
      onClick={onClick}
      animate={{ scale: active ? 1.01 : 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border ${styles.border} ${styles.bg} p-3 transition-colors duration-400 cursor-pointer`}
      title={`点击跳到「${label}」步骤`}
    >
      <div className={`text-xs font-semibold ${styles.label} mb-0.5`}>{label}</div>
      <div className="text-[10px] text-slate-600 mb-2">{sublabel}</div>
      <div className="space-y-0">{children}</div>
    </motion.div>
  )
}
