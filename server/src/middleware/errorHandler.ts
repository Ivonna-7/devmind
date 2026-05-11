import type { Request, Response, NextFunction } from "express";

// 全局错误处理中间件
// Express 约定：4 个参数的中间件就是错误处理器（err, req, res, next）
// 任何 throw 或 Promise reject 的错误都会被 Express 5 自动捕获到这里
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 打印错误堆栈到终端，方便调试
  console.error("❌ 未处理的错误:", err);

  // PostgreSQL 唯一约束冲突 → 409
  if (err.code === "23505") {
    return res.status(409).json({ error: "资源已存在（唯一约束冲突）" });
  }

  // 自定义业务错误（如果 throw new AppError(404, "xxx")，带 statusCode 属性）
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 兜底：未知错误都返回 500
  res.status(500).json({ error: "服务器错误" });
};