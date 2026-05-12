import { Router } from "express";
import { getUserPublicInfoHandler } from "../controllers/auth.controller.js";

const router = Router();

// 公开接口：获取任意用户的基础信息（个人主页用）
router.get("/:id", getUserPublicInfoHandler);

export default router;