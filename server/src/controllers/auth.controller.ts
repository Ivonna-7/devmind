import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
} from "../models/user.model.js";
import type { Request, Response } from "express";

// 注册接口
/**
 * salt rounds（加盐轮数），就是加密的计算次数。
 * bcrypt 加密时会生成一个随机字符串（叫 salt，盐），混到密码里一起哈希。
 * 10 表示这个过程重复 2^10 = 1024 次。
 * 数越大 → 越安全，但越慢
 * 数越小 → 越快，但越容易被暴力破解
 * 10 是行业默认值，安全和性能的平衡点。
 * bcrypt 输出的哈希值固定 60 个字符，不管原始密码多长多短
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body; // 从请求体拿到用户输入
    const passwordHash = await bcrypt.hash(password, 10); // 对密码加密
    const user = await createUser(username, email, passwordHash); // 写入数据库
    const token = generateToken(user.id); // 生成token
    res.status(201).json({ token, user }); // 201 专指"创建了新资源"
  } catch (error: any) {
    // 用户名或邮箱已存在（PostgreSQL 唯一约束冲突的错误码是 23505）
    if (error.code === "23505") {
      res.status(409).json({ error: "用户名或邮箱已存在" });
      return;
    }
    res.status(500).json({ error: "服务器错误" });
  }
};

// 登录接口
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }
    const token = generateToken(user.id);
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};

// 获取当前用户信息（需要登录）
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // 从中间件挂载的 userId 获取，不是 req.body
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ error: "用户不存在" });
      return;
    }
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};

// 更新用户资料（需要登录）
export const updateUserInfo =async (req: Request, res: Response) => { 
  const { nickname, avatar, bio } = req.body;
  try {
    const userId = (req as any).userId;
    const user = await updateUser(userId, nickname, avatar, bio);
    if (!user) {
      res.status(404).json({ error: "用户不存在" });
      return;
    }
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }

};