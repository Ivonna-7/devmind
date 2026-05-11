import type { Request, Response } from "express";
import {
  getTagStats,
  getOverviewStats,
  getHeatmapStats,
} from "../models/stats.model.js";

// 标签分布
export const getTagStatsHandler = async (req: Request, res: Response) => {
  // userId 从 token 解析（authMiddleWare 挂到 req 上）
  const userId = (req as any).userId;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const tagStats = await getTagStats(userId, limit);
  res.status(200).json(tagStats);
};

// 总览统计
export const getOverviewStatsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const overview = await getOverviewStats(userId);
  res.status(200).json(overview);
};

// 热力图数据
export const getHeatmapStatsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const heatmap = await getHeatmapStats(userId);
  res.status(200).json(heatmap);
};
