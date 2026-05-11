import type { Request, Response } from "express";
import {
  getTagStats,
  getOverviewStats,
  getHeatmapStats,
} from "../models/stats.model.js";

// 标签分布
export const getTagStatsHandler = async (req: Request, res: Response) => {
  try {
    // userId 从 token 解析（authMiddleWare 挂到 req 上）
    const userId = (req as any).userId;
    // limit：默认 10，最大 50（防止前端传特别大的数压垮服务器）
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const tagStats = await getTagStats(userId, limit);
    res.status(200).json(tagStats);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};


// 总览统计
export const getOverviewStatsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId;
    const overview = await getOverviewStats(userId);
    res.status(200).json(overview);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};

// 热力图数据
export const getHeatmapStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const heatmap = await getHeatmapStats(userId);
    res.status(200).json(heatmap);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};
