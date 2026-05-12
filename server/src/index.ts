import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from './config/db.js';
import authRouter from "./routes/auth.js"
import cardsRouter from "./routes/cards.js"
import socialRouter from "./routes/social.js"
import statsRouter from "./routes/stats.js"
import tagsRouter from "./routes/tags.js"
import usersRouter from "./routes/users.js"
import { errorHandler } from "./middleware/errorHandler.js"

// 读取 .env 文件里的配置，加载到 process.env 里
// process 是 Node.js 内置的一个全局对象，代表当前运行的进程。process.env 是它上面挂的一个属性，存放所有环境变量。
dotenv.config();
// 创建一个 Express 应用实例，后面所有路由、中间件都挂在它上面
const app = express();
// 端口号：优先用 .env 里配的，没配就用 3000
const PORT = process.env.PORT || 3000;

/** 中间件：请求进来 → 到达你的路由之前，先经过的一系列处理函数
 * 请求进来 → cors() 处理跨域 → express.json() 解析 body → 你的路由处理
 * 每个中间件处理完自己的事，传给下一个。app.use() 就是往这条流水线上加一道工序
 */
app.use(cors())
// 中间件：解析请求体里的 JSON（不加的话 POST 请求收到的 body 是 undefined）
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: "hello world" })
});
app.use('/api/users', usersRouter)  // 注意：放 socialRouter 前面，避免被 /api 前缀误匹配
app.use('/api/auth', authRouter)
app.use('/api/cards', cardsRouter)
app.use('/api', socialRouter)
app.use('/api/stats', statsRouter)
app.use('/api/tags', tagsRouter)

// ⚠️ 错误处理中间件必须在所有路由之后
// Express 按注册顺序匹配，错误处理器要能捕获前面路由的所有错误，必须最后注册
app.use(errorHandler)

// 启动服务器，监听指定端口
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
pool.query('SELECT NOW()')
  .then(() => console.log('✅ 数据库连接成功'))
  .catch((err) => console.log('❌ 数据库连接失败', err.message));