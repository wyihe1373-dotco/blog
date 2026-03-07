# Bento Grid + Cursor Spotlight 视觉升级设计文档

**Date:** 2026-03-07
**Project:** self
**Status:** Approved

---

## 概述

在现有深空粒子 + glassmorphism 基础上，升级为 Bento Grid 布局 + Cursor Spotlight 交互 + Stats 数字卡片 + 多层动效。不替换现有深空背景，而是在其上叠加更丰富的交互层次和布局密度。

---

## 改动范围

### 1. 全局：Cursor Spotlight（新增）

**组件：** `components/CursorSpotlight/index.tsx`

- 在 `app/layout.tsx` 中插入，覆盖全页
- 用 `mousemove` 事件追踪鼠标位置，动态更新 CSS 变量 `--mx`、`--my`
- 一个 `position: fixed; pointer-events: none` 的全屏 div，背景：
  ```css
  radial-gradient(600px at var(--mx) var(--my), rgba(99,102,241,0.07), transparent 80%)
  ```
- 卡片内部也有局部 spotlight：使用 `onMouseMove` 计算相对坐标，更新卡片内部 radial-gradient

---

### 2. Skills 区 → Stats Bento（重写）

**组件：** `components/Stats/index.tsx`（重命名替换原 Skills）

**Bento 网格布局（6 卡）：**

```
┌─────────────┬──────┬──────┐
│  5 年经验    │ 3 大 │ 10+  │
│  col-span-2 │ 项目 │ 组件 │
├──────┬──────┴──────┤      │
│ 4 个 │   TypeScript│      │
│ 方向 │   重度用户   │      │
└──────┴─────────────┴──────┘
```

每张卡：
- 数字 `text-7xl font-bold`，CountUp 动画（滚动进入时从 0 计数到目标值）
- 卡片各自独立渐变色调（indigo / cyan / purple / emerald）
- Hover：Y 轴 -6px lift + 边框渐变亮度提升
- 底部小字说明标签（`font-mono text-xs`）

**数据：**
| 数字 | 说明 | 颜色 |
|------|------|------|
| 5 | 年前端开发经验 | indigo |
| 3 | 主导项目落地 | cyan |
| 10+ | 封装业务组件 | purple |
| 4 | 技术方向 React/Vue/3D/H5 | emerald |
| 60 | fps WebView 性能优化目标 | amber |
| 5000+ | Three.js 粒子数 | slate |

---

### 3. Projects 区 → Bento Featured Layout（重构）

**组件：** `components/Projects/index.tsx`（修改布局）

```
┌───────────────────────┬───────┐
│  长桥证券               │ 资产  │
│  col-span-2, row-span-2│ 配置  │
│  大卡：完整描述+时间线  ├───────┤
│                        │ 东华  │
│                        │ 重工  │
└───────────────────────┴───────┘
```

- 大卡增加：描述段落、竖线时间轴装饰、GitHub 链接
- 小卡保持原样但调整 padding 比例
- Grid 容器：`grid-cols-3 grid-rows-2`，大卡 `col-span-2 row-span-2`

---

### 4. 卡片 3D Tilt 效果（全局升级）

**工具函数：** `lib/useTilt.ts`

```ts
// 鼠标在卡片内的相对位置 → rotateX / rotateY
// 离开时 reset 到 0
```

- 应用范围：Stats 卡、Projects 卡、Blog 卡
- 参数：`maxRotation: 8` 度，`perspective: 1000px`
- 配合 `transition: transform 0.3s ease` 平滑复位

---

### 5. Stats CountUp 动画

**依赖：** `npm install react-countup`（或手写 requestAnimationFrame 版本）

- 滚动进入时（`useInView`）触发从 0 到目标值的计数
- easing: `easeOutCubic`，duration: `1.5s`
- 只触发一次（`once: true`）

---

### 6. 导航：Active Section 高亮

**组件：** `components/Navigation/index.tsx`（修改）

- `IntersectionObserver` 监听各 section，当前可见 section 的导航链接：
  - 文字变为 `text-white`（原为 `text-slate-300`）
  - 下方出现 2px 宽渐变下划线（indigo → cyan），`scaleX` 动画进入

---

## 不改动范围

- Hero 区（Three.js 粒子 + Typewriter）保持不变
- Blog 区布局保持不变（样式微调即可）
- Contact 区保持不变
- MDX 博客文章内容

---

## 技术注意事项

1. Cursor spotlight div 必须 `pointer-events: none` 否则阻断点击
2. 卡片 3D tilt 与 Framer Motion `whileHover` 不能同时用 `transform`，需选其一或合并
3. CountUp 动画需要在 `useInView` 触发后才启动，避免页面加载时立即跑完
4. `grid-rows-2` 需要显式设置容器高度或子元素高度，否则大卡不生效

---

## Approved

设计已确认，2026-03-07。
