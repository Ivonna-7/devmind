import { verifyToken } from "../utils/jwt.js";
import type { Request, Response, NextFunction } from "express";

// 接口鉴权中间件（强制登录：没 token 或 token 无效直接 401）
export const authMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const token =req.headers.authorization?.split(' ')[1]//从"Bearer xx"中取token
    if (!token) {
      return res.status(401).json({
        message: "请先登录",
      });
    }
    try {
      const decoded = verifyToken(token) as { userId: number };
      // 中间件把 userId 挂到了 req 上
      (req as any).userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "token无效或已过期",
      });
    }
};
//可选鉴权中间件（登录可选：有 token 就解析出 userId 挂到 req 上，没 token 或 token 无效都放行，当作游客处理）
export const optionalAuthMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const token =req.headers.authorization?.split(' ')[1]
    if (!token) {
      next();
      return;
    }
    try {
      const decoded = verifyToken(token) as { userId: number };
      (req as any).userId = decoded.userId;
      next();
    }catch (error) {
      next();
      return;
    }
}
