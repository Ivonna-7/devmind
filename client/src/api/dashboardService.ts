import client from "./index";
import type { OverviewStats, ReviewCard, Mastery } from "../types/dashboard";

/** 总览统计（卡片总数 / 类型分布 / 掌握度分布 / 被赞被藏数，需登录） */
export const getOverviewStats = () =>
  client.get<OverviewStats>("stats/overview");

/** 学习热力图：最近 365 天每天创建的卡片数（只含有数据的天，需登录） */
export const getHeatmap = () =>
  client.get<{ date: string; count: number }[]>("stats/heatmap");

/** 标签分布：当前用户使用最多的前 N 个标签（雷达图数据，需登录） */
export const getTagStats = (limit: number) =>
  client.get<{ name: string; count: string }[]>("stats/tags", {
    params: { limit },
  });

/** 今日复习：按掌握度优先级取 count 张待复习卡片（需登录） */
export const getReviewCards = (count: number) =>
  client.get<ReviewCard[]>("cards/random", { params: { count } });

/** 提交复习结果（更新 mastery + 写入复习记录，需登录） */
export const reviewCardSubmit = (id: number, mastery: Mastery) =>
  client.post<{ mastery: Mastery | string; last_reviewed_at: string }>(
    `cards/${id}/review`,
    { mastery },
  );
