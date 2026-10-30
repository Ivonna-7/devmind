import { z } from "zod";

// 注册：用户名、邮箱、密码都必填且有格式要求
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "用户名至少 2 个字符")
    .max(20, "用户名最多 20 个字符"),
  email: z.email("邮箱格式不正确"),
  password: z
    .string()
    .min(6, "密码至少 6 位")
    .max(64, "密码最多 64 位"),
});

// 登录：只校验邮箱格式和密码非空（具体对不对交给业务逻辑，不在这里判）
export const loginSchema = z.object({
  email: z.email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

// 更新资料：三个字段都可选（允许只改其中一个），但传了就要符合长度
// 加 optional —— 可选，不传也通过
export const updateUserSchema = z.object({
  nickname: z.string().trim().max(20, "昵称最多 20 个字符").optional(),
  avatar: z.url("头像必须是合法 URL").max(500).optional(),
  bio: z.string().max(200, "简介最多 200 个字符").optional(),
});
