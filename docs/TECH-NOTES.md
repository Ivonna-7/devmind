# 技术选型参考

项目中用到的技术、工具的背景资料和选型依据。

---

## 数据库：PostgreSQL

选择 PostgreSQL，托管平台使用 Supabase（免费 500MB，2 个项目）。

### DB-Engines 排名（2026 年 4 月）

| 排名 | 数据库 | 分数 | 年增长 |
|------|--------|------|--------|
| 1 | Oracle | 1158 | -73 |
| 2 | MySQL | 858 | -129 |
| 3 | SQL Server | 702 | -83 |
| 4 | PostgreSQL | 681 | +14 |
| 5 | MongoDB | 385 | +1 |

前五中只有 PostgreSQL 在涨。

PostgreSQL 连续 3 年最受欢迎 + 最受喜爱 + 最想学。

### 选型原因

- 开源免费，永不收费
- 社区活跃，行业趋势向上
- 功能丰富：JSON 查询、全文搜索
- 免费托管平台多：Supabase、Neon、Vercel Postgres

---

## SQL 建表语法速查

### 关键字说明

| 关键字 | 含义 | 示例 |
|---|---|---|
| SERIAL PRIMARY KEY | 自增整数 + 主键（唯一身份标识，自动 +1） | `id SERIAL PRIMARY KEY` |
| NOT NULL | 不能为空，必填字段 | `username VARCHAR(50) NOT NULL` |
| UNIQUE | 不能重复 | `email VARCHAR(255) UNIQUE` |
| DEFAULT | 默认值，不填时自动使用 | `visibility VARCHAR(10) DEFAULT 'private'` |
| REFERENCES table(col) | 外键，值必须在另一张表中存在 | `user_id INTEGER REFERENCES users(id)` |
| ON DELETE CASCADE | 级联删除，主记录删了关联数据也自动删 | `REFERENCES users(id) ON DELETE CASCADE` |
| PRIMARY KEY (a, b) | 联合主键，两字段组合不能重复，一张表只能有一个主键 | `PRIMARY KEY (card_id, tag_id)` |
| UNIQUE(a, b) | 联合唯一约束，两字段组合不能重复，可设多个 | `UNIQUE(user_id, card_id)` |

### VARCHAR 长度选择经验

| 长度 | 适用场景 |
|---|---|
| VARCHAR(50) | 用户名、昵称等短文本 |
| VARCHAR(200) | 标题 |
| VARCHAR(255) | 邮箱、密码哈希（行业习惯值） |
| VARCHAR(500) | URL 链接 |
| TEXT | 长度不可预测的内容（正文、简介等） |

> VARCHAR 按实际内容占空间，设 255 不会比设 50 多占空间。长度不好定就用 TEXT。

### PostgreSQL 常用字段类型

#### 数字

| 类型 | 说明 | 范围 |
|---|---|---|
| SERIAL | 自增整数（建表专用） | 1 ~ 21 亿 |
| INTEGER | 普通整数 | -21 亿 ~ 21 亿 |
| BIGINT | 大整数 | ±922 亿亿 |
| NUMERIC(10,2) | 精确小数（比如钱） | 自定义精度 |
| BOOLEAN | 布尔值 | true / false |

#### 文本

| 类型 | 说明 | 上限 |
|---|---|---|
| VARCHAR(n) | 限长字符串 | 最多 n 个字符 |
| TEXT | 不限长字符串 | 约 1GB |
| CHAR(n) | 固定长度，不够补空格 | 很少用 |

#### 时间

| 类型 | 说明 | 示例 |
|---|---|---|
| TIMESTAMP | 日期 + 时间 | 2026-04-22 10:30:00 |
| DATE | 只有日期 | 2026-04-22 |
| TIME | 只有时间 | 10:30:00 |

#### 其他

| 类型 | 说明 |
|---|---|
| JSON / JSONB | 存 JSON 对象，JSONB 可查询更快 |
| UUID | 通用唯一标识符 |
| BYTEA | 二进制数据 |

> 本项目用到：SERIAL、INTEGER、VARCHAR、TEXT、BOOLEAN、TIMESTAMP，覆盖 90% 场景。

---

## SQL 查询语法速查

### JOIN（联表查询）

| 语法 | 含义 |
|---|---|
| LEFT JOIN table ON ... | 左边表为主，把右边表拼过来（没匹配到的用 NULL） |
| JOIN table ON ... | 内连接，只返回两边都匹配的行 |
| ON a.id = b.a_id | JOIN 的匹配条件（决定怎么拼） |
| WHERE ... | 拼完之后的筛选条件（决定返回哪些行） |

执行顺序：先 FROM/JOIN 拼表 → 再 WHERE 筛选 → 最后 SELECT 选字段

### 聚合与分组

| 语法 | 含义 |
|---|---|
| GROUP BY c.id | 按字段分组合并（相同 id 的行合成一行） |
| json_agg(t.name) | 把多个值聚合成 JSON 数组 |
| FILTER(WHERE t.name IS NOT NULL) | 聚合时过滤空值 |
| COALESCE(value, '[]') | 如果 value 是 NULL，返回默认值 |
| COUNT(DISTINCT c.id) | 去重计数 |

### 模糊搜索

| 语法 | 含义 |
|---|---|
| LIKE '%keyword%' | 模糊匹配（区分大小写） |
| ILIKE '%keyword%' | 模糊匹配（不区分大小写，PostgreSQL 特有） |
| % | 通配符，匹配任意字符 |

### 分页

```sql
LIMIT 20 OFFSET 0    -- 第 1 页（取 20 条，跳过 0 条）
LIMIT 20 OFFSET 20   -- 第 2 页（取 20 条，跳过 20 条）
LIMIT 20 OFFSET 40   -- 第 3 页（取 20 条，跳过 40 条）
```

公式：`offset = (page - 1) * limit`

### Upsert（插入或更新）

```sql
INSERT INTO tags (name) VALUES ($1)
ON CONFLICT (name) DO UPDATE SET name = $1
RETURNING id
```

含义：尝试插入，如果唯一约束冲突就更新，最后返回 id。

### 排序

| 语法 | 含义 |
|---|---|
| ORDER BY created_at DESC | 降序（最新在前） |
| ORDER BY created_at ASC | 升序（最旧在前） |
| ORDER BY a DESC, b ASC | 先按 a 降序，a 相同再按 b 升序 |

### 别名

```sql
FROM cards c                -- c 是 cards 表的别名
LEFT JOIN tags t            -- t 是 tags 表的别名
SELECT c.*, t.name AS tags  -- AS 给字段起别名
```

命名习惯：取表名首字母（cards→c, tags→t, card_tags→ct, users→u）

---

## SQL 进阶语法（Cards 模块用到）

### CASE 表达式

SQL 里的条件分支，类似 JS 的三元/switch，有两种用法。

#### 用法 1：作为值表达式（UPDATE/SELECT）

```sql
UPDATE cards SET visibility = CASE
  WHEN visibility = 'private' THEN 'public'
  ELSE 'private'
END
```

等价于 JS：`visibility === 'private' ? 'public' : 'private'`

#### 用法 2：作为排序键（ORDER BY）

```sql
ORDER BY CASE mastery
  WHEN 'new'      THEN 1
  WHEN 'fuzzy'    THEN 2
  WHEN 'remember' THEN 3
  WHEN 'master'   THEN 4
END ASC
```

把字符串映射成数字来排序，实现"按优先级排列"的效果。

#### 关键点

- `END` 是 CASE 的闭合符，**不能省略**（类似 JS 的 `}`）
- 没有 `ELSE` 时，未匹配的值会返回 NULL

---

### NOT 运算符（翻转布尔）

```sql
UPDATE cards SET is_pinned = NOT is_pinned WHERE id = $1
```

一句话翻转布尔值，省去"先查询再判断再更新"的三步。仅适用于 BOOLEAN 字段，字符串要用 CASE。

---

### RETURNING 子句

UPDATE / INSERT / DELETE 后直接返回被修改的行，省去再 SELECT 一次。

```sql
-- 基础用法
UPDATE cards SET is_pinned = NOT is_pinned WHERE id = $1 RETURNING is_pinned
-- 返回所有字段
INSERT INTO cards (...) VALUES (...) RETURNING *
-- 返回多个字段
UPDATE cards SET mastery = $1, last_reviewed_at = NOW() WHERE id = $2 RETURNING mastery, last_reviewed_at
```

**注意**：多个字段之间要加逗号，漏了逗号 PostgreSQL 会把后面的字段当别名。

---

### COALESCE 做部分更新（PATCH/PUT 模式）

```sql
UPDATE cards SET
  title   = COALESCE($1, title),
  content = COALESCE($2, content),
  ...
WHERE id = $7
```

**语义**：`COALESCE(A, B)` 返回 A 或 B 中第一个非 NULL 的值。

**应用**：前端没传某个字段时，传 `null`/`undefined` 给后端，COALESCE 就保留原值；传了新值就覆盖。一条 SQL 支持任意字段组合的部分更新。

---

### ORDER BY 的 NULLS FIRST / NULLS LAST

```sql
ORDER BY last_reviewed_at ASC NULLS FIRST
```

默认情况下 PostgreSQL 把 NULL 当作"最大值"（ASC 时排最后，DESC 时排最前）。`NULLS FIRST` 显式指定 NULL 排最前，`NULLS LAST` 指定排最后。

**典型场景**：查询"从没复习过的卡片优先"—— `last_reviewed_at = NULL` 的排最前。

---

## Express 中间件模式

### 中间件的三个出路

```ts
export const middleware = async (req, res, next) => {
  // 出路 1：放行 → 请求继续到 controller
  next();

  // 出路 2：拦截 → 直接返回响应给前端
  res.status(401).json({ error: "..." });

  // 出路 3：抛错 → 进入全局错误处理中间件
  throw new Error("...");
};
```

### 强制 vs 可选鉴权

两种鉴权模式对应不同业务：

| 中间件 | 没 token 时 | 适用场景 |
|---|---|---|
| 强制 auth | 401 拦截 | 写操作（创建/修改/删除） |
| 可选 auth | 放行不拒绝 | 公开可读 + 可选私有内容（如首页卡片流） |

**关键区别**：可选鉴权的所有分支都会调 `next()`，只是决定"要不要设置 req.userId"。

### 路由挂中间件

```ts
router.post("/",     authMiddleWare, createHandler);    // 必须登录
router.get("/",      optionalAuth,   listHandler);      // 可选登录
router.get("/public", listHandler);                     // 不需要登录
```

中间件写在 handler 前面，按顺序执行；多个中间件可以链式挂：`router.get("/x", mw1, mw2, handler)`。

---

## HTTP 请求数据的三种位置

后端从请求里取数据时，要区分数据来自哪里。不是所有东西都在 body 里。

### 三种数据来源

| 类型 | 位置 | 来源 | 例子 |
|---|---|---|---|
| Path 参数 | URL 路径 | `req.params` | `/api/cards/:id` 里的 `:id` |
| Query 参数 | URL `?` 后面 | `req.query` | `/api/cards?user_id=3` |
| Body 参数 | 请求体 | `req.body` | POST/PUT 时传的 JSON |

### 常见误解

**"POST 接口参数都在 body 里"** ❌

HTTP 方法（POST/GET 等）**只决定能不能带 body**，不影响 path 和 query 参数。POST 接口一样可以有 path 参数和 query 参数。

### 典型组合例子

接口：`POST /api/cards/:id/review?notify=true`
Body: `{ "mastery": "fuzzy" }`

后端取数据：
```ts
const id = Number(req.params.id);        // path: 123
const notify = req.query.notify;         // query: "true"
const { mastery } = req.body;            // body: "fuzzy"
```

三种数据共存，各司其职。

### RESTful 设计约定

| 数据性质 | 放哪里 |
|---|---|
| 资源 id（操作的是哪个） | path 参数 |
| 筛选/排序/分页等修饰 | query 参数 |
| 要创建/更新的内容 | body |

反例：`POST /api/cards/review` 然后 body 里传 `{ id, mastery }` —— 不 RESTful，id 应该在路径里。

正例：`POST /api/cards/123/review` + body `{ mastery }` —— URL 一眼看出在操作哪张卡。

---

## HTTP 状态码速查（RESTful 常用）

### 成功响应（2xx）

| 状态码 | 名字 | 语义 | 响应体 |
|---|---|---|---|
| **200** OK | 成功 | 通用成功 | 可以带数据 |
| **201** Created | 已创建 | POST 创建资源成功 | 可以带新资源信息 |
| **204** No Content | 无内容 | 成功但没内容返回 | **必须为空** |

### CRUD 操作对应的状态码

| 操作 | 状态码 | 备注 |
|---|---|---|
| POST 创建成功 | **201** | 返回新创建的资源 |
| DELETE 删除成功 | **204** | 响应体必须为空 |
| GET 查询成功 | **200** | 返回查询结果 |
| PUT/PATCH 更新成功 | **200** 或 **204** | 带新对象用 200，不返回用 204 |

### 错误响应（4xx / 5xx）

| 状态码 | 名字 | 场景 |
|---|---|---|
| **400** Bad Request | 参数不合法 | 请求格式错误、字段缺失 |
| **401** Unauthorized | 未认证 | 未登录、token 无效/过期 |
| **403** Forbidden | 无权限 | 已登录但没权限访问 |
| **404** Not Found | 资源不存在 | 找不到请求的资源 |
| **409** Conflict | 冲突 | 唯一约束冲突（重复创建） |
| **500** Internal Server Error | 服务器错误 | 后端未捕获异常 |

### 关键点

**1. 204 的响应体必须为空**

```ts
res.status(204).send();         // ✅ 正确
res.status(204).json({...});    // ❌ 违反 HTTP 规范
```

**2. 401 vs 403 的区别**

- **401** = "我不知道你是谁"（没登录或 token 无效）
- **403** = "知道你是谁，但你没资格"（已登录但没权限）

**3. 404 vs 403 的取舍**

私有资源被非作者访问时，有两种做法：
- 返回 **403** = "明确告诉攻击者这东西存在但你没权限"
- 返回 **404** = "就当不存在，不暴露资源是否存在"（防信息泄露）

本项目对私有卡采用 **404** 策略（更安全）。

---

## SQL JOIN 类型详解

### 四种 JOIN 对照

用两张小表演示（users 和 cards）：

**`users`**：
| id | name |
|---|---|
| 1 | Alice |
| 2 | Bob |
| 3 | Carol |

**`cards`**：
| id | user_id | title |
|---|---|---|
| 10 | 1 | Alice 的卡 |
| 11 | 2 | Bob 的卡 |
| 12 | 99 | 孤儿卡（user_id 不存在）|

场景：Carol 没卡（id=3），孤儿卡没对应用户（user_id=99）。

#### 1. INNER JOIN（= `JOIN`）

**语义**：两边都匹配的行才要。

```sql
FROM users u JOIN cards c ON u.id = c.user_id
```

结果：
| name | title |
|---|---|
| Alice | Alice 的卡 |
| Bob | Bob 的卡 |

Carol 没卡，不出现；孤儿卡没用户，不出现。

#### 2. LEFT JOIN（= LEFT OUTER JOIN）

**语义**：左边（FROM 表）全要，右边没匹配填 NULL。

```sql
FROM users u LEFT JOIN cards c ON u.id = c.user_id
```

结果：
| name | title |
|---|---|
| Alice | Alice 的卡 |
| Bob | Bob 的卡 |
| **Carol** | **NULL** |

Carol 出现了（左边）。孤儿卡还是不出现（右边）。

#### 3. RIGHT JOIN

语义反过来：右表全要，左表 NULL。实际很少用，通常把表位置对调改 LEFT JOIN 更清晰。

#### 4. FULL JOIN

两边全要，都没匹配就互相 NULL。也很少用。

---

### 判断用哪种的口诀

问自己：**没匹配到的行，我还想要吗？**

| 需求 | 用什么 |
|---|---|
| 两边都必须匹配 | `JOIN`（INNER） |
| 左边（FROM 表）的行可以没匹配 | `LEFT JOIN` |
| 右边的可以没匹配 | 把表位置对调 + `LEFT JOIN` |

---

### 本项目的 JOIN 选择参考

| 场景 | 选型 | 理由 |
|---|---|---|
| 查卡片 + 标签（标签可为空）| `LEFT JOIN card_tags / tags` | 没标签的卡也要显示 |
| 查"带某标签"的卡 | `JOIN card_tags / tags`（INNER）| 没这标签的卡本就不该出现 |
| 查 likes + cards 统计被赞数 | `JOIN cards` | 不存在孤儿 like（CASCADE 约束） |
| 查 favorites + cards | 同上 | 同理 |

---

### 经典陷阱：LEFT JOIN + WHERE 过滤右表 = 失效

```sql
-- ❌ 错误
FROM users u
LEFT JOIN cards c ON u.id = c.user_id
WHERE c.title IS NOT NULL    -- 这里过滤会干掉 LEFT JOIN 的容忍度
```

LEFT JOIN 本来让 Carol（没卡的用户）也出现，但 Carol 那行 c.title 是 NULL，被 WHERE 过滤掉了——LEFT JOIN 白写了。

**正确做法**：过滤条件写在 ON 里：

```sql
-- ✅ 正确
FROM users u
LEFT JOIN cards c ON u.id = c.user_id AND c.title IS NOT NULL
```

这样 Carol 还能出现，她的 c.title 保持 NULL。

---

### 记住三条

1. **两边都必须有 → `JOIN`**
2. **一边可以空 → `LEFT JOIN`**（把那边放 FROM）
3. **LEFT JOIN 后别对右表字段加 WHERE 过滤**，会让 LEFT JOIN 失效

---

## SQL 执行顺序

但 SQL 一条语句是一次性的，不能中途"停下来，用临时结果再做别的"。

一条 SELECT 语句整个执行流：

```
FROM + JOIN         → 拼出宽表
WHERE               → 删掉不符合条件的行
GROUP BY            → 对剩下的行分组
SELECT + json_agg   → 聚合成最终结果
```

---

## PostgreSQL 类型转换 `::type`

PostgreSQL 特有的简写语法，用于类型转换（等价于标准 SQL 的 `CAST(... AS type)`）。

### 语法

```sql
表达式::目标类型

-- 等价于标准写法
CAST(表达式 AS 目标类型)
```

### 项目中的用法：`::int`

```sql
(SELECT COUNT(*) FROM likes WHERE card_id = c.id)::int AS likes_count
```

**为什么要转**：

PG 的 `COUNT(*)` 返回类型是 `BIGINT`（8 字节大整数）。pg 驱动传到 Node.js 时，BIGINT 会变成**字符串** `"1"` 而不是数字 `1`——因为 JS 的 Number 精度（2^53）不够表示所有 BIGINT 值（2^63）。

加 `::int` 后，PG 先把结果转成普通 `INTEGER`（4 字节），pg 驱动就会传回 JS 数字 `1`，前端直接用。

**对比之前的做法**（不加 `::int`，JS 层手动转）：

```ts
// 没有 ::int 时，pg 驱动返回的是字符串
const total_cards = parseInt(totalResult.rows[0].count); // "42" → 42
```

两种方式都行：
| 方式 | 在哪层处理 | 效果 |
|---|---|---|
| `::int` | SQL 层 | pg 驱动直接传回数字 |
| `parseInt()` | JS 层 | SQL 返回字符串，手动转 |

### 常见转换

```sql
'123'::int          -- 字符串 → 整数
NOW()::date         -- 时间戳 → 日期（去掉时分秒）
3.14::text          -- 数字 → 字符串
'true'::boolean     -- 字符串 → 布尔
```

---

## SQL EXISTS 子查询

`EXISTS` 用于判断"某条记录是否存在"，返回布尔值 `true / false`。

### 语法

```sql
EXISTS(SELECT ... FROM ... WHERE ...)
```

只要子查询能查到**至少 1 行**，就返回 `true`；否则 `false`。

### 项目中的用法：判断当前用户是否点赞/收藏过

```sql
EXISTS(SELECT 1 FROM likes WHERE card_id = c.id AND user_id = $2) AS liked_by_me,
EXISTS(SELECT 1 FROM favorites WHERE card_id = c.id AND user_id = $2) AS favorited_by_me
```

翻译成人话：**"likes 表里有没有一条记录，是当前用户（$2）点赞了这张卡（c.id）？"**

- 有 → `true`（前端显示"已点赞"红心）
- 没有 → `false`（前端显示空心）

### 逐部分解释

| 部分 | 含义 |
|---|---|
| `EXISTS(...)` | 子查询有行 → true，无行 → false |
| `SELECT 1` | 查什么不重要（1 / * / 'x' 都行），EXISTS 只关心"有没有行" |
| `WHERE card_id = c.id` | 匹配外层查询的当前这张卡 |
| `AND user_id = $2` | 匹配当前登录用户 |
| `AS liked_by_me` | 给布尔结果起别名，前端读 `card.liked_by_me` |

### 为什么用 EXISTS 而不是 COUNT

```sql
-- ❌ 能实现，但慢：要把所有匹配行数完
(SELECT COUNT(*) FROM likes WHERE card_id = c.id AND user_id = $2) > 0

-- ✅ EXISTS 更快：找到第一条匹配就立即返回 true，不继续扫
EXISTS(SELECT 1 FROM likes WHERE card_id = c.id AND user_id = $2)
```

**性能差异**：EXISTS 是"短路"操作——找到一条就停。COUNT 必须扫完所有匹配行再计数。对"判断有没有"这种场景，EXISTS 是最优解。

### 前端拿到的效果

```json
{
  "title": "闭包的原理",
  "likes_count": 24,
  "liked_by_me": true,
  "favorited_by_me": false
}
```

详情页按钮据此渲染：`liked_by_me: true` → 点赞按钮高亮红色；`favorited_by_me: false` → 收藏按钮空心。

---

## 前端 UI 组件库对比

| | Element Plus | Naive UI | Ant Design Vue |
|---|---|---|---|
| 组件完整度 | 最全 | 够用 | 全 |
| TS 体验 | 后补的类型 | TS 原生编写，最好 | 中等 |
| 主题定制 | 覆盖 CSS 变量 / SCSS，较麻烦 | JS 对象 `themeOverrides`，最优雅 | 设计语言强势，改动成本最高 |
| 暗色主题 | 需额外引入 CSS | 内置，`n-config-provider` 切换 | 支持，配置较重 |
| 设计语言 | 偏后台管理系统 | 中性，易改 | 偏大厂 B 端 |
| 包体积 | 大 | 中（CSS-in-JS 按需） | 最大 |
| 中文资料 | 最多 | 较多 | 多 |

---

## Tailwind 4 `@theme` 与工具类生成

### 核心机制

`@theme` 块不只是定义 CSS 变量。Tailwind 会根据变量名的命名空间前缀，自动生成对应的工具类；`--color-` 前缀表示把后面的名字注册成一个颜色。

```css
@theme {
  --color-ink-900: #1c1917;
}
```

一个变量会生成一整组同色系工具类：

```text
--color-ink-900: #1c1917;
        ↓ 生成
text-ink-900       color
bg-ink-900         background-color
border-ink-900     border-color
ring-ink-900      ring / outline 颜色
divide-ink-900     子元素分隔线颜色
```

### 前缀不能省

如果写成 `--ink-900: #1c1917`，Tailwind 会把它当作普通 CSS 变量。`var(--ink-900)` 仍然可以使用，但 `text-ink-900` 并不存在，写在 HTML 中不会产生任何效果。

项目中的具体影响：`docs/mockups/tokens.css` 原来使用 `--ink-900` 这类名称，并通过 `color: var(--ink-900)` 手写 CSS 消费。迁移到 `@theme` 时，必须为每个 token 改名，补上对应的命名空间前缀。

### 命名空间清单

| 命名空间 | 生成的工具类 | 本项目 |
|---|---|---|
| `--color-*` | `text-*` / `bg-*` / `border-*` / `ring-*` / `divide-*` | 已用 |
| `--font-*` | `font-*` | 已用 |
| `--spacing-*` | `p-*` / `m-*` / `gap-*` / `w-*` / `h-*` | 未用 |
| `--radius-*` | `rounded-*` | 未用 |
| `--text-*` | `text-*`（字号） | 未用 |
| `--shadow-*` | `shadow-*` | 未用 |

未列出的命名空间会回退到 Tailwind 默认值。项目只覆盖颜色和字体，所以默认的间距、圆角、字号比例仍然生效；这就是 `p-10`、`rounded-xl`、`text-4xl` 未在 `@theme` 中定义也能使用的原因。

### 工具类的变体组合

生成的类支持透明度后缀和状态变体，不需要为每种组合额外定义变量：

```html
<div class="bg-brand/10">品牌色 10% 透明度</div>
<a class="text-ink-500 hover:text-brand">悬停变褐金</a>
<h1 class="font-serif text-4xl text-ink-900">三个类叠加</h1>
```

### 其他要点

- Tailwind 4 是 CSS-first 配置，没有 `tailwind.config.js`；`@theme` 直接写在 CSS 里。
- `@import` 顺序：Google Fonts 的 `@import url(...)` 必须位于 `@import "tailwindcss"` 之前，因为 CSS 要求所有 `@import` 都在文件顶部。
- VSCode 内置 CSS 校验不认识 `@theme`，报 `unknownAtRules` 误报，但代码可正常编译。装 Tailwind CSS IntelliSense 扩展不够——扩展激活与语言模式是两件事，内置校验照样跑。
- 解法：`files.associations` 把 `.css` 指给 `tailwindcss` 语言模式，让 Tailwind 扩展接管解析。
- 配置放**仓库根目录** `.vscode/settings.json`。VSCode 只读当前工作区根的 `.vscode/`，放 `client/.vscode/` 就只在单独打开 `client/` 时生效，开根目录无效。
- glob 规则：pattern 不含斜杠只匹配文件名；含斜杠则匹配**绝对路径**。所以 `client/**/*.css` 匹配不到 `.../devmind/client/src/style.css`，须写 `**/client/**/*.css`，或直接用不含斜杠的 `*.css`。

## ESM 中获取目录路径

Vite 的 `resolve.alias` 需要文件系统绝对路径，但 ESM 没有 CommonJS 的 `__dirname`（ESM 要兼容浏览器，浏览器没有文件目录概念），只提供 `import.meta.url`。所以要三层转换：

```ts
import { fileURLToPath } from 'node:url'

alias: {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
}
```

| 步骤 | 结果 | 说明 |
| --- | --- | --- |
| `import.meta.url` | `file:///D:/.../client/vite.config.ts` | 当前模块地址，URL 格式（带协议头、正斜杠、特殊字符百分号编码） |
| `new URL('./src', ...)` | `file:///D:/.../client/src` | 两个参数：相对地址 + 基准。基准是文件时，相对路径从其所在目录算起，`vite.config.ts` 被丢弃换成 `src` |
| `fileURLToPath(...)` | `D:\...\client\src` | 转成本机路径：去协议头、转反斜杠、解码百分号 |

要点：

- `./src` 的 `./` 可省略，但 `/src` 不行 —— 斜杠开头表示从根目录算，与基准无关。
- 本项目路径含中文，URL 形式下会被编码为 `%E5%90%88%E5%90%88`，必须经 `fileURLToPath` 解码，否则 Vite 找不到目录。
- `node:` 前缀显式声明 Node 内置模块，避免被同名 npm 包劫持。
- 别名需在 `vite.config.ts` 和 `tsconfig.app.json`（`baseUrl` + `paths`）两处都配：前者管运行时解析，后者管编辑器跳转和类型检查。
