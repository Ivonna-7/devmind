# DevLog — 开发者知识卡片平台 · 项目规划文档

> 本文档是 DevLog 项目的唯一权威参考。任何人（或 AI）读完后，应能完整理解项目范围、已做的决策、数据库设计、API 设计、前端页面规划，以及接下来要做什么。

---

## 目录

1. [项目背景与目标](#1-项目背景与目标)
2. [技术栈选型](#2-技术栈选型)
3. [核心概念：知识卡片](#3-核心概念知识卡片)
4. [数据库设计](#4-数据库设计)
5. [后端 API 设计](#5-后端-api-设计)
6. [前端页面设计](#6-前端页面设计)
7. [UI/UX 设计要点](#7-uiux-设计要点)
8. [间隔复习逻辑](#8-间隔复习逻辑)
9. [项目目录结构](#9-项目目录结构)
10. [三周开发计划](#10-三周开发计划)
11. [部署方案](#11-部署方案)
12. [开发原则](#12-开发原则)
13. [当前进度](#13-当前进度)

---

## 1. 项目背景与目标

### 1.1 开发者背景

- 工作中使用 Vue 2 + TypeScript，有一定前端工程经验
- 零后端/数据库经验，正在利用下班时间（约 10h/周）学习全栈
- Node.js（Express）阶段是练手和建立基础认知，后续目标是 Go 或 Python
- 练习项目的前端采用现代栈（Vue 3 + Vite + Pinia），也同时熟悉新技术

### 1.2 项目定位

DevLog 不是一个"用来练手就扔掉"的玩具项目，而是一个**可以放进作品集、能真正使用的产品**。

**核心一句话：** 开发者知识卡片平台，随手记、发布分享、间隔复习。

### 1.3 为什么不做博客或 Todo？

| 常见练手项目 | 问题 |
|---|---|
| 博客系统 | 太多同类，没有区分度 |
| Todo App | 过于简单，无法展示全栈能力 |
| 电商系统 | 太复杂，3 周内无法完成 |

DevLog 的优势：
- **差异化**：知识卡片 + 间隔复习，真实解决开发者的痛点
- **复杂度适中**：4 个后端模块，5 个前端页面，3 周可完成
- **实用性强**：开发过程中本身就可以用它来记录笔记
- **展示亮点多**：JWT 认证、多表关联、统计图表、Markdown 渲染、暗色主题

---

## 2. 技术栈选型

### 2.1 后端

| 技术 | 版本要求 | 说明 |
|---|---|---|
| Node.js | >= 18 | 运行时环境 |
| Express | ^4.x | Web 框架，轻量、文档全 |
| TypeScript | ^5.x | 类型安全，与工作技术栈对齐 |
| PostgreSQL | >= 14 | 关系型数据库，适合复杂查询 |
| `pg` / `node-postgres` | ^8.x | PostgreSQL 客户端 |
| bcrypt | ^5.x | 密码哈希 |
| jsonwebtoken | ^9.x | JWT 签发与验证 |
| zod | ^3.x | 请求参数校验 |
| cors | ^2.x | 跨域处理 |
| dotenv | ^16.x | 环境变量管理 |

**不使用 ORM 的原因：** 直接写 SQL 能更好地学习数据库基础。Prisma/TypeORM 虽然方便，但会屏蔽 JOIN、聚合等核心概念，不适合零基础学习阶段。

### 2.2 前端

| 技术 | 版本要求 | 说明 |
|---|---|---|
| Vue 3 | ^3.4 | Composition API，与工作栈互补 |
| Vite | ^5.x | 构建工具，开发体验极佳 |
| Pinia | ^2.x | 状态管理，Vue 3 官方推荐 |
| Vue Router | ^4.x | 客户端路由 |
| Tailwind CSS | ^4.x | 原子化 CSS，不引组件库（组件库对比见 TECH-NOTES.md「前端 UI 组件库对比」） |
| Axios | ^1.x | HTTP 请求 |
| marked / markdown-it | latest | Markdown 渲染 |
| highlight.js | latest | 代码高亮 |

### 2.3 部署

| 服务 | 用途 | 免费额度 |
|---|---|---|
| Render | 后端 Express 服务托管 | 免费 tier（冷启动较慢） |
| Supabase | PostgreSQL 数据库托管 | 免费 tier，500MB |
| Vercel | 前端静态文件托管 | 免费，无限制 |

---

## 3. 核心概念：知识卡片

### 3.1 卡片类型

DevLog 的核心是"知识卡片"，而不是普通文章。卡片分为 4 种类型，每种有不同的展示和填写方式：

| 类型 | 标识 | 适合场景 | 特殊字段 |
|---|---|---|---|
| 技术笔记 | `note` | 详细的技术文章、学习笔记 | 无（纯 Markdown） |
| 面试题 | `question` | 面试知识点，答案可折叠 | `answer`（可折叠答案） |
| Bug 日记 | `bug` | 记录踩过的坑，问题/原因/解决 | 无（在 `content` 中结构化书写） |
| TIL | `til` | Today I Learned，一行或几行 | 无（低门槛，快速记录） |

### 3.2 卡片的可见性

每张卡片有两种可见性状态：

- **私有（private）**：只有自己能看到，个人知识管理
- **公开（public）**：所有人可见，出现在社区首页

用户可以随时切换卡片的可见性。

### 3.3 置顶 vs 收藏的区别

这两个概念容易混淆，明确区分：

- **置顶（Pin）**：将**自己的**卡片置顶到工作台列表顶部，方便快速访问
- **收藏（Favorite）**：将**别人的**公开卡片收藏起来，存入自己的收藏夹

### 3.4 掌握度（Mastery）

每张卡片有一个 `mastery` 字段，表示当前对这个知识点的掌握程度：

| 值 | 含义 |
|---|---|
| `new` | 新建，从未复习 |
| `fuzzy` | 模糊，需要多加复习 |
| `remember` | 记得，但还不够熟练 |
| `master` | 已掌握 |

---

## 4. 数据库设计

### 4.1 users — 用户表

```sql
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50)  UNIQUE NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt 哈希，不存明文
  nickname     VARCHAR(50),                      -- 展示名，可与 username 不同
  avatar       VARCHAR(500),                     -- 头像 URL
  bio          TEXT,                             -- 个人简介
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

### 4.2 cards — 卡片表

```sql
CREATE TABLE cards (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  content          TEXT NOT NULL,                -- Markdown 正文
  type             VARCHAR(20) NOT NULL,         -- note / question / bug / til
  answer           TEXT,                         -- 仅 question 类型使用，可折叠
  visibility       VARCHAR(10) DEFAULT 'private', -- private / public
  is_pinned        BOOLEAN DEFAULT FALSE,
  difficulty       VARCHAR(10),                  -- easy / medium / hard，可选
  last_reviewed_at TIMESTAMP,                    -- 上次复习时间
  mastery          VARCHAR(10) DEFAULT 'new',    -- new / fuzzy / remember / master
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);
```

### 4.3 tags — 标签表

```sql
CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
```

### 4.4 card_tags — 卡片标签关联表（多对多）

```sql
CREATE TABLE card_tags (
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  tag_id  INTEGER REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);
```

**设计说明：** 标签不属于某个用户，是全局共享的。同一个标签（如 `JavaScript`）可以被所有用户的卡片引用。删除卡片时，`card_tags` 中的关联记录自动级联删除，但 `tags` 表中的标签本身不删除（保留历史标签记录）。

### 4.5 likes — 点赞表

```sql
CREATE TABLE likes (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id    INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)              -- 每人每张卡只能点一次赞
);
```

### 4.6 favorites — 收藏表

```sql
CREATE TABLE favorites (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id    INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)              -- 每人每张卡只能收藏一次
);
```

### 4.7 review_logs — 复习记录表

```sql
CREATE TABLE review_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id     INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  mastery     VARCHAR(10) NOT NULL,     -- fuzzy / remember / master
  reviewed_at TIMESTAMP DEFAULT NOW()
);
```

**设计说明：** 每次复习都会插入一条记录，保留完整的复习历史。`cards` 表上的 `mastery` 和 `last_reviewed_at` 字段记录的是最新状态，方便查询；`review_logs` 则记录完整历史，方便后续扩展（如绘制学习曲线）。

### 4.8 表关系总览

```
users ─────┬──── cards ──┬──── card_tags ──── tags
           │             ├──── likes
           │             ├──── favorites
           │             └──── review_logs
           ├──── likes
           ├──── favorites
           └──── review_logs
```

---

## 5. 后端 API 设计

### 5.1 通用规范

- Base URL：`/api`
- 请求/响应格式：JSON
- 认证方式：Bearer Token（`Authorization: Bearer <jwt>`）
- 错误响应格式：

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE"    // 可选，方便前端处理特定错误
}
```

- 成功响应：直接返回数据对象或数组，不包裹额外层级

### 5.2 Auth 模块

#### POST `/api/auth/register` — 注册

**请求体：**
```json
{
  "username": "string, 3-50 字符",
  "email": "string, 合法邮箱格式",
  "password": "string, 最少 6 位"
}
```

**成功响应 201：**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "nickname": null,
    "avatar": null,
    "bio": null
  }
}
```

**错误：** 400（参数不合法）、409（用户名或邮箱已存在）

---

#### POST `/api/auth/login` — 登录

**请求体：**
```json
{
  "email": "string",
  "password": "string"
}
```

**成功响应 200：** 同注册响应格式

**错误：** 400（参数不合法）、401（邮箱或密码错误）

---

#### GET `/api/auth/me` — 获取当前用户信息

**需要认证**

**成功响应 200：**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "nickname": "John",
  "avatar": "https://...",
  "bio": "...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### PUT `/api/auth/me` — 更新个人资料

**需要认证**

**请求体（字段均可选，只传需要修改的）：**
```json
{
  "nickname": "string",
  "avatar": "string (URL)",
  "bio": "string"
}
```

**成功响应 200：** 返回更新后的用户对象

---

### 5.3 Cards 模块

#### POST `/api/cards` — 创建卡片

**需要认证**

**请求体：**
```json
{
  "title": "string, 必填",
  "content": "string, 必填, Markdown",
  "type": "note | question | bug | til",
  "answer": "string, 可选, 仅 question 类型有意义",
  "visibility": "private | public, 默认 private",
  "difficulty": "easy | medium | hard, 可选",
  "tags": ["string", "string"]
}
```

**成功响应 201：** 返回创建的卡片对象（含 tags 数组）

**后端逻辑：**
1. 验证参数
2. 在 `cards` 表插入记录
3. 对每个 tag，先在 `tags` 表查找（不存在则插入），再在 `card_tags` 表创建关联
4. 返回含 tags 的完整卡片

---

#### GET `/api/cards` — 获取卡片列表

**认证可选**（已登录用户可以看到自己的私有卡片，未登录只能看公开卡片）

**Query 参数：**

| 参数 | 类型 | 说明 |
|---|---|---|
| `type` | string | 按类型过滤：note / question / bug / til |
| `tag` | string | 按标签名过滤 |
| `visibility` | string | private / public（仅对当前登录用户有效） |
| `search` | string | 关键词搜索（匹配 title 和 content） |
| `user_id` | number | 获取指定用户的卡片 |
| `page` | number | 页码，默认 1 |
| `limit` | number | 每页条数，默认 20，最大 50 |
| `sort` | string | newest（默认）/ most_liked |

**成功响应 200：**
```json
{
  "cards": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "total_pages": 5
}
```

**访问控制规则：**
- 未登录：只返回 `visibility = 'public'` 的卡片
- 已登录查询别人：只返回该用户的公开卡片
- 已登录查询自己（`user_id` = 当前用户 id）：返回所有卡片（含私有）

---

#### GET `/api/cards/:id` — 获取单张卡片

**认证可选**

**成功响应 200：** 返回卡片详情（含 tags、作者信息、点赞数、收藏数）

**访问控制：** 私有卡片只有作者本人可以访问，否则返回 404

---

#### PUT `/api/cards/:id` — 更新卡片

**需要认证，且只有作者本人可操作**

**请求体：** 与创建卡片相同（所有字段可选）

**成功响应 200：** 返回更新后的卡片对象

**后端逻辑：**
1. 验证当前用户是否为卡片作者
2. 更新 `cards` 表
3. 如果 `tags` 字段有变化：删除旧的 `card_tags` 关联，重新建立新的
4. 更新 `updated_at`

---

#### DELETE `/api/cards/:id` — 删除卡片

**需要认证，且只有作者本人可操作**

**成功响应 204**（No Content）

---

#### PATCH `/api/cards/:id/pin` — 切换置顶状态

**需要认证，且只有作者本人可操作**

**成功响应 200：**
```json
{ "is_pinned": true }
```

---

#### PATCH `/api/cards/:id/visibility` — 切换公开/私有

**需要认证，且只有作者本人可操作**

**成功响应 200：**
```json
{ "visibility": "public" }
```

---

#### GET `/api/cards/random` — 获取随机复习卡片

**需要认证**

**Query 参数：**

| 参数 | 类型 | 说明 |
|---|---|---|
| `count` | number | 返回几张，默认 3 |

**成功响应 200：** 返回卡片数组

**后端查询逻辑（按优先级排序）：**
```sql
SELECT * FROM cards
WHERE user_id = $1
ORDER BY
  CASE mastery
    WHEN 'new'   THEN 1
    WHEN 'fuzzy' THEN 2
    WHEN 'remember' THEN 3
    WHEN 'master'   THEN 4
  END ASC,
  last_reviewed_at ASC NULLS FIRST
LIMIT $2;
```

---

#### POST `/api/cards/:id/review` — 提交复习结果

**需要认证，且只有卡片作者可以复习自己的卡片**

**请求体：**
```json
{
  "mastery": "fuzzy | remember | master"
}
```

**成功响应 200：** 返回更新后的卡片 mastery 状态

**后端逻辑：**
1. 更新 `cards` 表：`mastery = $mastery`，`last_reviewed_at = NOW()`
2. 在 `review_logs` 插入一条记录

---

### 5.4 Tags 模块

#### GET `/api/tags` — 获取所有标签及使用次数

**认证可选**（如果已登录，返回该用户标签的使用次数；未登录，返回公开卡片中的标签）

**成功响应 200：**
```json
[
  { "name": "JavaScript", "count": 42 },
  { "name": "Vue", "count": 18 }
]
```

---

#### GET `/api/tags/:name/cards` — 获取某标签下的所有公开卡片

**认证可选**

**成功响应 200：** 卡片数组（支持分页，同 GET /api/cards 格式）

---

### 5.5 Social 模块

#### POST `/api/cards/:id/like` — 点赞

**需要认证**

**成功响应 201**，已点过赞返回 409

---

#### DELETE `/api/cards/:id/like` — 取消点赞

**需要认证**

**成功响应 204**

---

#### POST `/api/cards/:id/favorite` — 收藏

**需要认证**

**限制：** 只能收藏公开卡片，不能收藏自己的卡片（可选限制，看实现时再决定）

**成功响应 201**

---

#### DELETE `/api/cards/:id/favorite` — 取消收藏

**需要认证**

**成功响应 204**

---

#### GET `/api/users/:id/favorites` — 获取用户的收藏列表

**认证可选**（收藏列表是否公开，v1 默认公开）

**成功响应 200：** 卡片数组（支持分页）

---

### 5.6 Users 模块

#### GET `/api/users/:id` — 获取用户公开信息

**无需认证**（公开主页用）

**成功响应 200：**
```json
{
  "id": 3,
  "username": "zhangsan",
  "nickname": "张三",
  "avatar": "https://...",
  "bio": "前端工程师...",
  "created_at": "2025-11-01T12:00:00Z",
  "updated_at": "2025-11-01T12:00:00Z"
}
```

**不返回：** `email`（隐私）、`password_hash`（机密）

**错误：** 400（无效 ID）、404（用户不存在）

---

### 5.7 Stats 模块

#### GET `/api/stats/overview` — 总览统计

**需要认证**

**成功响应 200：**
```json
{
  "total_cards": 42,
  "by_type": {
    "note": 15,
    "question": 12,
    "bug": 8,
    "til": 7
  },
  "total_likes_received": 128,
  "total_favorites_received": 34,
  "mastery_distribution": {
    "new": 10,
    "fuzzy": 15,
    "remember": 12,
    "master": 5
  }
}
```

---

#### GET `/api/stats/heatmap` — 热力图数据

**需要认证**

**成功响应 200：** 最近 365 天每天创建的卡片数量

```json
[
  { "date": "2024-01-01", "count": 3 },
  { "date": "2024-01-02", "count": 0 },
  ...
]
```

**后端查询（最近 365 天）：**
```sql
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS count
FROM cards
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '365 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

---

#### GET `/api/stats/tags` — 标签分布（雷达图数据）

**需要认证**

**成功响应 200：**
```json
[
  { "name": "JavaScript", "count": 20 },
  { "name": "Vue", "count": 12 },
  ...
]
```

返回当前用户使用最多的前 N 个标签（N 由前端决定，默认返回 top 10）。

---

## 6. 前端页面设计

### 6.1 首页 Home — `/`

**访问权限：** 公开，无需登录

**功能：**
- 展示所有公开卡片的信息流（排除私有卡片）
- 顶部搜索栏，全局搜索标题和内容
- 按卡片类型筛选（Tab 或 Tag 形式）
- 排序切换：最新 / 最多点赞
- 点击卡片跳转到 `/card/:id`
- 卡片展示：标题、类型标签、部分内容摘要、标签、点赞数、作者、时间

**未登录用户：** 可以浏览和搜索，点赞/收藏时提示登录

---

### 6.2 个人主页 — `/user/:id`

**访问权限：** 公开，无需登录

**功能：**
- 用户头像、昵称、用户名、个人简介
- 该用户的公开卡片列表（支持按类型筛选）
- 该用户的标签云（标签大小反映使用频次）
- 查看自己的主页时，会有一个"去工作台"的入口

---

### 6.3 工作台 Workspace — `/workspace`

**访问权限：** 需要登录

**功能：**
- 管理自己所有卡片（含私有卡片）
- 顶部**快速创建栏**：输入标题，回车快速创建 TIL 类型卡片（低摩擦记录）
- 按类型、标签、可见性筛选
- 列表视图 / 卡片视图切换
- 置顶卡片始终排在最前
- 每张卡片有：编辑、删除、切换可见性、切换置顶的快捷操作
- 点击卡片跳转详情
- 创建/编辑卡片的 Modal 或全页表单（支持 Markdown 实时预览）

---

### 6.4 仪表盘 Dashboard — `/dashboard`

**访问权限：** 需要登录

**功能：**
- **GitHub 风格热力图**：过去一年每天的创建数量，直观展示学习活跃度
- **概览统计卡片**：卡片总数、按类型分布、获得的点赞数、获得的收藏数
- **掌握度分布**：各 mastery 状态的卡片数量（可以用饼图或环形图）
- **标签雷达图**：展示知识分布（JavaScript、Vue、Node.js 等各占多少）
- **今日复习**：随机抽取 3 张待复习卡片，逐一显示，用户标记掌握度

**今日复习交互：**
1. 展示卡片标题（question 类型的答案默认折叠）
2. 用户阅读后，点击"模糊 / 记得 / 已掌握"三个按钮之一
3. 标记后显示下一张，3 张完成后显示"今日复习完成！"

---

### 6.5 卡片详情 — `/card/:id`

**访问权限：** 公开卡片无需登录，私有卡片仅作者可访问

**功能：**
- 完整渲染 Markdown 内容，代码块高亮
- **question 类型**：答案区域默认折叠，点击"查看答案"展开
- **bug 类型**：内容中结构化展示（问题描述 / 原因分析 / 解决方案），通过 Markdown 标题结构区分
- 标签列表
- 点赞按钮（公开卡片）
- 收藏按钮（公开卡片，且不是自己的卡片）
- 作者信息（头像、昵称、用户名），点击跳转用户主页
- 创建时间和最后更新时间
- 作者本人可以看到编辑按钮

---

## 7. UI/UX 设计要点

### 7.1 必须实现

- **🌓 暗色/亮色主题切换**：用户偏好持久化到 localStorage
- **⚡ 快速创建栏**：Workspace 页顶部，一个输入框 + 回车，最低摩擦地创建 TIL
- **📊 GitHub 风格热力图**：使用 CSS Grid 或第三方库（如 vue-cal-heatmap）实现
- **📝 Markdown 实时预览**：编辑时左侧写 Markdown，右侧实时渲染（分栏模式）
- **🎲 随机复习**：Dashboard 核心功能，3 张卡片逐一复习
- **🔍 全局搜索**：首页和工作台支持关键词搜索

### 7.2 次要但加分的功能

- 标签云（Tag Cloud）：标签字体大小根据使用次数动态调整
- 知识雷达图：使用 ECharts 或 Chart.js
- 响应式设计：至少在手机上能正常浏览（不一定完美适配）
- 卡片列表视图和网格视图切换
- question 类型答案折叠/展开动画

### 7.3 暂不实现（v1 范围外）

- 评论系统
- 关注/粉丝系统
- 消息通知
- 卡片导出（PDF/Markdown）
- 真正的间隔重复算法（SM-2 算法），v1 只做简单随机+优先级

---

## 8. 间隔复习逻辑

v1 采用简化版，不实现 SM-2 等复杂算法。

### 8.1 复习卡片的选取逻辑

```
1. 只选当前用户自己的卡片
2. 优先选 mastery = 'new'（从未复习）
3. 其次选 mastery = 'fuzzy'（模糊，需要加强）
4. 再次选 mastery = 'remember'
5. 最后选 mastery = 'master'
6. 同优先级内，按 last_reviewed_at ASC 排序（最久没复习的优先）
7. last_reviewed_at 为 NULL（从未复习）的排在最前面
```

对应的 SQL 见 [5.3 GET /api/cards/random](#get-apicardsmrandom--获取随机复习卡片)。

### 8.2 复习后的更新逻辑

用户标记复习结果后（POST `/api/cards/:id/review`）：

1. 更新 `cards` 表：
   - `mastery` = 用户选择的值（fuzzy / remember / master）
   - `last_reviewed_at` = 当前时间
2. 在 `review_logs` 表插入一条记录（保留历史）

### 8.3 未来可扩展的方向（v2+）

- 实现 SM-2 算法，为每张卡片计算下次复习时间（`next_review_at` 字段）
- 到期提醒通知
- 复习统计：连续复习天数（streak）

---

## 9. 项目目录结构

```
devlog/
├── docs/
│   └── PLAN.md                  # 本文件，项目唯一权威文档
│
├── server/                       # 后端（Express + TypeScript）
│   ├── src/
│   │   ├── index.ts              # 入口，启动 Express 服务
│   │   ├── config/
│   │   │   ├── db.ts             # 数据库连接（pg Pool）
│   │   │   └── env.ts            # 环境变量读取和校验
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT 验证中间件
│   │   │   └── errorHandler.ts   # 全局错误处理
│   │   ├── routes/
│   │   │   ├── auth.ts           # 认证路由
│   │   │   ├── cards.ts          # 卡片路由
│   │   │   ├── tags.ts           # 标签路由
│   │   │   ├── social.ts         # 社交路由（点赞、收藏）
│   │   │   └── stats.ts          # 统计路由
│   │   ├── controllers/          # 路由处理函数（业务逻辑）
│   │   │   ├── auth.controller.ts
│   │   │   ├── cards.controller.ts
│   │   │   ├── tags.controller.ts
│   │   │   ├── social.controller.ts
│   │   │   └── stats.controller.ts
│   │   ├── models/               # 数据库查询函数（SQL）
│   │   │   ├── user.model.ts
│   │   │   ├── card.model.ts
│   │   │   ├── tag.model.ts
│   │   │   ├── social.model.ts
│   │   │   └── stats.model.ts
│   │   └── utils/
│   │       ├── jwt.ts            # JWT 签发和解析
│   │       └── validators.ts     # zod 校验 schema
│   ├── package.json
│   └── tsconfig.json
│
├── client/                        # 前端（Vue 3 + Vite）
│   ├── src/
│   │   ├── main.ts               # 入口
│   │   ├── App.vue
│   │   ├── views/                # 页面组件
│   │   │   ├── HomeView.vue
│   │   │   ├── UserProfileView.vue
│   │   │   ├── WorkspaceView.vue
│   │   │   ├── DashboardView.vue
│   │   │   └── CardDetailView.vue
│   │   ├── components/           # 可复用组件
│   │   │   ├── CardItem.vue      # 卡片列表项
│   │   │   ├── CardForm.vue      # 创建/编辑卡片表单
│   │   │   ├── MarkdownEditor.vue # Markdown 编辑器（含预览）
│   │   │   ├── MarkdownRenderer.vue # Markdown 渲染
│   │   │   ├── TagCloud.vue
│   │   │   ├── Heatmap.vue
│   │   │   ├── RadarChart.vue
│   │   │   ├── ReviewCard.vue    # 复习卡片组件
│   │   │   ├── QuickCapture.vue  # 快速创建栏
│   │   │   └── NavBar.vue
│   │   ├── stores/               # Pinia 状态管理
│   │   │   ├── auth.store.ts     # 用户认证状态
│   │   │   ├── cards.store.ts    # 卡片列表状态
│   │   │   └── ui.store.ts       # UI 状态（主题等）
│   │   ├── api/                  # API 请求封装
│   │   │   ├── client.ts         # Axios 实例（含 token 拦截器）
│   │   │   ├── auth.api.ts
│   │   │   ├── cards.api.ts
│   │   │   ├── social.api.ts
│   │   │   └── stats.api.ts
│   │   ├── router/
│   │   │   └── index.ts          # Vue Router，含路由守卫
│   │   └── utils/
│   │       └── format.ts         # 时间格式化等工具函数
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example                   # 环境变量模板（提交到 git）
├── .env                           # 真实环境变量（不提交，在 .gitignore 中）
├── .gitignore
└── README.md
```

---

## 10. 三周开发计划

### 整体原则

- 每天工作 1-2 小时（工作日），周末可多投入
- 后端先于前端，每个模块完成后用 Postman 验证再继续
- 遇到配置问题、环境问题直接问 AI，不要卡超过 30 分钟

---

### Week 1 — 后端基础

**Day 1-2：项目搭建 + 数据库**

- [ ] 初始化 `server/` 目录：`npm init`，安装 Express、TypeScript 依赖
- [ ] 配置 `tsconfig.json`
- [ ] 实现 `src/config/db.ts`：连接 Supabase PostgreSQL
- [ ] 创建所有数据库表（users、cards、tags、card_tags、likes、favorites、review_logs）
- [ ] 验证：能成功连接数据库并执行简单查询

**Day 3-4：Auth 模块**

- [ ] 实现 `POST /api/auth/register`：接收参数、bcrypt 哈希密码、写入 users 表、返回 JWT
- [ ] 实现 `POST /api/auth/login`：验证密码、返回 JWT
- [ ] 实现 JWT 中间件（`middleware/auth.ts`）
- [ ] 实现 `GET /api/auth/me` 和 `PUT /api/auth/me`
- [ ] Postman 测试所有 Auth 接口

**Day 5-7：Cards 模块**

- [ ] 实现 CRUD（POST、GET 列表、GET 详情、PUT、DELETE）
- [ ] 实现标签关联逻辑（tag 的 upsert + card_tags 关联）
- [ ] 实现过滤、分页、搜索
- [ ] 实现 `PATCH /pin` 和 `PATCH /visibility`
- [ ] 实现 `GET /random` 和 `POST /:id/review`
- [ ] Postman 测试所有 Cards 接口

---

### Week 2 — 后端收尾 + 前端开始

**Day 1-2：Social 模块 + Stats 模块**

- [ ] 实现点赞（POST/DELETE like）
- [ ] 实现收藏（POST/DELETE favorite、GET favorites）
- [ ] 实现 Stats 三个接口（overview、heatmap、tags）
- [ ] 实现 Tags 两个接口
- [ ] Postman 测试全部接口

**Day 3-4：后端收尾 + 联调准备**

- [ ] 添加全局错误处理中间件
- [ ] 添加输入校验（zod）到所有接口
- [ ] 测试边缘情况（无权限访问、参数缺失、重复点赞等）
- [ ] 完善 `.env.example`，记录所有需要的环境变量

**Day 5-7：前端项目搭建 + 首页 + 卡片详情**

- [ ] 初始化 `client/` 目录（`npm create vite@latest`）
- [ ] 安装依赖：Pinia、Vue Router、Axios、Tailwind CSS、markdown 相关
- [ ] 配置路由（5 个页面路由）、Pinia store、Axios 实例
- [ ] 实现 NavBar 组件（登录状态判断、导航链接）
- [ ] 实现首页 `HomeView.vue`：卡片列表、搜索、筛选
- [ ] 实现卡片详情 `CardDetailView.vue`：Markdown 渲染、question 折叠、点赞/收藏
- [ ] 实现 `CardItem.vue` 可复用卡片组件

---

### Week 3 — 前端完成 + 部署

**Day 1-2：Workspace 页**

- [ ] 实现工作台页面框架（登录守卫）
- [ ] 实现快速创建栏（`QuickCapture.vue`）
- [ ] 实现卡片列表（含私有卡片）、筛选
- [ ] 实现 `CardForm.vue`（含 Markdown 编辑器和预览）
- [ ] 实现编辑、删除、置顶、切换可见性操作

**Day 3-4：Dashboard 页**

- [ ] 实现概览统计卡片
- [ ] 实现 GitHub 热力图（`Heatmap.vue`）
- [ ] 实现标签雷达图（`RadarChart.vue`）
- [ ] 实现今日复习功能（`ReviewCard.vue`，3 张卡片逐一复习）

**Day 5：个人主页**

- [ ] 实现 `UserProfileView.vue`：用户信息、公开卡片列表、标签云
- [ ] 实现 `TagCloud.vue`

**Day 6-7：上线**

- [ ] 前端：暗色/亮色主题完善
- [ ] 响应式检查和调整
- [ ] 部署后端到 Render，配置环境变量
- [ ] 确认 Supabase 数据库可远程连接
- [ ] 部署前端到 Vercel，配置 API Base URL
- [ ] 端到端测试（注册、创建卡片、复习流程、统计）
- [ ] 更新 README.md，添加在线演示链接

---

## 11. 部署方案

### 11.1 环境变量（`.env.example`）

```env
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000

# 前端地址（CORS 用）
CLIENT_URL=http://localhost:5173
```

### 11.2 后端部署（Render）

1. 在 Render 创建 Web Service，连接 GitHub 仓库
2. 配置 Build Command：`npm install && npm run build`
3. 配置 Start Command：`npm start`
4. 在 Environment 中添加所有环境变量
5. 注意：Render 免费 tier 服务不活跃时会休眠，冷启动需要 30-60 秒

### 11.3 数据库（Supabase）

1. 在 Supabase 创建项目，获取 `DATABASE_URL`
2. 在 SQL Editor 中执行建表 SQL
3. 将连接字符串填入 Render 的环境变量

### 11.4 前端部署（Vercel）

1. 在 Vercel 导入 GitHub 仓库（指定 `client/` 目录）
2. 配置 Build Command：`npm run build`
3. 配置 Output Directory：`dist`
4. 在 Environment Variables 中添加 `VITE_API_BASE_URL`（指向 Render 的后端地址）

---

## 12. 开发原则

这些原则来自开发者学习规划，在此记录，作为过程中的参考：

1. **能跑就行**：先实现功能，不追求完美。代码可以重构，但跑不起来才是真正的问题。

2. **卡住了问 AI**：遇到配置、环境、语法问题，不要自己死磕超过 30 分钟。AI 可以快速帮你定位问题，节省时间去做真正有价值的思考。

3. **做项目学，别看视频**：视频教程会带来虚假的进度感。真正的学习来自自己写代码、遇到报错、解决报错这个循环。

4. **永远不要提交 `.env`**：所有包含密码、密钥、数据库连接字符串的文件都放在 `.gitignore` 里。`.env.example` 提交到 git，真实的 `.env` 永远不提交。

5. **模块化开发，独立测试**：每个后端模块完成后，先用 Postman 测试所有接口，确认没问题再继续。不要等到前端写完才发现后端有 bug。

6. **这是作品集，不是练习题**：代码要写得"像样子"：有 TypeScript 类型、有参数校验、有错误处理。这些细节是面试官区分"认真在做"和"敷衍了事"的重要标准。

7. **axios 必须二次封装**：统一的 axios 实例 + 按模块拆分的 API 文件，组件层只调 API 模块，不直接 `axios.get()`。具体封装方式在写到 `src/api/` 时再定。

---

## 13. 当前进度

> 最后更新：2026-05-12

### 后端 ✅ 已完成

- [x] Git 仓库初始化
- [x] 项目规划文档
- [x] Express + TypeScript 基础搭建
- [x] Supabase PostgreSQL 数据库连接
- [x] 7 张数据库表全部创建
- [x] **Auth 模块**（4 接口）：register / login / me GET / me PUT
- [x] **Cards 模块**（8 接口）：CRUD + 置顶 + 可见性 + 随机复习 + 复习提交
- [x] **Social 模块**（5 接口）：点赞/取消 + 收藏/取消 + 收藏列表
- [x] **Stats 模块**（3 接口）：总览 + 热力图 + 标签分布
- [x] **Tags 模块**（2 接口）：所有标签 + 某标签下的卡片
- [x] **Users 模块**（1 接口）：公开用户信息（个人主页用）
- [x] 可选鉴权中间件 `optionalAuthMiddleWare`
- [x] 全局错误处理中间件 `errorHandler`
- [x] 所有 23 个接口 Apifox 测试通过

**合计 23 个后端接口全部完成。**

### 后端待做（优先级）

**先做 C（前端），再回来做 B（zod）。**

- [ ] **B. 输入校验（zod）**（约 1-2 小时）
  - [ ] 安装 zod
  - [ ] 为每个模块建 schema：auth / cards / social / tags / stats
  - [ ] 建 validation 中间件
  - [ ] 挂到所有 POST / PUT / PATCH 接口
  - [ ] 测试参数不合法时返回 400

---

### 前端（C）— 按阶段推进

每天 1-2 小时投入，预估 **3-4 周**完工。

#### 阶段 1：项目搭建（Day 1，约 2 小时）

- [ ] `npm create vite@latest client` 初始化 Vue 3 + Vite
- [ ] 安装核心依赖：
  - `pinia` `vue-router@4` `axios`
  - 样式：`tailwindcss` + `@tailwindcss/vite`（不引组件库，tokens.css 转 `@theme`）
  - Markdown：`marked` 或 `markdown-it` + `highlight.js`
  - 图表：`echarts` 或 `chart.js`（仪表盘用）
- [ ] 配置 Vite 代理（转发 `/api` 到 `http://localhost:3000`）
- [ ] 配置 `.env.development` 和 `.env.production`（`VITE_API_BASE_URL`）
- [ ] 配置 5 个页面路由：`/` `/login` `/register` `/workspace` `/dashboard` `/user/:id` `/card/:id`
- [ ] 创建 Pinia stores：
  - [ ] `auth.store.ts`（token、当前用户、登录/登出 actions）
  - [ ] `ui.store.ts`（主题切换）
- [ ] 创建 Axios 实例（`src/api/client.ts`）
  - [ ] 请求拦截器：自动加 `Authorization: Bearer <token>`
  - [ ] 响应拦截器：401 时清 token 跳登录页
- [ ] 创建 API 封装：`auth.api.ts` `cards.api.ts` `social.api.ts` `stats.api.ts` `tags.api.ts`
- [ ] 配置路由守卫：未登录访问 `/workspace` `/dashboard` 时跳登录

#### 阶段 2：MVP 可跑通（Day 2-4，约 4-6 小时）

- [ ] **NavBar 组件**：logo + 导航 + 登录/用户菜单
- [ ] **登录页 / 注册页**：
  - [ ] 表单校验
  - [ ] 成功后存 token 跳首页
  - [ ] 失败弹错误提示
- [ ] **首页 HomeView**：
  - [ ] 调 `GET /api/cards` 公开卡片列表
  - [ ] 顶部搜索栏（keyword 参数）
  - [ ] 类型筛选 Tab（note/question/bug/til）
  - [ ] 排序切换（newest / most_liked）
  - [ ] 分页（滚动加载或页码）
- [ ] **CardItem 组件**（列表项复用）：
  - [ ] 显示标题、类型标签、内容摘要、标签、作者
  - [ ] 点击跳详情
- [ ] **MarkdownRenderer 组件**：
  - [ ] 渲染 Markdown
  - [ ] 代码块高亮（highlight.js）
- [ ] **卡片详情 CardDetailView**：
  - [ ] 调 `GET /api/cards/:id`
  - [ ] Markdown 渲染正文
  - [ ] question 类型答案折叠/展开
  - [ ] 点赞/收藏按钮（登录用户可点）
  - [ ] 作者信息 + 跳用户主页
  - [ ] 作者本人显示"编辑"按钮

**✅ 到这里已经能把它当只读的笔记查看工具用。**

#### 阶段 3：工作台（Day 5-6，约 4-6 小时）

- [ ] **WorkspaceView**：
  - [ ] 登录守卫
  - [ ] 调 `GET /api/cards?user_id=<me>` 查自己所有卡（含私有）
  - [ ] 按类型 / 标签 / 可见性筛选
  - [ ] 置顶卡排最前
- [ ] **QuickCapture 组件**（顶部快速创建栏）：
  - [ ] 输入标题 + 回车 → 快速创建 TIL
- [ ] **CardForm 组件**（创建/编辑）：
  - [ ] Markdown 编辑器（建议 `md-editor-v3` 或 `v-md-editor`）
  - [ ] 左写右预览分栏
  - [ ] 类型选择、visibility、difficulty、tags 输入
- [ ] 每张卡的**快捷操作**：
  - [ ] 编辑（调 PUT）
  - [ ] 删除（调 DELETE，加确认框）
  - [ ] 置顶切换（调 PATCH /pin）
  - [ ] 可见性切换（调 PATCH /visibility）

**✅ 到这里已经可以把它当做日常笔记工具用。**

#### 阶段 4：仪表盘（Day 7-8，约 4-6 小时）

- [ ] **DashboardView** 主框架：
  - [ ] 登录守卫
- [ ] **概览统计卡片**（`GET /api/stats/overview`）
  - [ ] 卡片总数 / 被赞数 / 被收藏数
  - [ ] 按类型分布（饼图或列表）
  - [ ] 按掌握度分布（饼图）
- [ ] **Heatmap 组件**（GitHub 风格）：
  - [ ] 调 `GET /api/stats/heatmap`
  - [ ] 用 CSS Grid 画 7×53 格子
  - [ ] 或用 `vue-cal-heatmap` 等第三方库
- [ ] **RadarChart 组件**（标签分布雷达图）：
  - [ ] 调 `GET /api/stats/tags`
  - [ ] ECharts 雷达图
- [ ] **今日复习功能**：
  - [ ] 调 `GET /api/cards/random?count=3`
  - [ ] 逐张显示 question 类型默认折叠答案
  - [ ] 用户点"模糊/记得/已掌握"调 `POST /api/cards/:id/review`
  - [ ] 3 张完成后显示"复习完成"

#### 阶段 5：个人主页（Day 9，约 2-3 小时）

- [ ] **UserProfileView**：
  - [ ] 调 `GET /api/auth/me` 或 `/users/:id`（如果有）显示用户信息
  - [ ] 调 `GET /api/cards?user_id=<:id>` 查公开卡
  - [ ] 显示该用户的标签云
- [ ] **TagCloud 组件**：
  - [ ] 标签字体大小根据使用次数动态
  - [ ] 点击标签跳 `/tags/:name/cards`

#### 阶段 6：打磨（Day 10-11，约 3-5 小时）

- [ ] **暗色/亮色主题**：
  - [ ] CSS 变量定义两套色板
  - [ ] 切换按钮存 localStorage
  - [ ] 所有页面适配
- [ ] **响应式设计**：
  - [ ] 手机上能正常浏览（不求完美）
- [ ] **Loading / 错误状态**：
  - [ ] 请求中显示骨架屏或 spinner
  - [ ] 请求失败友好提示
- [ ] **手写两个工具组件**（不引组件库的代价，合计约 1 小时）：
  - [ ] `Toast.vue`：`ref<Message[]>` + `<Transition>` + 定时器，约 30 行
  - [ ] `ConfirmDialog.vue`：删除确认框，约 20 行，含焦点管理
- [ ] **部署**：
  - [ ] 前端部署到 Vercel（指向后端 Render 地址）
  - [ ] 后端部署到 Render（配置环境变量）
  - [ ] 端到端测试

---

### 部署

- [ ] 后端部署至 Render
- [ ] 数据库确认 Supabase 远程可连
- [ ] 前端部署至 Vercel，配置 `VITE_API_BASE_URL`
- [ ] 注册 / 创建卡片 / 复习全流程上线测试
- [ ] 更新 README 添加在线 demo 链接

---

### 开发顺序明确

```
当前位置 → C（前端，约 3-4 周） → B（zod 校验，1-2 小时） → 部署 → 完工
```

前端是大头，完成 MVP 之后就可以开始当真实工具用，建议边用边迭代。zod 放前端完工后做，因为校验规则要跟前端字段完全对齐，前端定型再补更省心。

---

*本文档随项目进展持续更新。*
