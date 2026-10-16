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

## 6. Axios 请求封装

请求文件：`client/src/api/client.ts`

创建统一 Axios 实例，开发环境默认通过 `/api` 代理访问后端，生产环境使用 `VITE_API_BASE_URL`，请求超时时间为 10 秒。

请求拦截器自动读取本地 token 并添加 Bearer 认证；响应拦截器统一返回业务数据，在 401 时清除失效 token，并将后端错误转换为标准 `Error`。

封装支持 GET、POST、PUT、PATCH、DELETE 请求，具体业务请求与类型在开发对应功能时补充。TypeScript 类型检查已通过，接口联调留到功能开发阶段进行。

## 7. 登录与注册

本阶段实现用户认证闭环：注册、登录、登录态持久化。按「类型 → 接口 → 状态 → UI 接入 → 路由守卫 → 页面」的顺序推进。

### 新增依赖

| 包 | 版本 | 用途 |
|---|---|---|
| `naive-ui` | ^2.45.3 | UI 组件库，提供表单、输入框、全局消息提示 |
| `pinia-plugin-persistedstate` | ^4.7.1 | Pinia 持久化插件，登录态刷新后不丢 |
| `unplugin-vue-components` | ^32.1.0 | 组件自动按需引入，naive-ui 组件免手动 import |

```bash
npm install naive-ui pinia-plugin-persistedstate
npm install -D unplugin-vue-components
```

### 用户类型

类型文件：`client/src/types/auth.ts`

定义 `User` 类描述用户信息（id、username、email、nickname、avatar、bio、created_at、updated_at）。用 class 而非 interface，构造函数接收 `Partial<User>` 并 `Object.assign`，方便从接口原始数据快速实例化。严格模式下，后端必返字段用 `!` 断言（声明处不初始化但构造时赋值），可空字段给默认 `null`。

### 认证接口

接口文件：`client/src/api/authService.ts`

基于 §6 的 Axios 实例，封装三个认证请求：

- `register` — POST `auth/register`，传 username / email / password，返回 token + user
- `login` — POST `auth/login`，传 email / password，返回 token + user
- `getUserInfo` — GET `auth/me`，返回当前登录用户

响应类型用泛型标注，与后端 Auth 模块的接口一一对应。

### 登录态管理

Store 文件：`client/src/stores/auth.ts`

用 Pinia 的 setup 写法定义 auth store：

- `user` — 当前用户，未登录为 null
- `setUser` — 登录/注册成功后写入用户，或登出时置空
- `loadUser` — 启动时若本地有 token，调 getUserInfo 拉取最新用户；token 失效则清除 token 并置空 user

开启 `persist: true`，user 自动存入 localStorage，刷新后恢复，登录态不丢。

同时在入口 `client/src/main.ts` 注册 Pinia 并挂上持久化插件：创建 pinia 实例 → `pinia.use(piniaPluginPersistedstate)` → `app.use(pinia)`。

### UI 组件库接入

入口组件：`client/src/App.vue`

naive-ui 的全局消息（`useMessage`）依赖组件树里的 Provider，所以用 `NConfigProvider` + `NMessageProvider` 包住 `RouterView`。通过 `NConfigProvider` 的 `theme-overrides` 把 naive-ui 默认蓝改成项目暖琥珀主色（primaryColor 及 hover / pressed / suppl 四态），与设计 token 保持一致。

naive-ui 组件通过 `unplugin-vue-components` 自动按需引入，模板里直接写 `<n-form>` 等标签，无需手动 import。

### 路由与守卫

路由表：`client/src/router/routers.ts`
守卫：`client/src/router/index.ts`

路由表定义四条：根路径 `/` 重定向到 `/home`，以及 register、login、home 三个页面，各自带 `meta.title`，组件用动态 import 懒加载。

全局前置守卫 `beforeEach` 负责启动态校验与登录拦截：

- 用 `bootstrapped` 标记保证整个 app 生命周期只做一次启动校验
- 无 token：视为未登录，清掉 persist 可能残留的 user，保证两者一致
- 有 token 且本次启动尚未校验：调 `loadUser` 拉取最新用户
- `meta.requiresAuth` 为真但未登录 → 重定向 `/login`

`afterEach` 把 `meta.title` 写进 `document.title`；`scrollBehavior` 在前进/后退时恢复滚动位置。入口 `main.ts` 中 `app.use(router)` 注册路由。

### 登录与注册页面

页面文件：`client/src/views/auth/LoginView.vue`、`client/src/views/auth/RegisterView.vue`

两个页面结构对称，都基于 naive-ui 的 `n-form` + 校验规则（`FormRules`），复用同一套提交流程：表单校验通过 → 调对应接口 → 存 token 到 localStorage → `setUser` 写入状态 → 消息提示 → 跳转 `/home`；失败则 catch 后用 message 提示错误。提交期间用 `loading` 禁用按钮，防止重复提交。

- 登录页：邮箱 + 密码两个字段，邮箱带格式校验，底部链接去注册页
- 注册页：用户名 + 邮箱 + 密码三个字段，左右分栏（左侧品牌介绍 + 卡片装饰，右侧表单），底部链接去登录页

两页共用暖琥珀渐变背景（`.auth-shell`），与整体设计风格统一。

---

*本文档随前端开发进展持续更新。*
