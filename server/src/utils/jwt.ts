import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const SECRET = process.env.JWT_SECRET!; //jwt密钥

// 生成token
export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
};
// 验证token
export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
