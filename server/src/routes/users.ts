import { Router } from "express";
import { getUserPublicInfoHandler } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../schemas/common.schema.js";
const router = Router();

// 公开接口：获取任意用户的基础信息（个人主页用）
router.get("/:id", validate(idParamSchema, "params"), getUserPublicInfoHandler);

export default router;