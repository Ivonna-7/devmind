import type { Request, Response } from "express";
import { getAllTags, getCardsByTag } from "../models/tag.model.js";

//获取所有标签及使用次数
export const getAllTagsHandler = async (req: Request, res: Response) => {
  try {
    // 这里用的是 optionalAuthMiddleWare，所以 userId 可能是 number 也可能是 undefined
    const currentUserId = (req as any).userId;
    const tags = await getAllTags(currentUserId);
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};

// 某标签下的所有公开卡片
export const getCardsByTagHandler = async (req: Request, res: Response) => {
  try {
    const tagName = req.params.name as string;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const result = await getCardsByTag(tagName, page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "服务器错误" });
  }
};
