import { Router } from "express";
import { optionalAuthMiddleWare } from "../middleware/auth.js";
import {
  getAllTagsHandler,
  getCardsByTagHandler,
} from "../controllers/tags.controller.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { paginationQuerySchema } from "../schemas/common.schema.js";

const router = Router();

// ⚠️ 两个接口都用 optionalAuth（认证可选），不用 authMiddleWare
// 原因：未登录用户也能访问（看公开数据），只是内容会有差异

// 所有标签及使用次数
router.get("/", optionalAuthMiddleWare, getAllTagsHandler);

// 某标签下的公开卡片（:name 标签名非空）
router.get(
"/:name/cards",
optionalAuthMiddleWare,
  validate(z.object({ name: z.string().trim().min(1, "标签名不能为空").max(50) }), "params"),
  validate(paginationQuerySchema, "query"),
getCardsByTagHandler,
);

export default router;
