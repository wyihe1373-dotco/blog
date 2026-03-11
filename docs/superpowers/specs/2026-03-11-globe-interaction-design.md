# Globe 交互升级设计文档

**日期：** 2026-03-11
**文件：** `components/Hero/Globe.tsx`

---

## 背景

现有地球模型为静态自转（Earth + Clouds 差速自动旋转），无任何用户交互。升级目标：支持拖拽手动旋转 + 预设城市标记点击展示。

---

## 功能一：拖拽旋转

### 交互逻辑

| 状态 | 行为 |
|------|------|
| 鼠标悬停地球 | 光标变 `grab` |
| 按下拖拽 | 光标变 `grabbing`，暂停自动旋转 |
| 拖拽中 | `deltaX * 0.005` 作用于 earthRef 和 cloudsRef 的 `rotation.y`，保持差速比例（clouds = earth × 0.667） |
| 松开 | 1.5s 后恢复自动旋转 |

### 实现方式

- Earth mesh 的 `onPointerDown` 记录起始 clientX
- `useEffect` 在 `window` 注册 `pointermove` / `pointerup`（防止鼠标移出 canvas 丢失事件）
- 通过 `dragging` ref 控制 useFrame 中的自动旋转逻辑
- `resumeTimer` ref 存储恢复自转的 setTimeout id，每次新拖拽时清除旧 timer

---

## 功能二：城市标记

### 数据

```ts
const LOCATIONS = [
  { name: '杭州', label: '目前所在', lat: 30.25, lon: 120.15 },
  { name: '南阳', label: '家乡', lat: 33.00, lon: 112.53 },
]
```

### 坐标转换

```ts
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}
```

### 结构

标记作为 **Earth mesh 的子节点**（`<mesh>` 内嵌套），位置 `latLonToVec3(lat, lon, 1.52)`（略高于地表）。子节点自动跟随地球旋转，无需额外计算。

### Marker 组件视觉

| 层 | 实现 | 样式 |
|----|------|------|
| 发光点 | `SphereGeometry(0.04)` + `MeshBasicMaterial` | 白色，激活时 `#6366f1` |
| 脉冲圈 | `RingGeometry` + `MeshBasicMaterial` | scale 1→2.5，opacity 1→0，3s 循环 |
| 信息卡 | drei `Html` | 半透明黑底，见下方 |

脉冲圈需朝向相机：`rotation.x = -Math.PI / 2` + 在 useFrame 中 `ring.lookAt(camera.position)`，或使用 `Billboard` 组件。

### 信息卡 UI

```
  ● ──────────────────
    ┌─────────────────┐
    │ 杭州            │  white font-mono text-sm font-semibold
    │ 目前所在        │  slate-400 text-xs
    └─────────────────┘
```

- 背景：`rgba(7,7,24,0.85)`，border `rgba(99,102,241,0.4)` 1px，`border-radius: 8px`
- padding：`8px 12px`
- 连接线：小三角指向标记点（CSS border trick）
- drei `Html` props：`occlude={[earthRef]}`（背面自动隐藏），`distanceFactor` 不设

### 交互状态

| 状态 | 发光点 | 脉冲圈 | 信息卡 |
|------|--------|--------|--------|
| 默认 | 白色 opacity 0.7 | 显示，白色 | 隐藏 |
| hover | 白色 opacity 1，scale 1.2 | 停止 | 隐藏 |
| 激活（点击） | `#6366f1`，scale 1.4 | 停止 | 显示 |

- `activeLocation` state（string | null）控制激活哪个标记
- 点击标记：`onPointerDown` 阻止冒泡（不触发拖拽），toggle activeLocation
- 点击地球非标记区域：清除 activeLocation

---

## 性能影响

- 新增 2 个小球 mesh + 2 个 ring mesh（极小，可忽略）
- drei `Html` 使用 DOM overlay，不增加 WebGL draw call
- 脉冲动画在 useFrame 中计算，与现有循环合并

---

## 文件改动

1. `components/Hero/Globe.tsx` — 修改（在现有基础上扩展）

无新文件，无新依赖（`@react-three/drei` 已在 package.json）。
