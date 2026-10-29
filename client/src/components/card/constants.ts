import type { CardType } from "@/types/home";

/** 卡片类型展示配置（单一数据源）
 *  - value：接口筛选用的英文标识，与后端 type 字段对齐
 *  - label：带 emoji 的展示文字（徽章 / 筛选栏）
 *  - name：中文类型名，用于拼结果数文案（"共 X 篇笔记"）
 *  - classes：徽章配色（底色 / 文字 / 描边）
 */
export const CARD_TYPES: {
  value: CardType;
  label: string;
  name: string;
  color: string;
  classes: string;
}[] = [
  {
    value: "note",
    label: "📝 笔记",
    name: "笔记",
    color: "#60A5FA",
    classes: "bg-info-soft text-info border-[#bae6fd]",
  },
  {
    value: "question",
    label: "💡 面试题",
    name: "面试题",
    color: "#A78BFA",
    classes: "bg-brand-soft text-brand-hover border-[#fde68a]",
  },
  {
    value: "bug",
    label: "🐛 Bug 日记",
    name: "Bug 日记",
    color: "#FB923C",
    classes: "bg-bad-soft text-bad border-[#fecaca]",
  },
  {
    value: "til",
    label: "✨ TIL",
    name: "TIL",
    color: "#34D399",
    classes: "bg-ok-soft text-ok border-[#bbf7d0]",
  },
];

/** 难度等级中英映射（仅面试题类型在徽章上显示） */
export const DIFFICULTY_MAP: Record<string, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

