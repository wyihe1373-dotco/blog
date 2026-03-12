# EventLoopDiagram：console 输出可视化设计

**日期：** 2026-03-12
**文件：** `components/Blog/EventLoopDiagram.tsx`

---

## 目标

在事件循环示意图的每一步中，展示当前阶段执行的代码行和对应的 console 输出，让用户能直观看到 JS 执行顺序——尤其是第一步（同步代码）中 `console.log('1')` 和 `console.log('2')` 的先后顺序。最后一步（④）汇总全部输出，附来源标注。

---

## 示例代码（固定）

所有步骤共用同一段代码示例：

```js
console.log('1')
setTimeout(() => {
  console.log('4')
}, 0)
Promise.resolve().then(() => {
  console.log('3')
})
console.log('2')
```

---

## 布局变更

在现有三个面板（调用栈 / 微任务队列 / 宏任务队列）下方，新增一行两列区域：

- **左列**：代码块——展示上方示例代码，当前执行的行用颜色高亮 + `▶` 指针
- **右列**：console 输出块——展示当前步骤结束时累计的输出，格式见下

其余布局（面板、描述卡片、控制栏）不变。

**移动端处理（CRITICAL）**：现有组件对三个面板有移动端（`sm:hidden`）和桌面端（`hidden sm:grid`）两份 JSX。新增的代码/console 区域**不做重复**，统一使用响应式 grid：
- 桌面（`sm:` 及以上）：两列并排（`grid-cols-2`）
- 移动：单列堆叠（代码块在上，console 在下）
- 通过 `grid-cols-1 sm:grid-cols-2` 实现，一份 JSX 覆盖两端。

---

## 各步骤行为

### ① 执行同步代码（target: stack，颜色: indigo）

代码块有两条活跃行（`console.log('1')` 和 `console.log('2')`），需在步骤内部做逐行动画：

- 进入步骤时，先高亮 `console.log('1')`，console 显示 `1`
- 约 1s 后，高亮移到 `console.log('2')`，console 累加 `2`
- 用组件内 `subLine` state（`0` | `1`）控制，`useEffect` 在步骤激活时延迟切换
- **timer 清理（CRITICAL）**：`useEffect` 依赖 `[step]`，仅当 `step === 0` 时才启动 1s timer；cleanup 函数必须调用 `clearTimeout` 取消待执行的 timer。当 `step !== 0` 时，同一个 effect 负责将 `subLine` 重置为 `0`，防止用户跳步时残留高亮状态。参考现有 auto-play 的 `clearInterval` 模式。

**1s 延迟需小于 auto-play 间隔（3000ms）**，确保自动播放时 subLine 动画能在步骤切换前完成。

`setTimeout` 和 `Promise.resolve().then` 的外层行（注册行）显示为暗灰色（`reg`），回调体行（`console.log('3')` / `console.log('4')`）完全暗掉（`off`），以区分「已注册但未执行」。

### ② 清空微任务（target: micro，颜色: cyan）

高亮 `console.log('3')`（Promise 回调体内）。console 显示 1、2（旧，暗色）+ 3（新，亮色）。

### ③ 取一个宏任务（target: macro，颜色: violet）

高亮 `console.log('4')`（setTimeout 回调体内）。console 显示 1、2、3（旧）+ 4（新）。

### ④ 重复循环（target: loop）

不高亮代码行。代码/console 两列区域被一个全宽汇总面板**替换**（`col-span-2`），使用 `AnimatePresence` + `motion.div`（`key={step}`）实现淡入淡出，与现有描述卡片的动画方式一致。汇总面板格式：

```
1  执行了 console.log('1')   [① 同步]
↓
2  执行了 console.log('2')   [① 同步]
↓
3  执行了 console.log('3')   [② 微任务]
↓
4  执行了 console.log('4')   [③ 宏任务]
```

每行带颜色标签（indigo / cyan / violet）。

---

## console 输出格式

每一行格式：`[输出值]  执行了 [方法调用]`

- 当前步骤新产生的输出：颜色明亮（对应步骤颜色）
- 之前步骤的旧输出：暗色（`text-slate-700` 或更暗）

---

## 代码行颜色规则

| 状态 | 样式 | 说明 |
|------|------|------|
| `active` | 步骤主色 + 背景淡色 + `▶` 前缀 | 当前正在执行的行 |
| `reg` | `text-slate-700` | 已执行但非 console 行（注册行） |
| `off` | `text-slate-800`（几乎不可见）| 该步骤无关的行 |

---

## 数据结构变更

### 新增

```ts
// 每行代码的标注
type LineTag = 'sync' | 'micro' | 'macro' | 'loop' | ''

const CODE_LINES: { text: string; tag: LineTag; isCallback: boolean }[]

// subLine state：仅 sync 步骤使用，控制活跃行在 log('1') 和 log('2') 之间切换
const [subLine, setSubLine] = useState(0)
```

### STEPS 扩展

每个 step 增加 `activeTag: LineTag`，用于过滤 `CODE_LINES` 中需要高亮的行。

### 累计输出计算

```ts
const ALL_OUTPUTS = [
  { value: '1', method: "log('1')", stepIdx: 0 },
  { value: '2', method: "log('2')", stepIdx: 0 },
  { value: '3', method: "log('3')", stepIdx: 1 },
  { value: '4', method: "log('4')", stepIdx: 2 },
]

// 每步累计显示的输出数量：[step0=2, step1=3, step2=4, step3=4]
const OUTPUT_COUNT_BY_STEP = [2, 3, 4, 4]

// 渲染时：ALL_OUTPUTS.slice(0, OUTPUT_COUNT_BY_STEP[step])
// isNew 判断：index >= OUTPUT_COUNT_BY_STEP[step - 1] ?? 0
```

### 代码行显示状态算法

每行有 `tag`（属于哪个步骤）和 `isCallback`（是否为回调体内的行）。根据当前 `step` 和 `subLine` 计算显示状态：

```
function getLineState(line, step, subLine):
  activeTag = STEPS[step].activeTag   // 'sync'|'micro'|'macro'|'loop'

  if activeTag === 'loop':
    return 'off'   // 步骤④不高亮任何行

  if line.tag === activeTag:
    if activeTag === 'sync':
      // sync 步骤有两条活跃行，用 subLine 区分
      if line.text === "console.log('1')" and subLine === 0: return 'active'
      if line.text === "console.log('2')" and subLine === 1: return 'active'
      return 'off'
    else:
      // micro/macro 步骤只有一条活跃行（回调体内的 log）
      return 'active'

  if line.isCallback:
    return 'off'   // 非当前步骤的回调体，完全隐去

  return 'reg'     // 注册行或已执行的外层代码，暗灰色
```

### `LineTag` 类型说明

`type LineTag = 'sync' | 'micro' | 'macro' | 'loop' | ''`

- `''`：仅用于 `CODE_LINES` 中没有对应步骤的行（如 `}, 0)` 闭合行）
- `'loop'`：步骤④专用，`activeTag` 为 `'loop'` 时不高亮任何代码行

---

## 文件范围

仅修改 `components/Blog/EventLoopDiagram.tsx`，不涉及其他文件。
