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
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, passwordHash);
    const token = generateToken(user.id);
    res.status(201).json({ token, user });
  } catch (error: any) {
    // 用户名或邮箱已存在（PostgreSQL 唯一约束冲突的错误码是 23505）
    if (error.code === "23505") {
      return res.status(409).json({ error: "用户名或邮箱已存在" });
    }
    // 其他错误抛给全局 errorHandler
    throw error;
  }
};

// 登录接口
export const login = async (req: Request, res: Response) => {
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
};

// 获取当前用户信息（需要登录）
export const getUserInfo = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await findUserById(userId);
  if (!user) {
    res.status(404).json({ error: "用户不存在" });
    return;
  }
  const { password_hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};

// 更新用户资料（需要登录）
export const updateUserInfo = async (req: Request, res: Response) => {
  const { nickname, avatar, bio } = req.body;
  const userId = (req as any).userId;
  const user = await updateUser(userId, nickname, avatar, bio);
  if (!user) {
    res.status(404).json({ error: "用户不存在" });
    return;
  }
  const { password_hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};

// GET /api/users/:id — 查看任意用户的公开信息（无需登录）
// 返回 id / username / nickname / avatar / bio / created_at / updated_at
// 不返回 email（隐私）和 password_hash（机密）
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
  const { password_hash, email, ...publicFields } = user;
  res.status(200).json(publicFields);
};