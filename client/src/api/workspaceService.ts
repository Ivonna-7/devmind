import client from "./index";
import type { Card } from "../types/home";
import type { CardPayload } from "../types/workspace";

/** 获取标签列表（可选登录；登录时返回当前用户自己的标签） */
export const getAllTags = () =>
  client.get<{ name: string; count: number }[]>("tags");

/** 新建卡片（需登录） */
export const createCard = (payload: CardPayload) =>
  client.post<Card>("cards", payload);

/** 更新卡片（部分更新；传 tags: [] 清空标签，省略 tags 则保持不变） */
export const updateCard = (id: number, payload: Partial<CardPayload>) =>
  client.put<Card>(`cards/${id}`, payload);

/** 删除卡片（后端返回 204 空响应） */
export const deleteCard = (id: number) => client.delete(`cards/${id}`);

/** 切换置顶状态 */
export const togglePin = (id: number) =>
  client.patch<{ is_pinned: boolean }>(`cards/${id}/pin`);

/** 切换可见性（公开 / 私有） */
export const toggleVisibility = (id: number) =>
  client.patch<{ visibility: "public" | "private" }>(`cards/${id}/visibility`);
