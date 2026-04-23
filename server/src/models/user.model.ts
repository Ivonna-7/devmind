import pool from "../config/db.js";

// 往 users 表里插一条用户数据，返回新用户信息
// 数据库操作是异步的，要等结果
export const createUser = async (
  username: string,
  email: string,
  passwordHash: string
) => {
  // $1, $2, $3 — 占位符，对应数组里的 [username, email, passwordHash]，防 SQL 注入攻击
  // RETURNING ... — 插入后把新数据返回来（PostgreSQL 特有的，很方便）
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, nickname, avatar, bio",
    [username, email, passwordHash]
  );
  return result.rows[0];
};

// 按邮箱查用户，登录时用
export const findUserByEmail = async (email: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};
// 按id查用户
export const findUserById = async (id: number) => {
  const result = await pool.query("SELECT * FROM users WHERE id =$1 ", [id]);
  return result.rows[0];
};
// 更新用户资料
export const updateUser = async (
  id: number,
  nickname: string,
  avatar: string,
  bio: string
) => {
  const result = await pool.query(
    "UPDATE users SET  nickname = $1, avatar = $2, bio = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, nickname, avatar, bio",
    [nickname, avatar, bio, id]
  );
  return result.rows[0];
};
