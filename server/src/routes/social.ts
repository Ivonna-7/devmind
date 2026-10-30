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
router.post("/cards/:id/like", authMiddleWare, validate(idParamSchema, "params"), likeCardHandler);
router.delete("/cards/:id/like", authMiddleWare, validate(idParamSchema, "params"), unLikeCardHandler);
// 收藏 / 取消收藏
router.post("/cards/:id/favorite", authMiddleWare, validate(idParamSchema, "params"), favoriteCardHandler);
router.delete("/cards/:id/favorite", authMiddleWare, validate(idParamSchema, "params"), unFavoriteCardHandler);
// 获取用户收藏的卡片
router.get("/users/:id/favorites", validate(idParamSchema, "params"), validate(paginationQuerySchema, "query"), getUserFavoriteCardsHandler);
export default router;
