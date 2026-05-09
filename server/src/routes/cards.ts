import {Router} from "express";
import { authMiddleWare,optionalAuthMiddleWare } from "../middleware/auth.js";
import { createCardHandler,getCardDetailHandler,getCardListHandler,deleteCardHandler ,togglePinHandler,toggleVisibilityHandler,updateCardHandler,randomCardHandler,reviewCardHandler} from "../controllers/cards.controller.js";
const router = Router();

router.post("/",authMiddleWare, createCardHandler)
router.get("/",optionalAuthMiddleWare, getCardListHandler)
router.get("/random",authMiddleWare, randomCardHandler)
router.get("/:id", optionalAuthMiddleWare,getCardDetailHandler)
router.delete("/:id",authMiddleWare,deleteCardHandler)
router.patch("/:id/pin",authMiddleWare, togglePinHandler)
router.patch("/:id/visibility",authMiddleWare, toggleVisibilityHandler)
router.put("/:id",authMiddleWare, updateCardHandler)
router.post("/:id/review",authMiddleWare, reviewCardHandler)
export default router;