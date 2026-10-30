import type { CardType } from "./home";

/** 新建 / 编辑卡片的提交数据（创建时必填 title/content/type） */
export interface CardPayload {
  /** 标题 */
  title: string;
  /** 正文内容（Markdown） */
  content: string;
  /** 卡片类型 */
  type: CardType;
  /** 参考答案（仅面试题有意义） */
  answer?: string | null;
  /** 可见性：公开 / 私有 */
  visibility?: "public" | "private";
  /** 难度等级（仅面试题有意义） */
  difficulty?: "easy" | "medium" | "hard" | null;
  /** 标签名数组（传 [] 清空，省略则保持不变） */
  tags?: string[];
}
