# EventLoopDiagram Console Visualization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在事件循环示意图每一步展示当前执行的代码行（逐行高亮动画）和累计 console 输出，第四步汇总完整执行顺序。

**Architecture:** 在 `EventLoopDiagram.tsx` 中新增 `CODE_LINES` / `ALL_OUTPUTS` 常量，向 `STEPS` 添加 `activeTag` 字段，新增 `subLine` state（控制步骤①的逐行动画），并在三面板下方插入代码块 + console 输出块（响应式两列）。步骤④以全宽汇总面板替代。

**Tech Stack:** React, framer-motion, Tailwind CSS, TypeScript

---

## Chunk 1: 数据层 + subLine 动画逻辑

### Task 1: 扩展 STEPS 数据，新增 CODE_LINES 和 ALL_OUTPUTS 常量

**Files:**
- Modify: `components/Blog/EventLoopDiagram.tsx:6-35`

- [ ] **Step 1: 在文件顶部新增 `LineTag` 类型和 `CODE_LINES` 常量**

  在 `'use client'` 和现有 `const STEPS` 之间插入：

  ```ts
  type LineTag = 'sync' | 'micro' | 'macro' | 'loop' | ''

  const CODE_LINES: { text: string; tag: LineTag; isCallback: boolean }[] = [
    { text: "console.log('1')",               tag: 'sync',  isCallback: false },
    { text: "setTimeout(() => {",             tag: '',      isCallback: false },
    { text: "  console.log('4')",             tag: 'macro', isCallback: true  },
    { text: "}, 0)",                          tag: '',      isCallback: false },
    { text: "Promise.resolve().then(() => {", tag: '',      isCallback: false },
    { text: "  console.log('3')",             tag: 'micro', isCallback: true  },
    { text: "})",                             tag: '',      isCallback: false },
    { text: "console.log('2')",               tag: 'sync',  isCallback: false },
  ]

  const ALL_OUTPUTS: { value: string; method: string; stepIdx: number }[] = [
    { value: '1', method: "console.log('1')", stepIdx: 0 },
    { value: '2', method: "console.log('2')", stepIdx: 0 },
    { value: '3', method: "console.log('3')", stepIdx: 1 },
    { value: '4', method: "console.log('4')", stepIdx: 2 },
  ]

  // 每步骤累计显示的输出条数
  const OUTPUT_COUNT_BY_STEP = [2, 3, 4, 4]
  ```

- [ ] **Step 2: 给 STEPS 每项添加 `activeTag` 字段**

  将 `STEPS` 数组中每个对象补充 `activeTag`：

  ```ts
  const STEPS = [
    {
      id: 'sync',
      label: '① 执行同步代码',
      target: 'stack' as const,
      desc: '主线程逐行执行，函数调用依次入栈、出栈。调用栈清空前，任何队列里的任务都不会执行。',
      arrow: null,
      activeTag: 'sync' as LineTag,
    },
    {
      id: 'micro',
      label: '② 清空微任务',
      target: 'micro' as const,
      desc: '调用栈空了，大堂经理优先处理 VIP 窗口——把所有微任务全部跑完，一个不剩，才进行下一步。',
      arrow: 'micro→stack' as const,
      activeTag: 'micro' as LineTag,
    },
    {
      id: 'macro',
      label: '③ 取一个宏任务',
      target: 'macro' as const,
      desc: '微任务清空后，从普通出餐口取出一个宏任务交给主线程执行。注意：每次只取一个，执行完再回到 ②。',
      arrow: 'macro→stack' as const,
      activeTag: 'macro' as LineTag,
    },
    {
      id: 'repeat',
      label: '④ 重复循环',
      target: 'loop' as const,
      desc: '宏任务执行完毕后，再次检查微任务队列……如此往复，永不停止。这就是"事件循环"名字的由来。',
      arrow: null,
      activeTag: 'loop' as LineTag,
    },
  ]
  ```

- [ ] **Step 3: 在 `EventLoopDiagram` 函数体内添加 `subLine` state 和 useEffect**

  在现有 auto-play `useEffect`（含 `setInterval` 的那个）之后添加：

  ```ts
  const [subLine, setSubLine] = useState(0)

  // 步骤①内逐行动画：先高亮 log('1')，1s 后移到 log('2')
  // 步骤切走时清理 timer，重置 subLine
  useEffect(() => {
    if (step !== 0) {
      setSubLine(0)
      return
    }
    const timer = setTimeout(() => setSubLine(1), 1000)
    return () => clearTimeout(timer)
  }, [step])
  ```

- [ ] **Step 4: 添加 `getLineState` 辅助函数**

  在 `EventLoopDiagram` 函数体内（`return` 之前）添加：

  ```ts
  function getLineState(line: typeof CODE_LINES[number]): 'active' | 'reg' | 'off' {
    const activeTag = STEPS[step].activeTag
    if (activeTag === 'loop') return 'off'
    if (line.tag === activeTag) {
      if (activeTag === 'sync') {
        if (line.text === "console.log('1')" && subLine === 0) return 'active'
        if (line.text === "console.log('2')" && subLine === 1) return 'active'
        return 'off'
      }
      return 'active'
    }
    if (line.isCallback) return 'off'
    return 'reg'
  }
  ```

- [ ] **Step 5: 确认 TypeScript 无报错**

  ```bash
  cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep "EventLoopDiagram"
  ```

  预期：无输出（无错误）

- [ ] **Step 6: Commit**

  ```bash
  git add components/Blog/EventLoopDiagram.tsx
  git commit -m "feat: add CODE_LINES, ALL_OUTPUTS, subLine state to EventLoopDiagram"
  ```

---

## Chunk 2: 代码块 + Console 输出 UI

### Task 2: 在三面板下方插入代码块和 console 输出块

**Files:**
- Modify: `components/Blog/EventLoopDiagram.tsx`（JSX 部分）

- [ ] **Step 1: 在移动端面板（`sm:hidden` div）闭合标签 `</div>` 之后插入代码/console 区域**

  定位：移动端面板区域结尾（`</div>` 在第 125 行附近）和桌面端面板区域开始（`hidden sm:grid` div）之间，插入以下响应式两列区域：

  ```tsx
  {/* 代码示例 + Console 输出（响应式，不重复） */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
    <AnimatePresence mode="wait">
      {active === 'loop' ? (
        /* 步骤④：全宽汇总面板 */
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="sm:col-span-2 rounded-lg border border-white/5 bg-black/30 p-3"
        >
          <div className="text-[10px] text-slate-600 font-mono mb-3">// 完整执行顺序</div>
          <div className="space-y-1">
            {ALL_OUTPUTS.map((out, i) => {
              const colors = ['text-indigo-400', 'text-indigo-400', 'text-cyan-400', 'text-violet-400']
              const bgs    = ['bg-indigo-500/10', 'bg-indigo-500/10', 'bg-cyan-500/10', 'bg-violet-500/10']
              const tags   = ['① 同步', '① 同步', '② 微任务', '③ 宏任务']
              const tagColors = ['text-indigo-500', 'text-indigo-500', 'text-cyan-600', 'text-violet-600']
              return (
                <div key={i}>
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.06 }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${bgs[i]}`}
                  >
                    <span className={`text-sm font-bold font-mono ${colors[i]}`}>{out.value}</span>
                    <span className="text-[10px] text-slate-600 font-mono flex-1">执行了 {out.method}</span>
                    <span className={`text-[9px] font-mono ${tagColors[i]}`}>{tags[i]}</span>
                  </motion.div>
                  {i < ALL_OUTPUTS.length - 1 && (
                    <div className="text-[10px] text-slate-800 font-mono ml-3">↓</div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      ) : (
        /* 步骤①②③：代码块 + console 输出（用真实 DOM 节点包裹，framer-motion 需要可见盒子） */
        <motion.div
          key="code-console"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* 代码块 */}
          <div className="rounded-lg border border-white/5 bg-black/30 p-3">
            <div className="text-[10px] text-slate-600 font-mono mb-2">// 示例代码</div>
            <div className="space-y-0">
              {CODE_LINES.map((line, i) => {
                const state = getLineState(line)
                const activeColors: Record<string, string> = {
                  sync:  'text-indigo-300 bg-indigo-500/12 font-semibold',
                  micro: 'text-cyan-300 bg-cyan-500/10 font-semibold',
                  macro: 'text-violet-300 bg-violet-500/10 font-semibold',
                }
                const currentTag = STEPS[step].activeTag as string
                const activeColor = activeColors[currentTag] ?? ''
                return (
                  <div
                    key={i}
                    className={`text-[10px] font-mono leading-6 px-1 rounded whitespace-pre transition-colors duration-200 ${
                      state === 'active' ? activeColor
                      : state === 'reg'  ? 'text-slate-700'
                      : 'text-slate-800'
                    }`}
                  >
                    {state === 'active' ? `▶ ${line.text}` : `  ${line.text}`}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Console 输出块 */}
          <div className="rounded-lg border border-white/5 bg-black/30 p-3">
            <div className="text-[10px] text-slate-600 font-mono mb-2">// console 输出</div>
            <div className="space-y-1">
              {ALL_OUTPUTS.slice(0, OUTPUT_COUNT_BY_STEP[step]).map((out, i) => {
                const prevCount = step > 0 ? OUTPUT_COUNT_BY_STEP[step - 1] : 0
                const isNew = i >= prevCount
                const newColors = ['text-indigo-400', 'text-indigo-400', 'text-cyan-400', 'text-violet-400']
                return (
                  <motion.div
                    key={`${step}-${i}`}
                    initial={isNew ? { opacity: 0, x: -6 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: isNew ? 0.05 : 0 }}
                    className={`text-[10px] font-mono flex items-baseline gap-1.5 ${
                      isNew ? newColors[i] : 'text-slate-700'
                    }`}
                  >
                    <span className="text-slate-800">{'>'}</span>
                    <span className={`text-xs font-bold ${isNew ? newColors[i] : 'text-slate-800'}`}>{out.value}</span>
                    <span className={isNew ? 'text-slate-500' : 'text-slate-800'}>执行了 {out.method}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  ```

  **插入位置：** 在 `{/* 桌面端：三列网格 */}` 注释之前，`sm:hidden` 面板的闭合 `</div>` 之后。通过内容锚点定位，不依赖行号（Chunk 1 插入常量后行号会偏移）。

- [ ] **Step 2: 确认 dev server 能正常编译**

  ```bash
  cd /Users/wyh/Desktop/self && npm run dev 2>&1 | head -20
  ```

  预期：`✓ Compiled` 或 `ready`，无 TypeScript 错误。

- [ ] **Step 3: 确认 TypeScript 无报错**

  ```bash
  cd /Users/wyh/Desktop/self && npx tsc --noEmit 2>&1 | grep "EventLoopDiagram"
  ```

  预期：无输出

- [ ] **Step 4: Commit**

  ```bash
  git add components/Blog/EventLoopDiagram.tsx
  git commit -m "feat: add code block and console output panel to EventLoopDiagram"
  ```

---

## Chunk 3: 视觉验证 + 收尾

### Task 3: 手动验证交互行为

**Files:** 无代码修改，仅验证

- [ ] **Step 1: 打开博客文章页面，确认四步效果**

  访问包含 `<EventLoopDiagram />` 的博客文章（`/blog/nodejs-intro`）。

  检查清单：
  - [ ] 步骤①：`console.log('1')` 高亮，console 显示 `1 执行了 console.log('1')`；约 1s 后高亮移到 `console.log('2')`，console 新增第二行
  - [ ] 步骤②：`console.log('3')` 高亮（Promise 回调体内），console 第三行亮色显示 `3 执行了 ...`，前两行暗色
  - [ ] 步骤③：`console.log('4')` 高亮，console 第四行新增
  - [ ] 步骤④：代码块和 console 块消失，汇总面板出现，四行带颜色和来源标签
  - [ ] 快速点击上一步/下一步，高亮不残留（subLine 正确重置）
  - [ ] 自动播放模式下，步骤①能看到两次高亮切换（先 `log('1')` 高亮，约 1s 后移到 `log('2')`），再自动跳入步骤②

- [ ] **Step 2: 移动端检查（浏览器 DevTools 模拟）**

  将浏览器宽度缩到 375px，确认：
  - [ ] 代码块和 console 输出块单列堆叠（上下排列）
  - [ ] 步骤④汇总面板全宽显示，不截断

- [ ] **Step 3: Final commit**

  ```bash
  git add -A
  git commit -m "feat: EventLoopDiagram step-by-step console visualization complete"
  ```
