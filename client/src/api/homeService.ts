import client from "./index";
import type { CardListParams, Card } from "../types/home";

/** 获取卡片列表 */
export const getCardList = (params: CardListParams) =>
  client.get<{
    cards: Card[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }>("cards", { params });
