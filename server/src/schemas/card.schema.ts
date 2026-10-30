import { z } from "zod";

// 卡片类型 / 可见性 / 难度 / 掌握度的合法取值（与前端 constants 和数据库对齐）
const cardType = z.enum(["note", "question", "bug", "til"]);
const visibility = z.enum(["public", "private"]);
const difficulty = z.enum(["easy", "medium", "hard"]);
const mastery = z.enum(["fuzzy", "remember", "master"]);

// 创建卡片
// answer / difficulty 只有面试题用得上，允许 null 或省略；tags 允许省略，默认空数组
export const createCardSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200, "标题最多 200 字"),
  content: z.string().min(1, "内容不能为空"),
  type: cardType,
  answer: z.string().nullable().optional(),
  visibility: visibility.optional(),
  difficulty: difficulty.nullable().optional(),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(20, "标签最多 20 个")
    .optional(),
});

// 更新卡片：后端 updateCard 模型用 COALESCE 做部分更新，前端类型也是 Partial，
// 所以所有字段都可选（只校验格式，不强制必填）；title/content 传了就不能为空
export const updateCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "标题不能为空")
    .max(200, "标题最多 200 字")
    .optional(),
  content: z.string().min(1, "内容不能为空").optional(),
  type: cardType.optional(),
  answer: z.string().nullable().optional(),
  visibility: visibility.optional(),
  difficulty: difficulty.nullable().optional(),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(20, "标签最多 20 个")
    .optional(),
});

// 复习提交：只收 mastery，且必须是三个合法值之一（原来裸收，可写任意字符串）
export const reviewCardSchema = z.object({
  mastery,
});

// 路径参数 :id —— 统一校验为正整数（用于详情/删除/置顶/改可见性/更新/复习）
export const cardIdParamSchema = z.object({
  id: z.coerce.number().int().positive("无效的卡片 ID"),
});

// 卡片列表查询参数（GET /cards）—— 全部可选（controller 有默认值），只校验格式/范围
// 注：limit 不设上限——前端个人主页会传 limit=100，controller 内部再 Math.min(,50) 夹住
export const cardListQuerySchema = z.object({
  page: z.coerce.number().int().positive("page 必须是正整数").optional(),
  limit: z.coerce.number().int().positive("limit 必须是正整数").optional(),
  keyword: z.string().optional(),
  type: cardType.optional(),
  tag: z.string().optional(),
  visibility: visibility.optional(),
  user_id: z.coerce.number().int().positive("user_id 必须是正整数").optional(),
  sort: z.enum(["newest", "most_liked"]).optional(),
});

// 随机复习查询（GET /cards/random）
// positive() 是 zod 数字类型的校验方法，意思是这个数必须是正数（大于 0）
export const randomCardQuerySchema = z.object({
  count: z.coerce.number().int().positive("count 必须是正整数").optional(),
});
