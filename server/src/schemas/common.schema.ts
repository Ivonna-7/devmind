import { z } from "zod";

// 通用路径参数 :id —— 正整数（点赞/收藏的卡片 id、收藏列表的用户 id 等共用）
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("无效的 ID"),
});

// 通用分页查询（page/limit/keyword 均可选，controller 有默认值）
// limit 不设上限：前端收藏/个人主页会传 limit=100，controller 内部 Math.min(,50) 夹住
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive("page 必须是正整数").optional(),
  limit: z.coerce.number().int().positive("limit 必须是正整数").optional(),
  keyword: z.string().optional(),
});

// 统计标签查询（GET /stats/tags）—— 仅 limit
export const limitQuerySchema = z.object({
  limit: z.coerce.number().int().positive("limit 必须是正整数").optional(),
});
