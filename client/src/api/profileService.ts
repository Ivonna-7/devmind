import client from "./index";
import type { CardListParams, Card } from "../types/home";
import type { ProfileUser } from "../types/profile";

/** 获取用户公开资料 */
export const getUserPublicInfo = (id: number) =>
  client.get<ProfileUser>(`users/${id}`);

/** 获取用户收藏卡片 */
export const getUserFavorites = (params: CardListParams) =>
  client.get<{
    cards: Card[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }>(`users/${params.user_id}/favorites`, { params });
