import {
  createCard,
  getCardById,
  getCardList,
  deleteCard,
  togglePin,
  toggleVisibility,
  updateCard,
  randomCard,
  reviewCard,
} from "../models/card.model.js";
import type { Request, Response } from "express";

// 创建卡片
export const createCardHandler = async (req: Request, res: Response) => {
  const { title, content, type, answer, visibility, difficulty, tags } =
    req.body;
  const userId = (req as any).userId;
  const card = await createCard(
    userId,
    title,
    content,
    type,
    answer,
    visibility,
    difficulty,
    tags
  );
  res.status(201).json(card);
};

// 卡片详情
export const getCardDetailHandler = async (req: Request, res: Response) => {
  const card = await getCardById(Number(req.params.id));
  if (!card) {
    res.status(404).json({ error: "卡片不存在" });
    return;
  }
  // 私有卡片只有作者能看
  if (card.visibility === "private") {
    const userId = (req as any).userId;
    if (!userId || card.user_id !== userId) {
      res.status(404).json({ error: "卡片不存在" });
      return;
    }
  }
  res.json(card);
};

// 获取卡片列表
export const getCardListHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const keyword = req.query.keyword as string;
  const type = req.query.type as string;
  const tag = req.query.tag as string;
  const visibility = req.query.visibility as string;
  const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
  const sort = req.query.sort as string;
  const currentUserId = (req as any).userId; // 登录的那个userid
  const result = await getCardList(
    page,
    limit,
    keyword,
    type,
    tag,
    visibility,
    userId,
    currentUserId,
    sort
  );
  res.json(result);
};

// 删除卡片
export const deleteCardHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).userId;
  const result = await getCardById(id);
  if (!result || result.user_id !== userId) {
    res.status(404).json({ error: "卡片不存在" });
    return;
  }
  await deleteCard(id);
  res.status(204).send();
};

// 置顶卡片
export const togglePinHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).userId;
  const result = await getCardById(id);
  if (!result || result.user_id !== userId) {
    res.status(404).json({ error: "卡片不存在" });
    return;
  }
  const pinResult = await togglePin(id);
  res.status(200).json(pinResult);
};

// 修改卡片可见性
export const toggleVisibilityHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).userId;
  const result = await getCardById(id);
  if (!result || result.user_id !== userId) {
    res.status(404).json({ error: "卡片不存在" });
    return;
  }
  const visibilityResult = await toggleVisibility(id);
  res.status(200).json(visibilityResult);
};

// 修改卡片
export const updateCardHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).userId;
  const result = await getCardById(id);
  if (!result || result.user_id !== userId) {
    res.status(404).json({ error: "卡片不存在" });
    return;
  }
  const { title, content, type, answer, visibility, difficulty, tags } =
    req.body;
  const updatedCard = await updateCard(
    id,
    title,
    content,
    type,
    answer,
    visibility,
    difficulty,
    tags
  );
  res.status(200).json(updatedCard);
};

// 随机复习卡片
export const randomCardHandler = async (req: Request, res: Response) => {
  const user_id = (req as any).userId;
  const count = Number(req.query.count) || 3;
  const result = await randomCard(user_id, count);
  res.status(200).json(result);
};

// 复习卡片提交
export const reviewCardHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const card_id = Number(req.params.id);
  const { mastery } = req.body;
  const result = await getCardById(card_id);
  if (!result || result.user_id !== userId) {
    res.status(404).json({ error: "卡片不存在" });
    return;
  }
  const reviewResult = await reviewCard(userId, card_id, mastery);
  res.status(200).json(reviewResult);
};