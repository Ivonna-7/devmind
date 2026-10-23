/** 卡片类型： 技术笔记、问题、bug、学到的*/
export type CardType = "note" | "question" | "bug" | "til";

/** 排序方式： 最新、最热*/
export type CardSort = "newest" | "most_liked";

/** 卡片列表查询参数 */
export interface CardListParams {
  /** 页码 */
  page: number;
  /** 每页条数（最大 50） */
  limit: number;
  /** 按类型筛选（all 时传 null，后端视为不筛选） */
  type?: CardType | null;
  /** 排序方式：最新 / 最热 */
  sort?: CardSort;
  /** 关键词搜索（匹配标题和内容） */
  keyword?: string;
  /** 按标签名筛选 */
  tag?: string;
  /** 可见性筛选（仅查自己的卡片时有效） */
  visibility?: "public" | "private";
  /** 查指定用户的卡片 */
  user_id?: number;
}

/** 卡片列表 */
export class Card {
  /** 卡片 ID */
  id!: number;
  /** 作者用户 ID */
  user_id!: number;
  /** 标题 */
  title!: string;
  /** 正文内容（Markdown） */
  content!: string;
  /** 卡片类型 */
  type!: CardType;
  /** 答案（仅面试题类型有意义，可折叠） */
  answer: string | null = null;
  /** 可见性：公开 / 私有 */
  visibility!: "public" | "private" | string;
  /** 是否置顶 */
  is_pinned!: boolean;
  /** 难度等级（可选） */
  difficulty: "easy" | "medium" | "hard" | null = null;
  /** 掌握度 */
  mastery?: number;
  /** 上次复习时间 */
  last_reviewed_at?: string | null;
  /** 创建时间 */
  created_at!: string;
  /** 更新时间 */
  updated_at!: string;
  /** 标签名数组 */
  tags!: string[];
  /** 作者信息 */
  author!: {
    /** 作者用户 ID */
    id: number;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string | null;
    /** 头像地址 */
    avatar: string | null;
    /** 个人简介 */
    bio?: string | null;
  };
  /** 点赞数 */
  likes_count!: number;
  /** 收藏数 */
  favorites_count!: number;
  /** 当前用户是否已点赞 */
  liked_by_me!: boolean;
  /** 当前用户是否已收藏 */
  favorited_by_me!: boolean;

  constructor(raw: Partial<Card> = {}) {
    Object.assign(this, raw);
  }
}
