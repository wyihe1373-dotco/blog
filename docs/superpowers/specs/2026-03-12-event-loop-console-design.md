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

---

## 各步骤行为

### ① 执行同步代码（target: stack，颜色: indigo）

代码块有两条活跃行（`console.log('1')` 和 `console.log('2')`），需在步骤内部做逐行动画：

- 进入步骤时，先高亮 `console.log('1')`，console 显示 `1`
- 约 1s 后，高亮移到 `console.log('2')`，console 累加 `2`
- 用组件内 `subLine` state（`0` | `1`）控制，`useEffect` 在步骤激活时延迟切换

`setTimeout` 和 `Promise.resolve().then` 的外层行（注册行）显示为暗灰色（`reg`），回调体行（`console.log('3')` / `console.log('4')`）完全暗掉（`off`），以区分「已注册但未执行」。

### ② 清空微任务（target: micro，颜色: cyan）

高亮 `console.log('3')`（Promise 回调体内）。console 显示 1、2（旧，暗色）+ 3（新，亮色）。

### ③ 取一个宏任务（target: macro，颜色: violet）

高亮 `console.log('4')`（setTimeout 回调体内）。console 显示 1、2、3（旧）+ 4（新）。

### ④ 重复循环（target: loop）

不高亮代码行。替换代码块和 console 块为一个完整汇总面板：

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
type LineTag = 'sync' | 'micro' | 'macro' | ''

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
// 当前步骤显示 ALL_OUTPUTS.slice(0, outputCountByStep[step])
```

---

## 文件范围

仅修改 `components/Blog/EventLoopDiagram.tsx`，不涉及其他文件。
