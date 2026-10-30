import type { CardType } from "./home";

/** 掌握度枚举（key → 标签 + 颜色，单一数据源） */
export const MasteryEnum = {
  new: { label: "新建", color: "#38BDF8" },
  fuzzy: { label: "模糊", color: "#FACC15" },
  remember: { label: "记得", color: "#FB923C" },
  master: { label: "已掌握", color: "#10B981" },
};

export type Mastery = keyof typeof MasteryEnum;

/** 概览统计（仪表盘统计卡 + 工作台侧边栏计数来源，需登录） */
export class OverviewStats {
  /** 卡片总数 */
  total_cards!: number;
  /** 按类型统计（键为 CardType 全集） */
  by_type!: Record<CardType, number>;
  /** 按可见性统计（后端按 GROUP BY 聚合，0 张的档位不返回，故键可能缺失） */
  by_visibility!: Partial<Record<"public" | "private", number>>;
  /** 掌握度分布（后端按 GROUP BY 聚合，0 张卡的档位不返回，故键可能缺失） */
  mastery_distribution!: Partial<Record<Mastery, number>>;
  /** 收到的点赞总数 */
  total_likes_received!: number;
  /** 收到的收藏总数 */
  total_favorites_received!: number;

  constructor(raw: Partial<OverviewStats> = {}) {
    Object.assign(this, raw);
  }
}

/** 复习卡片 */
export class ReviewCard {
  /** 答案，仅 question 类型使用（可折叠） */
  answer!: string | null;
  /** 正文内容（Markdown） */
  content!: string;
  /** 创建时间 */
  created_at!: string;
  /** 难度等级（可选，主要 question 用） */
  difficulty!: "easy" | "medium" | "hard" | null;
  /** 卡片 ID */
  id!: number;
  /** 是否置顶 */
  is_pinned!: boolean;
  /** 上次复习时间，从未复习为 null */
  last_reviewed_at!: string | null;
  /** 掌握度：new / fuzzy / remember / master */
  mastery!: Mastery | string;
  /** 标签名数组（后端聚合，无标签为 []） */
  tags!: string[];
  /** 标题 */
  title!: string;
  /** 卡片类型 */
  type!: CardType;
  /** 更新时间 */
  updated_at!: string;
  /** 作者用户 ID */
  user_id!: number;
  /** 可见性：公开 / 私有 */
  visibility!: "public" | "private" | string;

  constructor(raw: Partial<ReviewCard> = {}) {
    Object.assign(this, raw);
  }
}
