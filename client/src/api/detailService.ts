import client from "./index";
import type { Card } from "../types/home";

/** 获取单张卡片详情（可选登录，私有卡非作者返回 404） */
export const getCardDetail = (id: number) =>
  client.get<Card>(`cards/${id}`);
