import type { Request, Response } from "express";
import { getAllTags, getCardsByTag } from "../models/tag.model.js";

// 获取所有标签及使用次数
export const getAllTagsHandler = async (req: Request, res: Response) => {
  // optionalAuthMiddleWare：已登录时 userId 是 number，未登录时 undefined
  const currentUserId = (req as any).userId;
  const tags = await getAllTags(currentUserId);
  res.status(200).json(tags);
};

// 某标签下的所有公开卡片
export const getCardsByTagHandler = async (req: Request, res: Response) => {
  const tagName = req.params.name as string;
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const result = await getCardsByTag(tagName, page, limit);
  res.status(200).json(result);
};