import { Router } from "express";
import { authMiddleWare } from "../middleware/auth.js";
import {
  getTagStatsHandler,
  getOverviewStatsHandler,
  getHeatmapStatsHandler,
} from "../controllers/stats.controller.js";

const router = Router();

// 标签分布
router.get("/tags", authMiddleWare, getTagStatsHandler);
// 总览统计
router.get("/overview", authMiddleWare, getOverviewStatsHandler);
// 热力图
router.get("/heatmap", authMiddleWare, getHeatmapStatsHandler);

export default router;
