import { Router } from "express";
import { authMiddleWare } from "../middleware/auth.js";
import {
  likeCardHandler,
  unLikeCardHandler,
  favoriteCardHandler,
  unFavoriteCardHandler,
  getUserFavoriteCardsHandler
} from "../controllers/social.controller.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema, paginationQuerySchema } from "../schemas/common.schema.js";
const router = Router();

// 点赞 / 取消点赞
// 公开卡允许操作；私有卡仅作者本人可操作。无卡片访问权限时返回 404。
router.post("/cards/:id/like", authMiddleWare, validate(idParamSchema, "params"), likeCardHandler);
router.delete("/cards/:id/like", authMiddleWare, validate(idParamSchema, "params"), unLikeCardHandler);
// 收藏 / 取消收藏
router.post("/cards/:id/favorite", authMiddleWare, validate(idParamSchema, "params"), favoriteCardHandler);
router.delete("/cards/:id/favorite", authMiddleWare, validate(idParamSchema, "params"), unFavoriteCardHandler);
// 仅登录用户本人可查看自己的收藏；结果只包含当前仍公开的卡片（不含任何私有卡片，包括本人创建的私有卡片）。
router.get("/users/:id/favorites", authMiddleWare, validate(idParamSchema, "params"), validate(paginationQuerySchema, "query"), getUserFavoriteCardsHandler);
export default router;
