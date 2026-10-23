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
├── layouts/      # 布局外壳
├── router/       # 路由表 routers.ts + 实例与守卫 index.ts
├── stores/       # Pinia store
├── types/        # 跨模块复用类型
├── utils/        # 工具
├── views/        # 页面级组件
├── App.vue
├── main.ts
└── style.css
```

新建`api/`、`router/`、`stores/`、`views/` 为空目录，Vite 模板遗留文件已移除。

## 6. Axios 请求封装

请求文件：`client/src/api/index.ts`

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

## 8. 公共布局与页头页脚

本阶段搭建登录后的应用外壳，并把「搜索」做成跨页共享的上下文。

### 布局外壳

布局文件：`client/src/layouts/DefaultLayout.vue`

`DefaultLayout` 作为需要登录态的页面骨架：纵向 flex 容器，依次是 `AppHeader`、`RouterView`、`AppFooter`，footer 用 `mt-auto` 吸底。`RouterView` 绑定 `:key="$route.fullPath"`，路由变化（含 query）时强制重建页面组件，避免同名路由复用导致的状态残留。

布局在此 `provide("search", search)` 一个搜索上下文对象：`{ keyword, nonce }`，两者都是 ref。`keyword` 存已提交的关键词；`nonce` 是一个每次回车递增的计数器——用它解决「相同关键词再次回车不触发重新请求」的问题（watch 关键词值不变就不会触发，改为 watch nonce 则每次必变）。页头负责写入，首页 / 个人主页负责注入消费。

### 页头

组件文件：`client/src/components/AppHeader.vue`

sticky 吸顶、磨砂半透明背景。左侧是 Logo（书本 SVG + 衬线体 DevMind 字标）。中部按路由上下文切换：在有卡片列表的页面（`home` / `workspace` / `profile`）显示圆角可清除的搜索框（placeholder 为「搜索标题或内容...」，回车时把关键词写进注入的 `search` 上下文并自增 nonce）；其余页面（如详情、仪表盘）显示带图标的标题胶囊横幅。路由路径变化时清空搜索框，保持各页面搜索作用域隔离。

导航用 naive-ui 的 `n-menu`（`mode="horizontal"`），菜单项为首页 / 工作台 / 仪表盘；高亮 key 由当前路径前缀匹配算出。右侧按登录态渲染：已登录显示用户头像（`n-dropdown` 悬停触发，菜单含「个人主页」「退出」，无头像时取用户名前两字母作占位底）；未登录显示「登录」按钮跳登录页。

### 页脚

组件文件：`client/src/components/AppFooter.vue`

紧凑单行页脚（`py-4`、暖米色 `#f8f4ed` 底、顶部描边），居中展示「Made with 🤎 by DevMind · 记录即创造」。

## 9. 首页信息流

首页是社区卡片的公开浏览流：类型筛选 + 排序 + 搜索 + 分页，卡片带点赞 / 收藏互动。

### 新增依赖

| 包 | 版本 | 用途 |
|---|---|---|
| `dayjs` | ^1.11.23 | 相对时间（`fromNow()`），配中文 locale |
| `remove-markdown` | ^0.7.1 | 把卡片正文 Markdown 转纯文本，生成列表摘要 |
| `@vicons/ionicons5` | ^0.13.0 | 图标集（页头搜索 / 横幅图标等） |

```bash
npm install dayjs remove-markdown @vicons/ionicons5
```

`dayjs` 在 `client/src/utils/dayjs.ts` 里全局配置一次：扩展 `relativeTime` 插件、设 `zh-cn` locale，导出实例供全站复用。

### 卡片数据类型与接口

类型文件：`client/src/types/home.ts`

定义 `CardType`（note / question / bug / til）、`CardSort`（newest / most_liked）、列表查询参数 `CardListParams`（page、limit、type、sort、keyword、tag、visibility、user_id），以及卡片实体 `Card` 类（含标题、正文、类型、难度、标签、作者信息、点赞 / 收藏数与当前用户是否已赞 / 已藏等字段，同样用 class + `Partial` 构造）。

接口文件：`client/src/api/homeService.ts`、`client/src/api/socialService.ts`

- `getCardList` — GET `cards`，按 `CardListParams` 查列表，返回 `cards` + 分页信息（total、page、limit、total_pages）
- `likeCard` / `unlikeCard` — POST / DELETE `cards/:id/like`
- `favoriteCard` / `unfavoriteCard` — POST / DELETE `cards/:id/favorite`

### 卡片类型配置（单一数据源）

配置文件：`client/src/components/card/constants.ts`

`CARD_TYPES` 把四种类型的展示信息收敛到一处：`value`（接口英文标识）、`label`（带 emoji 的展示文字，如「📝 笔记」）、`name`（中文名，用于拼结果数文案）、`classes`（徽章配色）。`DIFFICULTY_MAP` 把难度 easy / medium / hard 映射为简单 / 中等 / 困难（仅面试题徽章显示）。筛选栏、徽章均从这里取数据，避免多处硬编码。

### 社区卡片组件

组件文件：`client/src/components/card/HomeCard.vue`

首页、个人主页（公开 + 收藏）等社区浏览场景共用的卡片。顶部是旋转的便签徽章，显示类型 `label`，面试题额外拼接「· 难度」，配色取自 `CARD_TYPES`。标题为唯一跳详情入口（`RouterLink` 到 `/card/:id`）。正文经 `remove-markdown` 转纯文本并截断约 80 字作摘要——所以卡片只有纯文本，不含代码块 / 引用 / 列表等富内容。其下是标签 chip 行，底部是作者信息（头像或首字母占位 + 用户名 + 相对时间）与点赞 / 收藏按钮。

点赞 / 收藏用本地 ref 做乐观更新：点击先翻转状态与计数、再发请求，失败则回滚并提示；未登录时提示「请先登录」。组件注释特别说明：此卡片含社区互动。

### 首页视图

页面文件：`client/src/views/home/HomeView.vue`

顶部 Hero（单行衬线标题 + 副标题 + 便签插画），下方是 sticky 筛选栏：类型 tab 由「全部」拼接 `CARD_TYPES` 生成，激活态为品牌琥珀底白字；右侧显示结果数文案（「共 X 篇记录 / 篇笔记」随当前类型变化）与排序下拉（最新 / 最热）。卡片区用 CSS `columns` 瀑布流（按屏宽 1 / 2 / 3 列），每项 `break-inside-avoid`；底部是 naive-ui 的 `n-pagination`（带每页条数选择器与快速跳页）。

筛选 / 排序 / 每页条数 / 搜索 nonce 变化时统一回到第 1 页，并通过「只重置 page、由 page 的 watch 统一发请求」避免双请求；关键词从注入的 `search` 上下文读取。加载中与空结果各有占位态。

## 10. 个人主页

展示某个用户的公开资料、标签云与卡片；收藏 tab 仅本人可见。

### 资料类型与接口

类型文件：`client/src/types/profile.ts`

`ProfileUser` 类描述公开资料：id、username、nickname、avatar、bio、created_at、updated_at（class + `Partial` 构造，可空字段默认 `null`）。

接口文件：`client/src/api/profileService.ts`

- `getUserPublicInfo` — GET `users/:id`，取用户公开资料
- `getUserFavorites` — GET `users/:id/favorites`，取用户收藏的卡片（复用 `CardListParams` 与分页返回结构）

公开卡片列表复用首页的 `getCardList`，传 `user_id` + `visibility: "public"`。

### 个人主页视图

页面文件：`client/src/views/profile/ProfileView.vue`

顶部是琥珀渐变封面（圆角下沿 + 4 个低透明度装饰 emoji），下方资料卡探出封面：80px 圆形头像（品牌→深品牌渐变，无图时取用户名前两字母），衬线体用户名；昵称与用户名不同时在括号内以更小更浅的字补充（如「张三（阿三）」）。简介行展示真实 bio；若为本人且未填写，则显示「还没有填写个人简介。去工作台完善」并提供跳工作台的按钮。再往下是加入时间（如「2024 年 5 月加入」）与单一统计块（大数字 + 「张公开卡片」）。

标签云标题为「知识标签云」、副标题「大者，热爱所聚；小者，好奇所栖」；标签由当前 tab 卡片的 `tags` 聚合计数后，按占最大频次的比例分 5 档字号（xl / l / m / s / xs），pill 形、brand-soft 底、不可点击（`cursor-default`），每个标签尾部带小号等宽字体计数。

`n-tabs` 两个 tab：「公开卡片 (N)」与「收藏的卡片 (N)」，后者用 `isCurrentUser`（登录用户 id === 资料 id）判断，仅本人可见；切换 tab 时按需拉取对应列表。卡片区是响应式栅格（中屏 2 列、大屏 3 列，非瀑布流），复用 `HomeCard`。资料与公开卡片在 `onMounted` 加载，本人额外预拉收藏；搜索上下文的 nonce 变化时重拉当前 tab 列表。

---

*本文档随前端开发进展持续更新。*
