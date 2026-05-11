import type { Request, Response } from "express";
import {
  likeCard,
  unLikeCard,
  favoriteCard,
  unFavoriteCard,
  getUserFavoriteCards,
} from "../models/social.model.js";

// 点赞
export const likeCardHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const card_id = Number(req.params.id);
    await likeCard(userId, card_id);
    res.status(201).json({ message: "点赞成功" });
  } catch (error: any) {
    // PostgreSQL 会抛错码 23505（唯一约束冲突）
    if (error.code === "23505") {
      return res.status(409).json({ error: "已经点过赞了" });
    }
    throw error; // 其他错误交给全局 errorHandler
  }
};

// 取消点赞
export const unLikeCardHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const card_id = Number(req.params.id);
  await unLikeCard(userId, card_id);
  res.status(204).send();
};

// 收藏
export const favoriteCardHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const card_id = Number(req.params.id);
    await favoriteCard(userId, card_id);
    res.status(201).json({ message: "收藏成功" });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "已经收藏过了" });
    }
    throw error;
  }
};

// 取消收藏
export const unFavoriteCardHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const card_id = Number(req.params.id);
  await unFavoriteCard(userId, card_id);
  res.status(204).send();
};

// 获取用户收藏的卡片
export const getUserFavoriteCardsHandler = async (
  req: Request,
  res: Response
) => {
  const userId = Number(req.params.id);
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const favoriteCards = await getUserFavoriteCards(userId, page, limit);
  res.status(200).json(favoriteCards);
};