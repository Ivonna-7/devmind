import type { CardType } from "@/types/home";

/** 卡片类型展示配置（单一数据源）
 *  - value：接口筛选用的英文标识，与后端 type 字段对齐
 *  - label：带 emoji 的展示文字（徐章 / 筛选栏）
 *  - name：中文类型名，用于拼结果数文案（"共 X 篇笔记"）
 *  - emoji：单独的 emoji（列表行标题前）
 *  - color：主色（雷达图 / 图表）
 *  - dot：类型色点 class（列表行左侧竖条）
 *  - badge：网格卡徐章配色 class
 *  - classes：筛选栏徐章配色（底色 / 文字 / 描边）
 */
export const CARD_TYPES: {
  value: CardType;
  label: string;
  name: string;
  emoji: string;
  color: string;
  dot: string;
  badge: string;
  classes: string;
}[] = [
  {
    value: "note",
    label: "📝 笔记",
    name: "笔记",
    emoji: "📝",
    color: "#60A5FA",
    dot: "bg-[#0369A1]",
    badge: "bg-[#E0F2FE] text-[#075985]",
    classes: "bg-info-soft text-info border-[#bae6fd]",
  },
  {
    value: "question",
    label: "💡 面试题",
    name: "面试题",
    emoji: "💡",
    color: "#A78BFA",
    dot: "bg-[#B45309]",
    badge: "bg-[#FEF3C7] text-[#92400E]",
    classes: "bg-brand-soft text-brand-hover border-[#fde68a]",
  },
  {
    value: "bug",
    label: "🐛 Bug 日记",
    name: "Bug 日记",
    emoji: "🐛",
    color: "#FB923C",
    dot: "bg-[#B91C1C]",
    badge: "bg-[#FEE2E2] text-[#991B1B]",
    classes: "bg-bad-soft text-bad border-[#fecaca]",
  },
  {
    value: "til",
    label: "✨ TIL",
    name: "TIL",
    emoji: "✨",
    color: "#34D399",
    dot: "bg-[#15803D]",
    badge: "bg-[#DCFCE7] text-[#166534]",
    classes: "bg-ok-soft text-ok border-[#bbf7d0]",
  },
];

/** 难度等级中英映射（仅面试题类型在徽章上显示） */
export const DIFFICULTY_MAP: Record<string, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

/** 卡片可见性展示配置（单一数据源：筛选栏 / 表单 / 卡片徽章共用） */
export const VISIBILITY_OPTIONS: { value: "public" | "private"; label: string }[] = [
  { value: "public", label: "🌐 公开" },
  { value: "private", label: "🔒 私有" },
];

