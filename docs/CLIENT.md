# DevMind 前端开发文档

## 1. 初始化

```bash
npm create vite@latest client -- --template vue-ts
cd client
volta pin node@22
```

脚手架：`create-vite@9.0.7`；Vite：`^8.0.12`；Vue：`^3.5.34`；TypeScript：`~6.0.2`；Node：`22.22.2`（通过 Volta pin 锁定在 client 目录）。
## 2. 已安装依赖

### 脚手架自带（devDependencies）

| 包 | 版本 | 用途 |
|---|---|---|
| `vite` | ^8.0.12 | 构建工具 + 开发服务器 + HMR |
| `vue` | ^3.5.34 | UI 框架（dependencies） |
| `typescript` | ~6.0.2 | 类型系统 |
| `@vitejs/plugin-vue` | ^6.0.6 | Vite 的 Vue 插件 |
| `@vue/tsconfig` | ^0.9.1 | Vue 的 tsconfig 预设 |
| `@types/node` | ^24.12.3 | Node.js 类型定义 |
| `vue-tsc` | ^3.2.8 | Vue 文件类型检查 |

### 后续安装（dependencies）

| 包 | 版本 | 用途 |
|---|---|---|
| `tailwindcss` | ^4.3.3 | 原子化 CSS 框架 |
| `@tailwindcss/vite` | ^4.3.3 | Tailwind 4 Vite 插件 |
| `vue-router` | ^4.6.4 | 路由 |
| `pinia` | ^4.0.3 | 状态管理 |
| `axios` | ^1.20.0 | HTTP 客户端 |

```bash
npm install tailwindcss @tailwindcss/vite
npm install vue-router pinia axios
```

Markdown 编辑器和图表库暂未安装，留待后续阶段引入。

## 3. Vite 配置

配置文件：`client/vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
```

`tailwindcss()` 是 Tailwind 4 的 Vite 集成方式，不需要 `postcss.config.js`。
`/api` 代理转发到后端 3000 端口，开发时无需处理 CORS；生产环境改用 `VITE_API_BASE_URL`。

## 4. 样式与设计 token

样式文件：`client/src/style.css`

设计 token 已从 `docs/mockups/tokens.css` 迁移到 Tailwind 4 的 `@theme` 块；Tailwind 4 使用 CSS-first 配置，项目中没有 `tailwind.config.js`。
token 名称需带有 `--color-` / `--font-` 前缀以生成工具类，例如 `--color-ink-900` → `text-ink-900`。

| 分组 | token | 值 |
|---|---|---|
| 背景 | `--color-bg` / `--color-card` / `--color-soft` / `--color-softer` | `#faf7f2` / `#ffffff` / `#f5f0e8` / `#fbf8f3` |
| 文字灰阶 | `--color-ink-900` / `--color-ink-700` / `--color-ink-500` / `--color-ink-400` / `--color-ink-300` | `#1c1917` / `#44403c` / `#78716c` / `#a8a29e` / `#d6d3d1` |
| 描边 | `--color-line` / `--color-line-soft` | `#e7e5e4` / `#f1eee8` |
| 品牌色 | `--color-brand` / `--color-brand-deep` / `--color-brand-hover` / `--color-brand-soft` | `#b45309` / `#78350f` / `#92400e` / `#fef3c7` |
| 语义色 | `--color-ok` / `--color-ok-soft` / `--color-warn` / `--color-warn-soft` / `--color-bad` / `--color-bad-soft` / `--color-info` / `--color-info-soft` | `#15803d` / `#dcfce7` / `#ca8a04` / `#fef9c3` / `#b91c1c` / `#fee2e2` / `#0369a1` / `#e0f2fe` |

字体 token：`--font-sans`（Inter + CJK fallback）→ `font-sans`；`--font-serif`（Instrument Serif + Noto Serif SC）→ `font-serif`；`--font-mono`（JetBrains Mono）→ `font-mono`。

`tokens.css` 的 `.card`、`.chip`、`.tape`、`.masonry`、`.code-snippet` 组件类暂未迁移。

## 5. 目录结构

`client/src` 当前目录骨架如下：

```text
src/
├── api/          # axios 实例 + 按模块拆分的 API 文件
├── assets/       # 静态资源
├── components/   # 复用组件
├── router/       # 路由表
├── stores/       # Pinia store
├── views/        # 页面级组件
├── App.vue
├── main.ts
└── style.css
```

新建`api/`、`router/`、`stores/`、`views/` 为空目录，Vite 模板遗留文件已移除。

---

*本文档随前端开发进展持续更新。*
