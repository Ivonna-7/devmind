import { Router } from "express";
import { optionalAuthMiddleWare } from "../middleware/auth.js";
import {
  getAllTagsHandler,
  getCardsByTagHandler,
} from "../controllers/tags.controller.js";

const router = Router();

// ⚠️ 两个接口都用 optionalAuth（认证可选），不用 authMiddleWare
// 原因：未登录用户也能访问（看公开数据），只是内容会有差异

// 所有标签及使用次数
router.get("/", optionalAuthMiddleWare, getAllTagsHandler);

// 某标签下的公开卡片
router.get("/:name/cards", optionalAuthMiddleWare, getCardsByTagHandler);

export default router;
