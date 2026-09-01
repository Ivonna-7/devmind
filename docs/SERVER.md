# 后端搭建记录

## 1. 初始化

```bash
mkdir server      # 创建后端目录
cd server         # 进入后端目录
npm init -y       # 初始化 Node.js 项目，生成 package.json（-y 跳过交互，全部用默认值）
```

## 2. 配置镜像源

`server/.npmrc`：
```
registry=https://registry.npmmirror.com
```

仅当前项目生效，不影响其他项目。

## 3. 已安装依赖

### 运行时依赖

| 包 | 版本 | 作用 |
|---|------|------|
| express | ^5.2.1 | Web 框架，处理 HTTP 请求和路由 |
| cors | ^2.8.6 | 跨域处理，允许前端访问后端接口 |
| dotenv | ^17.4.2 | 读取 .env 文件中的环境变量 |

```bash
npm install express cors dotenv
```

### 开发依赖

| 包 | 版本 | 作用 |
|---|------|------|
| typescript | ^6.0.3 | TypeScript 编译器 |
| @types/express | ^5.0.6 | Express 的类型定义 |
| @types/cors | ^2.8.19 | cors 的类型定义 |
| @types/node | ^25.6.0 | Node.js 的类型定义 |
| tsx | ^4.21.0 | 直接运行 .ts 文件 + watch 模式自动重启 |

```bash
npm install -D typescript @types/express @types/cors @types/node tsx
```

## 4. TypeScript 配置

`npx tsc --init` 生成 `tsconfig.json`，修改了以下关键配置：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| rootDir | ./src | 源码目录 |
| outDir | ./dist | 编译输出目录 |
| module | nodenext | Node.js 模块系统 |
| target | esnext | 编译到最新 JS 版本 |
| types | ["node"] | 识别 Node.js 全局类型 |
| strict | true | 严格类型检查 |

同时在 `package.json` 中添加 `"type": "module"` 启用 ESM 模块语法。

> ⚠️ **ESM 导入规则：写的是 .ts 文件，导入时必须写 .js 后缀。** `tsx` 运行时会自动找到对应的 `.ts` 文件。
例如：`import pool from '../config/db.js'`（实际文件是 `db.ts`）。

## 5. 项目入口文件

创建 `src/index.ts`，包含：

- 引入 express、cors、dotenv
- `dotenv.config()` 加载环境变量
- 创建 Express 实例，配置跨域和 JSON 解析中间件
- 定义 `GET /` 测试路由
- 监听端口 3000

## 6. 启动脚本

`package.json` 中添加：

```json
"scripts": {
  "dev": "tsx watch src/index.ts"
}
```

```bash
npm run dev       # 启动开发服务器（watch 模式，改代码自动重启）
```

## 7. 项目目录结构

在 `src/` 下创建业务分层目录：

```bash
mkdir src/config src/middleware src/routes src/controllers src/models src/utils
```

| 文件夹 | 职责 | 举例 |
|--------|------|------|
| config | 配置文件 | 数据库连接配置 |
| middleware | 中间件 | JWT 鉴权、错误处理 |
| routes | 路由定义 | /api/cards、/api/auth |
| controllers | 业务逻辑 | 收到请求后具体干什么 |
| models | 数据库操作 | SQL 查询、增删改查 |
| utils | 工具函数 | JWT 生成、密码加密 |

请求流程：全局中间件 → 匹配路由 → 路由中间件(鉴权) → controller → model → 返回

## 8. 环境变量配置

在 `server/` 下创建 `.env` 文件（已加入 `.gitignore`，不会提交到 Git）：

```env
DATABASE_URL=postgresql://...   # Supabase 数据库连接字符串
PORT=3000                       # 服务端口
JWT_SECRET=xxx                  # JWT 签名密钥（Auth 模块用）
JWT_EXPIRES_IN=7d               # JWT 有效期
CLIENT_URL=http://localhost:5173 # 前端地址（CORS 用）
```

> ⚠️ `.env` 文件包含敏感信息，绝不提交到 Git。`.env.example` 可以提交作为模板。

## 9. 数据库连接

### 托管平台

使用 Supabase 免费 tier 托管 PostgreSQL：
- 项目名：devmind
- Region：Northeast Asia (Tokyo)
- 连接方式：Session pooler（兼容 IPv4 网络）

### 新增依赖

| 包 | 版本 | 作用 |
|---|------|------|
| pg | ^8.20.0 | PostgreSQL 客户端，连接和查询数据库 |
| @types/pg | ^8.20.0 | pg 的 TypeScript 类型定义（开发依赖） |

```bash
npm install pg
npm install -D @types/pg
```

### 连接配置

创建 `src/config/db.ts`：

- 引入 pg 和 dotenv
- 使用 `pg.Pool` 创建连接池（复用连接，提高性能）
- 通过 `DATABASE_URL` 环境变量配置连接
- 启用 SSL（Supabase 远程连接必须）
- 导出 pool 供其他模块使用

### 连接测试

在 `src/index.ts` 中引入 pool，启动时执行 `SELECT NOW()` 验证连接。

✅ 测试通过：控制台输出"数据库连接成功"

## 10. 创建数据库表

### 建表方式

在 Supabase 网页的 **SQL Editor** 中执行建表 SQL（直接粘贴运行，比写代码脚本更直观）然后 RUN。

### 表结构总览

共 7 张表：

| 表名 | 用途 | 关键设计 |
|---|---|---|
| users | 用户信息 | username、email 唯一 |
| cards | 知识卡片（核心） | 外键关联 users，支持 4 种类型 |
| tags | 标签（全局共享） | name 唯一 |
| card_tags | 卡片-标签多对多关联 | 联合主键 (card_id, tag_id) |
| likes | 点赞记录 | 联合唯一 (user_id, card_id) 防重复点赞 |
| favorites | 收藏记录 | 联合唯一 (user_id, card_id) 防重复收藏 |
| review_logs | 复习历史 | 每次复习插入一条，保留完整记录 |

### 表关系

```
users ──┬── cards ──┬── card_tags ── tags
        │           ├── likes
        │           ├── favorites
        │           └── review_logs
        ├── likes
        ├── favorites
        └── review_logs
```

- users → cards：一对多（一个用户多张卡片）
- cards ↔ tags：多对多（通过 card_tags 中间表关联）
- users → likes/favorites/review_logs：一对多

### RLS 设置

Supabase 弹出 RLS（Row Level Security）提示时选择 **Run without RLS**，权限控制在 Express 的 JWT 中间件中实现，不依赖 Supabase 的 RLS。

✅ 7 张表全部创建成功

### INSERT 字段选择规则

> ⚠️ **写 INSERT 语句时，只传需要的字段，不要传所有字段。**

将表字段分为三类：

| 类型 | 说明 | 是否传入 INSERT | 示例 |
|---|---|---|---|
| 自动生成 | SERIAL 自增主键 | ❌ 不传 | id |
| 有默认值 | 建表时设了 DEFAULT | ❌ 不传 | created_at、is_pinned、mastery |
| 需要传入 | 用户输入或代码提供 | ✅ 要传 | username、`title`、user_id |

**cards 表示例：**

| 字段 | 类型 | 是否传入 |
|---|---|---|
| id | 自动生成（SERIAL） | ❌ |
| user_id | 代码传入（从 token 解析） | ✅ |
| title | 用户输入 | ✅ |
| content | 用户输入 | ✅ |
| type | 用户输入 | ✅ |
| answer | 用户输入（可选） | ✅ |
| visibility | 用户输入（有默认值 'private'） | ✅ |
| difficulty | 用户输入（可选） | ✅ |
| is_pinned | DEFAULT FALSE | ❌ |
| last_reviewed_at | 默认 NULL | ❌ |
| mastery | DEFAULT 'new' | ❌ |
| created_at | DEFAULT NOW() | ❌ |
| updated_at | DEFAULT NOW() | ❌ |

## 11. Auth 模块

### 新增依赖

| 包 | 版本 | 作用 |
|---|------|------|
| bcrypt | ^6.0.0 | 密码哈希加密（不可逆，防泄露） |
| jsonwebtoken | ^9.0.3 | JWT token 签发与验证 |
| @types/bcrypt | dev | bcrypt 的类型定义 |
| @types/jsonwebtoken | dev | jsonwebtoken 的类型定义 |

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

### 接口总览

| 方法 | 路径 | 说明 | 需要登录 |
|---|---|---|---|
| POST | /api/auth/register | 注册 | ❌ |
| POST | /api/auth/login | 登录 | ❌ |
| GET | /api/auth/me | 获取当前用户信息 | ✅ |
| PUT | /api/auth/me | 更新个人资料 | ✅ |

✅ 四个接口全部通过 Apifox 测试

### 注册流程

```
前端发 POST /api/auth/register
        ↓
index.ts: app.use('/api/auth', authRoutes)  → 匹配 /api/auth
        ↓
routes/auth.ts: router.post('/register', register) → 匹配 /register
        ↓
controllers/auth.controller.ts: register 函数
        ↓
  1. req.body 拿到 { username, email, password }
  2. bcrypt.hash(password, 10) 加密密码
  3. models/user.model.ts: createUser() 写入数据库
  4. utils/jwt.ts: generateToken(userId) 生成 token
  5. res.status(201).json({ token, user }) 返回
```

### 登录流程

```
POST /api/auth/login
        ↓
  1. req.body 拿到 { email, password }
  2. findUserByEmail(email) 查用户
  3. bcrypt.compare() 对比密码
  4. generateToken(userId) 生成 token
  5. 剔除 password_hash 后返回 { token, user }
```

### JWT 鉴权中间件

文件：`src/middleware/auth.ts`

需要登录的接口在路由中加 authMiddleWare：

```typescript
router.get("/me", authMiddleWare, getUserInfo);
router.put("/me", authMiddleWare, updateUserInfo);
```

中间件流程：
1. 从请求头 `Authorization: Bearer <token>` 中提取 token
2. 用 verifyToken 验证 token
3. 将 userId 挂到 req 上供后续使用
4. 调用 next() 放行

### 新增文件

| 文件 | 职责 |
|---|---|
| `src/utils/jwt.ts` | generateToken 签发 token、verifyToken 验证 token |
| `src/models/user.model.ts` | createUser、findUserByEmail、findUserById、updateUser |
| `src/controllers/auth.controller.ts` | register、login、getUserInfo、updateUserInfo |
| `src/routes/auth.ts` | 4 条路由（register、login、me GET/PUT） |
| `src/middleware/auth.ts` | JWT 鉴权中间件 |

### 错误处理

| 场景 | 状态码 | 说明 |
|---|---|---|
| 用户名或邮箱已存在 | 409 | PostgreSQL 唯一约束冲突（错误码 23505） |
| 邮箱或密码错误 | 401 | 不区分"用户不存在"和"密码错误"，防信息泄露 |
| 未提供 token | 401 | 请先登录 |
| token 无效或过期 | 401 | 需重新登录 |
| 其他错误 | 500 | 服务器错误 |

## 12. Cards 模块 — 创建、详情、列表

### 接口总览

| 方法 | 路径 | 说明 | 需要登录 |
|---|---|---|---|
| POST | /api/cards | 创建卡片 | ✅ |
| GET | /api/cards | 获取卡片列表（筛选、分页、搜索） | ❌（但登录后能看私有） |
| GET | /api/cards/:id | 获取卡片详情 | ❌（私有卡片仅作者可见） |

✅ 三个接口全部通过 Apifox 测试

### 创建卡片流程

```
POST /api/cards（需要 token）
        ↓
  1. req.body 拿到 { title, content, type, answer, visibility, difficulty, tags }
  2. 往 cards 表插入卡片数据
  3. 处理 tags：对每个标签 → tags 表 upsert（ON CONFLICT） → card_tags 表建关联
  4. 调用 getCardById 返回完整卡片（含 tags 数组）
```

涉及 3 张表：cards + tags + card_tags

### 卡片列表查询

支持的 Query 参数：

| 参数 | 说明 |
|---|---|
| page | 页码，默认 1 |
| limit | 每页条数，默认 20，最大 50 |
| keyword | 关键词搜索（ILIKE 模糊匹配标题和内容） |
| type | 按类型筛选（note/question/bug/til） |
| tag | 按标签筛选（JOIN 关联表） |
| visibility | 公开/私有（仅查自己时有效） |
| user_id | 查指定用户的卡片 |
| sort | newest（默认） / most_liked |

核心实现：动态拼 SQL WHERE 条件 + LIMIT/OFFSET 分页

### 访问控制

| 场景 | 规则 |
|---|---|
| 未登录 | 只能看公开卡片 |
| 已登录查别人 | 只能看别人的公开卡片 |
| 已登录查自己 | 全部可见（含私有） |
| 卡片详情 | 私有卡片仅作者可见，否则返回 404 |

### 新增文件

| 文件 | 职责 |
|---|---|
| `src/models/card.model.ts` | createCard、getCardById、getCardList |
| `src/controllers/cards.controller.ts` | createCardHandler、getCardDetailHandler、getCardListHandler |
| `src/routes/cards.ts` | 3 条路由 |

### 路由顺序注意

```typescript
router.get("/", getCardListHandler);       // 精确路径先
router.get("/:id", getCardDetailHandler);  // 动态路径后
```

`/:id` 会匹配所有路径，必须放在精确路径后面。

## 当前目录结构

```
server/
├── src/
│   ├── config/
│   │   └── db.ts                    # 数据库连接池配置
│   ├── controllers/
│   │   ├── auth.controller.ts       # register、login、getUserInfo、updateUserInfo
│   │   └── cards.controller.ts      # createCardHandler、getCardDetailHandler、getCardListHandler
│   ├── middleware/
│   │   └── auth.ts                  # JWT 鉴权中间件
│   ├── models/
│   │   ├── user.model.ts            # createUser、findUserByEmail、findUserById、updateUser
│   │   └── card.model.ts            # createCard、getCardById、getCardList
│   ├── routes/
│   │   ├── auth.ts                  # 认证路由（4 条）
│   │   └── cards.ts                 # 卡片路由（3 条）
│   ├── utils/
│   │   └── jwt.ts                   # JWT 工具函数
│   └── index.ts                     # 入口文件
├── node_modules/
├── .env                             # 环境变量（不提交 Git）
├── .npmrc                           # 镜像源配置
├── package.json
├── package-lock.json
└── tsconfig.json
```


## 13. Cards 模块补完 — 更新、删除、置顶、可见性、随机复习、复习提交

### 接口总览

| 方法 | 路径 | 说明 | 需要登录 |
|---|---|---|---|
| PUT | /api/cards/:id | 更新卡片（支持部分字段） | ✅ |
| DELETE | /api/cards/:id | 删除卡片 | ✅ |
| PATCH | /api/cards/:id/pin | 切换置顶状态 | ✅ |
| PATCH | /api/cards/:id/visibility | 切换公开/私有 | ✅ |
| GET | /api/cards/random | 随机复习卡片（按掌握度优先级） | ✅ |
| POST | /api/cards/:id/review | 提交复习结果 | ✅ |

✅ 六个接口全部通过 Apifox 测试

---

### DELETE /api/cards/:id — 删除卡片

**后端逻辑**：
1. 权限检查：`getCardById` → 不是自己的卡 → 404
2. 执行 `DELETE FROM cards WHERE id = $1`
3. 返回 **204 No Content**（成功但响应体为空）

**关键点**：
- 数据库建表时 `card_tags`、`likes`、`favorites`、`review_logs` 都设了 `ON DELETE CASCADE`，删 card 时关联数据自动级联删除，不用手动清理。
- DELETE 用 204 不用 200，是 RESTful 约定（删了没内容可返回）。

---

### PATCH /api/cards/:id/pin — 切换置顶

**核心 SQL**：
```sql
UPDATE cards SET is_pinned = NOT is_pinned WHERE id = $1 RETURNING is_pinned
```

**关键点**：
- `NOT is_pinned` 直接翻转布尔值（true ↔ false），无需先查询再判断。
- `RETURNING is_pinned` 让 UPDATE 返回修改后的值，省一次 SELECT。

---

### PATCH /api/cards/:id/visibility — 切换公开/私有

**核心 SQL**（visibility 是字符串，不能用 NOT）：
```sql
UPDATE cards SET visibility = CASE
  WHEN visibility = 'private' THEN 'public'
  ELSE 'private'
END
WHERE id = $1
RETURNING visibility
```

**关键点**：
- `CASE ... END` 是 SQL 里的条件表达式，类似 JS 的三元运算符。
- `END` 是闭合符，不能省略，类似 JS 的 `}`。

---

### PUT /api/cards/:id — 更新卡片（最复杂）

支持**部分字段更新**（用户只传想改的字段，其他保持不变）。

**核心难点 1：动态部分更新**

用 `COALESCE` 实现"传了就用新值，没传保留原值"：

```sql
UPDATE cards SET
  title = COALESCE($1, title),
  content = COALESCE($2, content),
  ...
  updated_at = NOW()
WHERE id = $7
```

`COALESCE(A, B)`：A 不为 NULL 就返回 A，否则返回 B。

**核心难点 2：tags 的增删改**

tags 是多对多关系（cards ↔ tags 通过 card_tags 关联），更新时：
1. 如果用户传了 `tags` 字段（即使是空数组 `[]`）
2. 删掉这张卡所有 `card_tags` 关联
3. 按新 tags 重新 upsert + 建立关联（复用创建卡片的逻辑）
4. 最后用 `getCardById` 返回完整卡片（带新 tags）

**判断要用 `tags !== undefined` 而不是 `if (tags)`**：
- 用户没传 tags → undefined → 保留原有标签（不处理）
- 用户传了 `[]` → 空数组也是 truthy，要进入处理（清空所有标签）

---

### GET /api/cards/random — 随机复习卡片

按掌握度优先级返回待复习卡片。

**核心 SQL**：
```sql
SELECT c.*, COALESCE(json_agg(t.name) FILTER(WHERE t.name IS NOT NULL), '[]') AS tags
FROM cards c
LEFT JOIN card_tags ct ON c.id = ct.card_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE c.user_id = $1
GROUP BY c.id
ORDER BY
  CASE c.mastery
    WHEN 'new'      THEN 1
    WHEN 'fuzzy'    THEN 2
    WHEN 'remember' THEN 3
    WHEN 'master'   THEN 4
  END ASC,
  c.last_reviewed_at ASC NULLS FIRST
LIMIT $2
```

**关键点**：
- `CASE` 在 ORDER BY 里当排序键用 —— 把字符串映射成数字排序
- `NULLS FIRST` 让 `last_reviewed_at = NULL`（从没复习过）的卡片排最前
- 同掌握度里再按最久没复习的优先

---

### POST /api/cards/:id/review — 提交复习结果

**逻辑**：一个 handler 做两件事
1. 更新 `cards` 表：`mastery = 新值`，`last_reviewed_at = NOW()`
2. 在 `review_logs` 表插入一条历史记录

```ts
export const reviewCard = async (userId, cardId, mastery) => {
  const updated = await pool.query(
    "UPDATE cards SET mastery = $1, last_reviewed_at = NOW() WHERE id = $2 RETURNING mastery, last_reviewed_at",
    [mastery, cardId]
  );
  await pool.query(
    "INSERT INTO review_logs (user_id, card_id, mastery) VALUES ($1, $2, $3)",
    [userId, cardId, mastery]
  );
  return updated.rows[0];
};
```

**为啥要两次写表**：
- `cards.mastery` 是**当前状态**（查询快）
- `review_logs` 是**历史记录**（绘制学习曲线、统计用）

---

## 14. 新增中间件：optionalAuthMiddleWare

### 背景

`GET /api/cards`（列表）和 `GET /api/cards/:id`（详情）是**"认证可选"**的接口：
- 未登录 → 看公开卡片
- 已登录 → 可以看到自己的私有卡片

现有的 `authMiddleWare` 是**强制登录**（没 token 直接 401），不符合"可选"语义。

### 两个中间件的区别

| 场景 | authMiddleWare | optionalAuthMiddleWare |
|---|---|---|
| 没 token | 401 拦截 | 放行（userId 保持 undefined） |
| token 有效 | 设置 userId + 放行 | 设置 userId + 放行 |
| token 无效 | 401 拦截 | 放行（视为游客） |

**关键**：optionalAuth 永远会调 `next()`，只是有没有设置 `req.userId` 的区别。

### 实现

```ts
export const optionalAuthMiddleWare = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }
  try {
    const decoded = verifyToken(token) as { userId: number };
    (req as any).userId = decoded.userId;
  } catch (error) {
    // token 无效当游客处理，不拒绝
  }
  next();
};
```

### 使用

```ts
// 强制登录的接口
router.post("/", authMiddleWare, createCardHandler)
router.delete("/:id", authMiddleWare, deleteCardHandler)

// 认证可选的接口
router.get("/", optionalAuthMiddleWare, getCardListHandler)
router.get("/:id", optionalAuthMiddleWare, getCardDetailHandler)
```

### 设计原则总结

| 接口类型 | 中间件 | 例子 |
|---|---|---|
| 写操作（创建/修改/删除） | authMiddleWare | POST/PUT/DELETE /cards |
| 需要身份的纯读操作 | authMiddleWare | GET /cards/random（只复习自己） |
| 公开可读 + 可选私有 | optionalAuthMiddleWare | GET /cards（游客看公开，登录看私有） |



## 15. Social 模块 — 点赞、收藏

### 接口总览

| 方法 | 路径 | 说明 | 需要登录 |
|---|---|---|---|
| POST | /api/cards/:id/like | 点赞 | ✅ |
| DELETE | /api/cards/:id/like | 取消点赞 | ✅ |
| POST | /api/cards/:id/favorite | 收藏 | ✅ |
| DELETE | /api/cards/:id/favorite | 取消收藏 | ✅ |
| GET | /api/users/:id/favorites | 获取用户收藏列表 | ❌（可选） |

### 新增文件

| 文件 | 职责 |
|---|---|
| `src/models/social.model.ts` | likeCard / unLikeCard / favoriteCard / unFavoriteCard |
| `src/controllers/social.controller.ts` | 对应 4 个 handler |
| `src/routes/social.ts` | 5 条社交路由 |

### 路由挂载方式

Social 接口跨两个路径（`/api/cards/:id/...` 和 `/api/users/:id/...`），所以**不能**挂在某个单一前缀下。

**做法**：挂到 `/api`，路由内部写完整子路径。

```ts
// index.ts
app.use('/api', socialRouter)
```

```ts
// routes/social.ts
router.post("/cards/:id/like", ...);          // 完整路径成为 /api/cards/:id/like
router.get("/users/:id/favorites", ...);      // 完整路径成为 /api/users/:id/favorites
```

---

### 点赞 / 取消点赞

**核心 SQL**：
```sql
-- 点赞
INSERT INTO likes (user_id, card_id) VALUES ($1, $2)

-- 取消点赞
DELETE FROM likes WHERE user_id = $1 AND card_id = $2
```

**字段自动生成**：
- `id`（SERIAL）
- `created_at`（DEFAULT NOW()）
- 所以 INSERT 只传 `user_id` + `card_id` 两个字段

### 收藏 / 取消收藏

和点赞完全对称，把 `likes` 表换成 `favorites` 表即可（两表 schema 一样，都有 `UNIQUE(user_id, card_id)` 约束）。

---

### 重复点赞的错误处理

`UNIQUE(user_id, card_id)` 约束保证"一人一卡只能点一次赞"。用户重复点赞时，PostgreSQL 抛出**错误码 23505**（唯一约束冲突）。

**在 controller 里 catch 并转译成 HTTP 409**：

```ts
} catch (error: any) {
  if (error.code === "23505") {
    return res.status(409).json({ error: "已经点过赞了" });
  }
  res.status(500).json({ error: "服务器错误" });
}
```

### 为什么不直接返回 23505

| 原因 | 说明 |
|---|---|
| 职责分离 | 23505 是 PostgreSQL 内部错误号，属于后端细节 |
| 前端用 HTTP 状态码 | 浏览器/axios 基于 HTTP 状态码判断，不认识 23505 |
| 数据库可替换 | 换成 MySQL 错误码是 1062，应封装后对外稳定 |
| 409 是 REST 标准 | "请求与当前状态冲突"，所有开发者通用语义 |

**原则**：后端封装内部细节，对外只暴露稳定的 HTTP 语义。

---

### 状态码选择

| 接口 | 状态码 | 响应体 |
|---|---|---|
| POST /like 成功 | **201** | `{ message: "点赞成功" }` |
| POST /like 重复 | **409** | `{ error: "已经点过赞了" }` |
| DELETE /like 成功 | **204** | 空（用 `.send()` 不用 `.json()`） |
| POST /favorite 成功 | **201** | `{ message: "收藏成功" }` |
| DELETE /favorite 成功 | **204** | 空 |



### GET /api/users/:id/favorites — 获取用户收藏列表

**特点**：不需要登录（`v1 默认公开`），支持分页。

#### 核心 SQL

```sql
SELECT c.*,
  COALESCE(json_agg(t.name) FILTER(WHERE t.name IS NOT NULL), '[]') AS tags,
  f.created_at AS favorited_at
FROM favorites f
JOIN cards c ON f.card_id = c.id
LEFT JOIN card_tags ct ON c.id = ct.card_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE f.user_id = $1
GROUP BY c.id, f.created_at
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3
```

#### 关键点解释

**1. `FROM favorites f` 为起点，而不是 cards**

语义是"查这个用户收藏的卡"，收藏记录（favorites）是筛选起点，从这里 JOIN 出卡片详情。

**2. `JOIN cards c` 用内连接，不是 LEFT JOIN**

因为 favorites 表靠外键关联 cards 且有 `ON DELETE CASCADE`，卡片删了收藏也删了，不存在"有收藏但卡片不存在"的情况。内连接更合适。

**3. `f.created_at AS favorited_at`**

favorites 表的 `created_at` 是**收藏时间**，和卡片自己的 `created_at` 不一样。起别名避免冲突，前端可以知道"我什么时候收藏的"。

**4. `GROUP BY c.id, f.created_at`**

GROUP BY 必须包含 SELECT 里所有非聚合字段。`c.*` 的字段由 `c.id` 决定，但 `f.created_at` 来自另一张表，必须单独加进 GROUP BY。

#### 两种 userId 的区别

同样是名字 userId，来源不同含义不同：

| 来源 | 含义 | 场景 |
|---|---|---|
| `req.params.id` | URL 里的用户 id | 查**别人**或**指定某人**的数据 |
| `(req as any).userId` | token 解析出的 id | 做**当前登录用户自己**的操作 |

本接口用 `req.params.id`（查"URL 里那个人"的收藏，不是登录用户自己的）。

---

### Social 模块至此完成

5 个接口（like/unlike/favorite/unfavorite/favorites 列表）全部实现并测试通过。



## 16. Stats 模块 — 统计数据

### 接口总览

| 方法 | 路径 | 说明 | 需要登录 |
|---|---|---|---|
| GET | /api/stats/tags | 标签分布（当前用户用得最多的前 N 个） | ✅ |
| GET | /api/stats/overview | 总览统计（卡片总数、类型分布、掌握度分布、被赞/收藏数） | ✅ |
| GET | /api/stats/heatmap | 热力图数据（最近 365 天每天创建的卡片数） | ✅ |

### 新增文件

| 文件 | 职责 |
|---|---|
| `src/models/stats.model.ts` | getTagStats、getOverviewStats、getHeatmapStats |
| `src/controllers/stats.controller.ts` | 对应 3 个 handler |
| `src/routes/stats.ts` | 3 条统计路由 |

### 路由挂载

```ts
// index.ts
app.use('/api/stats', statsRouter)
```

路由文件里路径不带 `/stats` 前缀，拼上挂载点后形成完整路径。

---

### GET /api/stats/tags — 标签分布

返回当前用户**使用最多的前 N 个标签**（默认 top 10）。用于前端雷达图 / 标签云展示。

#### 核心 SQL

```sql
SELECT t.name, COUNT(ct.card_id) AS count
FROM tags t
JOIN card_tags ct ON t.id = ct.tag_id
JOIN cards c ON ct.card_id = c.id
WHERE c.user_id = $1
GROUP BY t.name
ORDER BY count DESC
LIMIT $2
```

#### 逐行解读

| 部分 | 作用 |
|---|---|
| `FROM tags t` | 从标签表起手 |
| `JOIN card_tags ct` | 关联到卡片-标签的桥梁表 |
| `JOIN cards c` | 再关联到 cards 表，才能按 user_id 筛选 |
| `WHERE c.user_id = $1` | 只统计当前用户的卡片 |
| `GROUP BY t.name` | 按标签名聚合 |
| `COUNT(ct.card_id)` | 每个标签被多少张卡用过 |
| `ORDER BY count DESC` | 用得多的排前面 |
| `LIMIT $2` | 取前 N 个 |

#### 为什么 GROUP BY + COUNT 就能得出"最多的"

执行过程拆解（以 user_id=3 有 3 张卡为例）：

**第 1 步 JOIN 后的中间结果**：
| t.name | card_id | user_id |
|---|---|---|
| JavaScript | 1 | 3 |
| Vue | 1 | 3 |
| JavaScript | 2 | 3 |
| React | 2 | 3 |
| JavaScript | 3 | 3 |

**第 2 步 GROUP BY t.name**：同名的合并成一组  
**第 3 步 COUNT(ct.card_id)**：数每组行数

| name | count |
|---|---|
| JavaScript | 3 |
| Vue | 1 |
| React | 1 |

**第 4 步 ORDER BY count DESC**：按数字降序 → JavaScript 排最前 = "用得最多"。

#### 关键感悟

SQL 聚合函数（`COUNT`/`SUM`/`AVG`）都是**先分组，再在每组内计算**。`GROUP BY + COUNT` 是"统计某字段出现多少次"的万能套路。



### GET /api/stats/overview — 总览统计

返回当前用户的卡片总数、类型分布、掌握度分布、被赞数、被收藏数。

#### 实现策略：拆成 5 个独立查询

不用一个超复杂的 SQL 硬堆，拆成 5 个简单查询 + JS 组装，更清晰可读。

```
1. 卡片总数      → SELECT COUNT(*) FROM cards WHERE user_id = $1
2. 按类型分布    → GROUP BY type
3. 按掌握度分布  → GROUP BY mastery
4. 被点赞总数    → JOIN likes + cards，按卡片所有者统计
5. 被收藏总数    → JOIN favorites + cards，按卡片所有者统计
```

#### reduce 把数组转成对象

SQL 聚合查询返回的是**数组**：
```js
[{ type: 'note', count: '15' }, { type: 'question', count: '12' }]
```

但前端想要**对象**：
```js
{ note: 15, question: 12 }
```

用 `reduce` 一步搞定：
```ts
const by_type = typeResult.rows.reduce((acc, row) => {
  acc[row.type] = parseInt(row.count);
  return acc;
}, {});
```

记住这个套路：**"数组 → 对象"就用 reduce**。

#### 关键坑点：被赞数的 WHERE 条件

查"我的卡被别人点了多少赞"，WHERE 要写在 **cards 表的 user_id** 上：

```sql
FROM likes l
JOIN cards c ON l.card_id = c.id
WHERE c.user_id = $1   -- ← 是卡的所有者，不是点赞的人
```

写成 `WHERE l.user_id = $1` 就变成"我给别人点了多少赞"，**语义完全相反**。

#### pg 驱动返回字符串的坑

PostgreSQL 的 COUNT 是 BIGINT 类型，pg 驱动默认把它返回成**字符串**（防止 JS Number 精度溢出）。

所以 reduce 里要手动 `parseInt(row.count)`，否则前端拿到的是 `"15"` 不是 `15`。

---

### GET /api/stats/heatmap — 热力图数据

返回最近 365 天每天创建的卡片数，用于 GitHub 风格贡献热力图。

#### 核心 SQL

```sql
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS count
FROM cards
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '365 days'
GROUP BY DATE(created_at)
ORDER BY date ASC
```

#### 关键语法点

**1. `DATE(created_at)` — TIMESTAMP 转成 DATE**

`created_at` 建表时是 `TIMESTAMP`（含时分秒），`DATE()` 函数截掉时间部分只留日期，这样同一天的卡片才会归到同一组。

**2. `INTERVAL '365 days'` — 时间间隔字面量**

PostgreSQL 的时间运算语法：
- `NOW()` → 当前时间点
- `INTERVAL '365 days'` → "365 天"这个长度
- `NOW() - INTERVAL '365 days'` → 365 天前的那个时刻

常用写法：
```sql
INTERVAL '1 day'
INTERVAL '7 days'
INTERVAL '1 hour'
INTERVAL '1 month'
INTERVAL '1 year 2 months 3 days'
```

**3. 只返回有数据的天**

SQL 只会返回"真实发生过的天"，没卡的天不出现在结果里。前端自己补零（GitHub 热力图本来就要循环 365 个格子）。

#### date 格式化（避免时区坑）

pg 把 DATE 返回成 JS Date 对象，JSON 序列化时会变成 UTC 字符串：`"2026-05-06T16:00:00.000Z"`。

用 `toISOString().slice(0, 10)` 截取前 10 位，返回干净的 `"2026-05-07"`：

```ts
return result.rows.map((row) => ({
  date: row.date.toISOString().slice(0, 10),
  count: parseInt(row.count),
}));
```

#### 为什么前端补零，而不是后端？

| 对比 | 前端补 ✅ | 后端补 |
|---|---|---|
| 响应体积 | 小（只传真实数据） | 大（365 条固定） |
| 后端 SQL | 简单 GROUP BY | 要用 `generate_series` 造日期 |
| 前端逻辑 | 反正要画 365 格子，顺便补零 | 零工作量 |

**原则**：后端给"事实"，前端做"展示"。

---

## 17. Tags 模块 — 标签查询

### 接口总览

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | /api/tags | 所有标签及使用次数 | 可选 |
| GET | /api/tags/:name/cards | 某标签下的公开卡片 | 可选 |

### 访问控制

两个接口都用 `optionalAuthMiddleWare`（可选鉴权）：
- **已登录**：`GET /api/tags` 只统计自己卡片用的标签
- **未登录**：只统计公开卡片用的标签

### GET /api/tags — 所有标签及使用次数

核心是**根据登录状态动态拼 WHERE 条件**：

```ts
if (currentUserId) {
  whereClause = "WHERE c.user_id = $1";
  params = [currentUserId];
} else {
  whereClause = "WHERE c.visibility = 'public'";
  params = [];
}
```

然后 JOIN 三张表统计：
```sql
SELECT t.name, COUNT(DISTINCT ct.card_id) AS count
FROM tags t
JOIN card_tags ct ON t.id = ct.tag_id
JOIN cards c ON ct.card_id = c.id
${whereClause}
GROUP BY t.name
ORDER BY count DESC
```

**为什么 `COUNT(DISTINCT ct.card_id)` 要 DISTINCT**：虽然当前 schema 不会重复（card_tags 有联合主键），但加 DISTINCT 更保险，防止将来改表结构时出现重复计数。

### GET /api/tags/:name/cards — 某标签下的公开卡片

**最难点**：既要**按 tagName 筛选**卡片，又要**返回每张卡的完整标签列表**。

如果只用一组 JOIN：
```sql
-- ❌ 错误做法
FROM cards c
JOIN card_tags ct ON c.id = ct.card_id
JOIN tags t ON ct.tag_id = t.id
WHERE t.name = 'JavaScript'
```

这样 `json_agg(t.name)` 只会聚合 `JavaScript` 一个标签，其他标签全丢失。

**解决：两组 JOIN 别名，一组筛选一组聚合**

```sql
FROM cards c
-- 筛选用（有 tagName 才进入）
JOIN card_tags ct2 ON c.id = ct2.card_id
JOIN tags t2 ON ct2.tag_id = t2.id AND t2.name = $1
-- 聚合用（拿出这张卡的所有标签）
LEFT JOIN card_tags ct ON c.id = ct.card_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE c.visibility = 'public'
GROUP BY c.id
```

| JOIN 组 | 作用 |
|---|---|
| `ct2` + `t2`（内连接） | 筛选：卡必须有 tagName 才进入结果 |
| `ct` + `t`（左连接） | 聚合：拿这张卡的**所有**标签 |

**记住这个技巧**：SQL 里"筛选条件"和"展示数据"可以通过**多组 JOIN 别名**分离。



## 18. 前端对接阶段 — 列表字段对齐 + 公开用户主页

完成 PLAN §6.1 / §6.2 / §6.5 明确要求但早期实现漏掉的点。改动仅限 SQL 扩展 + 一个 10 行的轻量接口，**不动任何已通过测试的业务流程**。

### 改动总览

| 改动 | 文件 | 性质 |
|---|---|---|
| 新增 `GET /api/users/:id` 公开用户主页基础信息 | `auth.controller.ts` 追加 handler；新建 `routes/users.ts` | 新增接口（复用已有 `findUserById`） |
| `getCardList` 返回扩展 `author / likes_count / favorites_count` | `card.model.ts` | SQL 加 JOIN + 子查询 |
| `getCardById` 返回扩展 `author / likes_count / favorites_count / liked_by_me / favorited_by_me` | `card.model.ts` | SQL 加 JOIN + 子查询 |
| `getCardsByTag` 字段与 `/api/cards` 对齐 | `tag.model.ts` | SQL 加 JOIN + 子查询 |
| `getUserFavoriteCards` 字段与 `/api/cards` 对齐 | `social.model.ts` | SQL 加 JOIN + 子查询 |
| `sort=most_liked` 真按点赞数排序（原本落在 created_at） | `card.model.ts` | ORDER BY 改一行 |

**设计原则：**
- 不新增复杂接口（关注、私信等 PLAN §7.3 明确不做的功能）
- 三个「卡片列表类」接口返回字段统一，前端写一套渲染逻辑就够
- 列表不带 `liked_by_me / favorited_by_me`（列表 UI 只显示计数，不显示状态），避免每条卡多两个 EXISTS 子查询
- 详情保留 `liked_by_me / favorited_by_me`（按钮需要显示"已点赞/已收藏"状态）

---

### 18.1 GET /api/users/:id — 公开查看用户基础信息

PLAN §6.2 要求 `/user/:id` 是**公开主页**（任何人都能看）。`findUserById` 在 `user.model.ts` 已存在，本次只做两件事：过滤敏感字段 + 挂上路由。

**`src/controllers/auth.controller.ts`** 追加（而非新建 controller）：

```ts
// GET /api/users/:id — 查看任意用户的公开信息（无需登录）
export const getUserPublicInfoHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "无效的用户 ID" });
    return;
  }
  const user = await findUserById(id);
  if (!user) {
    res.status(404).json({ error: "用户不存在" });
    return;
  }
  // 过滤：不返回 email（隐私）和 password_hash（机密）
  const { password_hash, email, ...publicFields } = user;
  res.status(200).json(publicFields);
};
```

**`src/routes/users.ts`**（新建）：

```ts
import { Router } from "express";
import { getUserPublicInfoHandler } from "../controllers/auth.controller.js";

const router = Router();
router.get("/:id", getUserPublicInfoHandler);
export default router;
```

**`src/index.ts`**（挂载顺序有讲究）：

```ts
app.use('/api/users', usersRouter)   // ⚠️ 必须放在 socialRouter 之前
app.use('/api/auth', authRouter)
app.use('/api/cards', cardsRouter)
app.use('/api', socialRouter)        // socialRouter 里还有 /users/:id/favorites
app.use('/api/stats', statsRouter)
app.use('/api/tags', tagsRouter)
```

**为什么顺序重要**：`socialRouter` 以 `/api` 为前缀，内部有 `/users/:id/favorites`，会匹配 `/api/users/...` 路径。`usersRouter` 必须先注册：
- 请求 `/api/users/3` → 进 `usersRouter`，匹配 `/:id`，返回用户
- 请求 `/api/users/3/favorites` → 进 `usersRouter`，`/:id` 不匹配两段路径，`next()` 后走到 `socialRouter` 的 `/users/:id/favorites`

**返回示例**：

```json
{
  "id": 3,
  "username": "Tom",
  "nickname": "汤姆",
  "avatar": "https://example.com/avatar.png",
  "bio": "喜爱 Vue 和 TypeScript",
  "created_at": "2025-11-01T12:00:00.000Z",
  "updated_at": "2025-11-01T12:00:00.000Z"
}
```

**设计要点**：
- **不为 1 个 handler 单开 controller 文件**。`auth.controller.ts` 里已有 `getUserInfo` / `updateUserInfo`，都是操作 `user.model` 的 handler，新 handler 加进来语义一致。
- **不返回 email**：PLAN §5.2 的 `/api/auth/me` 返回 email 是"查自己"，`/api/users/:id` 是"查别人"，邮箱属于隐私。

---

### 18.2 getCardList 扩展返回（首页列表用）

PLAN §6.1 要求首页卡片展示"标题、类型标签、内容摘要、标签、**点赞数**、**作者**、时间"。原 SQL 只返回 `c.* + tags`，补齐 author 和 counts：

```sql
SELECT 
  c.*,
  COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags,
  json_build_object(
    'id', u.id,
    'username', u.username,
    'nickname', u.nickname,
    'avatar', u.avatar
  ) AS author,
  (SELECT COUNT(*) FROM likes WHERE card_id = c.id)::int AS likes_count,
  (SELECT COUNT(*) FROM favorites WHERE card_id = c.id)::int AS favorites_count
FROM cards c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN card_tags ct ON c.id=ct.card_id
LEFT JOIN tags t ON ct.tag_id=t.id
${tagJoin}
${where}
GROUP BY c.id, u.id
${orderBy}
LIMIT $${paramsIndex} OFFSET $${paramsIndex + 1}
```

**几个关键点**：

- **`LEFT JOIN users u`**：即使作者账号被删（外键 CASCADE 级联删卡，理论上不会出现孤儿卡），LEFT JOIN 也能安全返回
- **`GROUP BY c.id, u.id`**：SELECT 里有非聚合的 `u.*` 字段，必须加 users 主键到 GROUP BY
- **`(SELECT COUNT(*) ... )::int`**：PG 的 COUNT 返回 BIGINT（在 pg 驱动里是字符串），`::int` 直接转成 JS 能用的整数，前端不用 parseInt
- **`json_build_object`**：把作者信息打包成嵌套对象，前端拿到 `card.author.nickname` 直接用

### 18.3 getCardById 扩展返回（详情页用）

详情比列表多 `liked_by_me` 和 `favorited_by_me`（按钮 toggle 需要）以及 `author.bio`：

```sql
SELECT 
  c.*,
  COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags,
  json_build_object(
    'id', u.id,
    'username', u.username,
    'nickname', u.nickname,
    'avatar', u.avatar,
    'bio', u.bio                 -- 详情多 bio，列表不要
  ) AS author,
  (SELECT COUNT(*) FROM likes WHERE card_id = c.id)::int AS likes_count,
  (SELECT COUNT(*) FROM favorites WHERE card_id = c.id)::int AS favorites_count,
  EXISTS(SELECT 1 FROM likes WHERE card_id = c.id AND user_id = $2) AS liked_by_me,
  EXISTS(SELECT 1 FROM favorites WHERE card_id = c.id AND user_id = $2) AS favorited_by_me
FROM cards c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN card_tags ct ON c.id = ct.card_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE c.id = $1
GROUP BY c.id, u.id
```

**函数签名扩展**：

```ts
// currentUserId 可选：未登录 / 内部复用时传 undefined，默认 0（EXISTS 不会匹配）
export const getCardById = async (id: number, currentUserId?: number) => {
  const cardResult = await pool.query(
    `...`,
    [id, currentUserId || 0]
  );
  return cardResult.rows[0];
};
```

**controller 层调整**：

```ts
// getCardDetailHandler
const userId = (req as any).userId;           // 可能 undefined（未登录）
const card = await getCardById(Number(req.params.id), userId);
```

`createCard` / `updateCard` 内部复用时不传 `currentUserId`，`liked_by_me / favorited_by_me` 默认 false——对"刚创建/更新的卡"完全合理（作者不会给自己点赞）。

---

### 18.4 sort=most_liked 修复

原 `sort === "most_liked"` 分支实际是按 `c.created_at DESC`，注释承认"后面做点赞功能再改"。现在 SELECT 里有 `likes_count` 字段，ORDER BY 可以直接引用：

```ts
const orderBy =
  sort === "most_liked"
    ? "ORDER BY likes_count DESC, c.created_at DESC"    // ← 真按点赞排
    : "ORDER BY c.is_pinned DESC, c.created_at DESC";
```

第二排序条件 `c.created_at DESC` 处理"点赞数相同"的情况，确保结果稳定。

---

### 18.5 getCardsByTag 字段对齐

PLAN §5.4 原文"卡片数组（支持分页，同 GET /api/cards 格式）"——格式应和列表一致。原 SQL 缺 author 和 counts，补齐：

```sql
SELECT 
  c.*,
  COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags,
  json_build_object(
    'id', u.id,
    'username', u.username,
    'nickname', u.nickname,
    'avatar', u.avatar
  ) AS author,
  (SELECT COUNT(*) FROM likes WHERE card_id = c.id)::int AS likes_count,
  (SELECT COUNT(*) FROM favorites WHERE card_id = c.id)::int AS favorites_count
FROM cards c
LEFT JOIN users u ON c.user_id = u.id
-- 原有的双组 JOIN 筛选逻辑（见 §17）保持不变
JOIN card_tags ct2 ON c.id = ct2.card_id
JOIN tags t2 ON ct2.tag_id = t2.id AND t2.name = $1
LEFT JOIN card_tags ct ON c.id = ct.card_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE c.visibility = 'public'
GROUP BY c.id, u.id
ORDER BY c.created_at DESC
LIMIT $2 OFFSET $3
```

只在 SELECT 列里加字段 + FROM 后加一个 `LEFT JOIN users u`，**不动**已有的 `ct2/t2 + ct/t` 双组 JOIN（那是 §17 解决"标签筛选 vs 所有标签聚合"的经典技巧）。

---

### 18.6 getUserFavoriteCards 字段对齐

`GET /api/users/:id/favorites` 同样补齐 author 和 counts，保留原有的 `favorited_at`（收藏时间）：

```sql
SELECT 
  c.*,
  COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),'[]') AS tags,
  json_build_object(
    'id', u.id,
    'username', u.username,
    'nickname', u.nickname,
    'avatar', u.avatar
  ) AS author,
  (SELECT COUNT(*) FROM likes WHERE card_id = c.id)::int AS likes_count,
  (SELECT COUNT(*) FROM favorites WHERE card_id = c.id)::int AS favorites_count,
  f.created_at AS favorited_at
FROM favorites f
JOIN cards c ON f.card_id = c.id
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN card_tags ct ON c.id = ct.card_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE f.user_id = $1
GROUP BY c.id, u.id, f.created_at
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3
```

---

### 18.7 三个列表接口返回字段对比

| 字段 | `/api/cards` | `/api/tags/:name/cards` | `/api/users/:id/favorites` |
|---|---|---|---|
| `c.*`（title / content / type / visibility 等）| ✓ | ✓ | ✓ |
| `tags` | ✓ | ✓ | ✓ |
| `author` | ✓ | ✓ | ✓ |
| `likes_count` | ✓ | ✓ | ✓ |
| `favorites_count` | ✓ | ✓ | ✓ |
| `favorited_at` | — | — | ✓（独有）|

三个列表字段基本统一。**前端只需要一套 CardItem 组件**就能渲染所有三个列表接口的数据。

---

### 18.8 为什么 list 不带 liked_by_me / favorited_by_me

两个考虑：

1. **Mockup 列表只显示数字**（`❤ 24  ☆ 12`），不显示"你是否点过"。列表 UI 没有这个需求。
2. **EXISTS 子查询的性能成本**：每条卡 2 个 EXISTS，20 条列表 = 40 次子查询。详情页一次查 1 张卡，加 2 次查询可接受；列表放大 20 倍就浪费。

所以**按页面实际需要放字段**：列表要的给，不要的不给。

---

### 18.9 `getCardById` 被内部复用的情况

`delete / pin / visibility / update / review` 这几个 handler 在操作前都会调一次 `getCardById(id)` 验证"卡存在 + 作者身份"，不关心 `author / counts / liked_by_me`。

它们仍然跑完整的 SQL 查询——多出几个 JOIN 和子查询，**单行查询下性能开销可忽略**（毫秒级）。没有为此拆出 `findCardOwner` 轻量版，保持最小改动。

---

### 18.10 架构梳理（当前状态）

| model 文件 | 对应 controller | 涉及路由前缀 |
|---|---|---|
| `user.model.ts` | `auth.controller.ts` | `/api/auth/*` + `/api/users/:id` |
| `card.model.ts` | `cards.controller.ts` | `/api/cards/*` |
| `tag.model.ts` | `tags.controller.ts` | `/api/tags/*` |
| `social.model.ts` | `social.controller.ts` | `/api/cards/:id/like` + `/api/users/:id/favorites` |
| `stats.model.ts` | `stats.controller.ts` | `/api/stats/*` |

`auth.controller.ts` 命名是早期沿用（原本只有 register/login），现在承担所有 user 相关 handler（认证 / 管理自己 / 查看他人）。为避免破坏已测试的 import，没有重命名。

---

### 18.11 Apifox 补充测试建议

旧用例不会失败（返回字段**多**了不会让旧断言 fail），但建议为新字段加断言：

- `GET /api/cards` 返回每张卡应含 `author.nickname / author.avatar / likes_count / favorites_count`，**不应**含 `liked_by_me / favorited_by_me`
- `GET /api/cards/:id` 返回应含 `liked_by_me / favorited_by_me / author.bio`
- `GET /api/cards?sort=most_liked&limit=5` 返回按 `likes_count` 降序排列
- `GET /api/users/:id` 返回字段**不含** `email / password_hash`
- `GET /api/users/99999` 返回 404
- `GET /api/users/:id/favorites` 返回的每张卡有 `author` 和 `likes_count` 字段
- `GET /api/tags/:name/cards` 同上

---

合计约 50 行代码（不含注释）。全部改动已通过 `tsc --noEmit` 类型检查 + 实际接口请求验证（7 项）。