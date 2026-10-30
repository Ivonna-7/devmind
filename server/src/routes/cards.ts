import {Router} from "express";
import { authMiddleWare,optionalAuthMiddleWare } from "../middleware/auth.js";
import { createCardHandler,getCardDetailHandler,getCardListHandler,deleteCardHandler ,togglePinHandler,toggleVisibilityHandler,updateCardHandler,randomCardHandler,reviewCardHandler} from "../controllers/cards.controller.js";
import { validate } from "../middleware/validate.js";
import { createCardSchema, updateCardSchema, reviewCardSchema, cardIdParamSchema, cardListQuerySchema, randomCardQuerySchema } from "../schemas/card.schema.js";
const router = Router();

// 创建卡片：需登录；校验请求体（标题/内容/类型等）
router.post("/",authMiddleWare, validate(createCardSchema), createCardHandler)

// 卡片列表：登录可选（未登录只看公开卡）；支持 query 筛选分页（type/tag/sort/page/limit/user_id/visibility）
router.get("/",optionalAuthMiddleWare, validate(cardListQuerySchema, "query"), getCardListHandler)

// 随机抽卡复习：需登录；query 可带 count 控制抽取数量（默认 3）
router.get("/random",authMiddleWare, validate(randomCardQuerySchema, "query"), randomCardHandler)

// 卡片详情：登录可选（私有卡仅作者可见）；校验路径 :id 为正整数
router.get("/:id", optionalAuthMiddleWare, validate(cardIdParamSchema, "params"), getCardDetailHandler)

// 删除卡片：需登录（仅作者本人）；校验 :id
router.delete("/:id",authMiddleWare, validate(cardIdParamSchema, "params"), deleteCardHandler)

// 置顶 / 取消置顶：需登录（仅作者本人）；校验 :id
router.patch("/:id/pin",authMiddleWare, validate(cardIdParamSchema, "params"), togglePinHandler)

// 切换公开 / 私有：需登录（仅作者本人）；校验 :id
router.patch("/:id/visibility",authMiddleWare, validate(cardIdParamSchema, "params"), toggleVisibilityHandler)

// 更新卡片：需登录（仅作者本人）；校验 :id + 请求体（字段均可选，部分更新）
router.put("/:id",authMiddleWare, validate(cardIdParamSchema, "params"), validate(updateCardSchema), updateCardHandler)

// 提交复习结果：需登录；校验 :id + 请求体 mastery（fuzzy/remember/master）
router.post("/:id/review",authMiddleWare, validate(cardIdParamSchema, "params"), validate(reviewCardSchema), reviewCardHandler)
export default router;