import { Router } from "express";
import { authMiddleWare } from "../middleware/auth.js";
import {
  likeCardHandler,
  unLikeCardHandler,
  favoriteCardHandler,
  unFavoriteCardHandler,
  getUserFavoriteCardsHandler
} from "../controllers/social.controller.js";
const router = Router();

// 点赞 / 取消点赞
router.post("/cards/:id/like", authMiddleWare, likeCardHandler);
router.delete("/cards/:id/like", authMiddleWare, unLikeCardHandler);
// 收藏 / 取消收藏
router.post("/cards/:id/favorite", authMiddleWare, favoriteCardHandler);
router.delete("/cards/:id/favorite", authMiddleWare, unFavoriteCardHandler);
// 获取用户收藏的卡片
router.get("/users/:id/favorites", getUserFavoriteCardsHandler);
export default router;
