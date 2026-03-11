# Globe 贴图升级设计文档

**日期：** 2026-03-11
**文件：** `components/Hero/Globe.tsx`
**文档：** `content/posts/webgl-performance.mdx`

---

## 背景

当前地球模型为 wireframe 线框球 + 2 个装饰性轨道环，缺乏真实感。改为使用真实地球贴图，并在性能优化的基础上增加大气层光晕和云层效果。

---

## 方案

**方案 A（采用）：贴图 + Phong 光照 + 大气层光晕**

### 层结构

| 层 | 几何体 | 材质 | 说明 |
|----|--------|------|------|
| 地球本体 | `SphereGeometry(1.5)` | `MeshPhongMaterial` + 颜色贴图 | `shininess: 15`，海洋轻微高光 |
| 云层 | `SphereGeometry(1.52)` | `MeshPhongMaterial` + 云层透明贴图 | 旋转速度比地球慢 30% |
| 大气层 | `SphereGeometry(1.58)` | `MeshBasicMaterial` 蓝紫渐变 | `side: BackSide` + `AdditiveBlending` |

### 光照

- `DirectionalLight`（模拟太阳，position `[5, 3, 5]`，intensity `1.2`）
- `AmbientLight`（intensity `0.15`，暗面不全黑）

### 移除

- 原有 2 个轨道环（`TorusGeometry`）
- 原有 wireframe 球体和暗色填充球

---

## 贴图资源

| 贴图 | 来源 | 用途 |
|------|------|------|
| `earth-color.webp` | `r/cd.jpg` 转换 | 地球颜色贴图 |
| `earth-color-mobile.webp` | 低分辨率版本 | 移动端降级 |
| `earth-clouds.webp` | `r/A_c.png` 转换 | 云层透明通道 |

- 原始文件放 `/Users/wyh/Downloads/C4D Earth/r/`
- 转换后放 `public/`
- WebP 格式，压缩优化

---

## 性能优化（延续）

所有已有优化保留：

| 优化 | 实现 |
|------|------|
| 离屏停止渲染 | `IntersectionObserver` |
| Tab 隐藏停止渲染 | `visibilitychange` |
| 移动端降多边形 | `seg = isMobile ? 12 : 32` |
| 移动端锁 DPR | `dpr={[1, isMobile ? 1 : 1.5]}` |
| 自适应 DPR | `performance={{ min: 0.5 }}` |
| 省电模式 | `powerPreference: 'low-power'` |

新增：
- 移动端使用低分辨率贴图（`earth-color-mobile.webp`）
- `useLoader(TextureLoader)` 懒加载，配合 `dynamic({ ssr: false })`

---

## 技术文档更新

`content/posts/webgl-performance.mdx` 末尾新增「优化六：贴图加载策略」，记录：
- WebP 格式选择
- 移动端贴图降分辨率
- `useLoader` + `Suspense` 懒加载模式

---

## 文件改动清单

1. `components/Hero/Globe.tsx` — 重写 Scene 组件
2. `public/earth-color.webp` — 新增贴图
3. `public/earth-color-mobile.webp` — 新增移动端贴图
4. `public/earth-clouds.webp` — 新增云层贴图
5. `content/posts/webgl-performance.mdx` — 追加文档
