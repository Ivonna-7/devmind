<!--
  工作台卡片（管理自己的卡片，区别于社区的 HomeCard）：
  - 一个组件通过 variant 支持两种布局：list（列表行）/ grid（网格迷你卡）
-->
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMessage, useDialog } from "naive-ui";
import type { Card } from "@/types/home";
import {
  CARD_TYPES,
  DIFFICULTY_MAP,
  VISIBILITY_OPTIONS,
} from "@/components/card/constants";
import {
  togglePin,
  toggleVisibility,
  deleteCard,
} from "@/api/workspaceService";
import removeMd from "remove-markdown";
import dayjs from "@/utils/dayjs";

const props = withDefaults(
  defineProps<{
    card: Card;
    variant?: "list" | "grid";
  }>(),
  { variant: "list" },
);

const emit = defineEmits<{
  // 编辑：弹窗在父组件，交给父组件打开
  (e: "edit", card: Card): void;
  // 置顶 / 可见性 / 删除成功后，通知父组件刷新列表 / 侧边栏
  (e: "changed"): void;
}>();

const router = useRouter();
const message = useMessage();
const dialog = useDialog();

// 当前卡片的类型配置（从 CARD_TYPES 单一数据源查）
const typeConf = computed(() =>
  CARD_TYPES.find((t) => t.value === props.card.type),
);

// 可见性展示文案（emoji + 文字，取自单一数据源）
const visibilityLabel = computed(
  () =>
    VISIBILITY_OPTIONS.find((o) => o.value === props.card.visibility)?.label ??
    "",
);

// 难度 chip（仅面试题）
const difficultyLabel = computed(() => {
  if (props.card.type !== "question" || !props.card.difficulty) return "";
  return DIFFICULTY_MAP[props.card.difficulty] ?? "";
});

// "N 天前编辑" —— 用 updated_at
const relativeEdited = computed(() =>
  props.card.updated_at ? dayjs(props.card.updated_at).fromNow() : "",
);

// 内容摘要（去 Markdown）
const excerpt = computed(() => {
  const plain = removeMd(props.card.content || "");
  if (!plain) return "";
  return plain.length <= 60 ? plain : plain.slice(0, 60) + "...";
});

// 跳转卡片详情
function goDetail() {
  router.push(`/card/${props.card.id}`);
}

/** 切换置顶 */
async function onPin() {
  try {
    const { is_pinned } = await togglePin(props.card.id);
    message.success(is_pinned ? "已置顶" : "已取消置顶");
    emit("changed");
  } catch (e) {
    message.error(e.message);
  }
}

/** 切换可见性（公开 / 私有） */
async function onToggleVisibility() {
  try {
    const { visibility } = await toggleVisibility(props.card.id);
    message.success(
      visibility === "public" ? "卡片已设为公开" : "卡片已设为私有",
    );
    emit("changed");
  } catch (e) {
    message.error(e.message);
  }
}

/** 删除（二次确认） */
function onDelete() {
  dialog.warning({
    title: "删除卡片",
    content: `确定删除卡片「${props.card.title}」？此操作不可撤销。`,
    positiveText: "删除",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await deleteCard(props.card.id);
        message.success("删除成功");
        emit("changed");
      } catch (e) {
        message.error(e.message);
      }
    },
  });
}
</script>

<template>
  <!-- ========== 列表行（list） ========== -->
  <div
    v-if="variant === 'list'"
    class="group relative flex items-center gap-4 px-4.5 py-3.5 rounded-xl border border-line bg-card cursor-pointer transition-all hover:border-ink-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    @click="goDetail"
  >
    <!-- 左侧竖条-->
    <div
      class="w-1.5 h-9.5 rounded-[3px] shrink-0"
      :class="typeConf?.dot ?? 'bg-ink-300'"
    ></div>

    <!-- 主体 -->
    <div class="flex-1 min-w-0">
      <div
        class="flex items-center gap-2 text-[14.5px] font-medium text-ink-900"
      >
        <span class="text-xs">{{ typeConf?.emoji }}</span>
        <span class="truncate">{{ card.title }}</span>
        <span
          v-if="difficultyLabel"
          class="shrink-0 text-[10.5px] px-2 py-px rounded-full bg-brand-soft text-brand-hover border border-[#FDE68A]"
        >
          {{ difficultyLabel }}
        </span>
      </div>
      <div class="flex items-center gap-2.5 mt-1 text-xs text-ink-500 min-w-0">
        <template v-for="(tag, i) in card.tags" :key="tag">
          <span v-if="i > 0" class="text-ink-300">·</span>
          <span class="truncate">{{ tag }}</span>
        </template>
        <span v-if="card.tags && card.tags.length" class="text-ink-300">·</span>
        <span class="shrink-0">{{ relativeEdited }}编辑</span>
      </div>
    </div>

    <!-- 可见性 pill -->
    <span
      :class="[
        'inline-flex items-center gap-1 text-[11.5px] px-2 py-0.75 rounded-full shrink-0',
        card.visibility === 'public'
          ? 'bg-ok-soft text-[#166534]'
          : 'bg-soft text-ink-500',
      ]"
    >
      {{ visibilityLabel }}
    </span>

    <!-- 点赞数 -->
    <span class="text-xs text-ink-500 w-12.5 text-right shrink-0">
      <template v-if="card.visibility === 'public' && card.likes_count > 0">
        <span class="text-bad">❤</span> {{ card.likes_count }}
      </template>
    </span>

    <!-- 悬停操作栏 -->
    <div
      class="absolute right-3.5 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card px-1.5 py-1 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
      @click.stop
    >
      <button
        type="button"
        title="编辑"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ink-500 hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
        @click="emit('edit', card)"
      >
        ✏️
      </button>
      <button
        type="button"
        title="置顶"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ink-500 hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
        @click="onPin()"
      >
        📌
      </button>
      <button
        type="button"
        :title="card.visibility === 'public' ? '设为私有' : '设为公开'"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ink-500 hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
        @click="onToggleVisibility()"
      >
        {{ card.visibility === "public" ? "🔒" : "🌐" }}
      </button>
      <button
        type="button"
        title="删除"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ok hover:bg-bad-soft hover:text-bad transition-colors cursor-pointer"
        @click="onDelete()"
      >
        🗑
      </button>
    </div>
  </div>

  <!-- ========== 网格迷你卡（grid） ========== -->
  <div
    v-else
    class="group relative rounded-xl border border-line bg-card px-4 pt-4 pb-3.5 cursor-pointer transition-all hover:border-ink-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-px"
    @click="goDetail"
  >
    <!-- 置顶图标 -->
    <span
      v-if="card.is_pinned"
      class="absolute -top-1.5 right-3 text-lg rotate-25"
      >📌</span
    >

    <!-- 类型徽章 -->
    <span
      :class="[
        'inline-block px-1.75 py-px rounded text-[10.5px] font-semibold tracking-wide',
        typeConf?.badge ?? 'bg-soft text-ink-700',
      ]"
    >
      {{ typeConf?.label ?? card.type }}
    </span>

    <!-- 标题 -->
    <h4
      class="text-[14.5px] font-semibold mt-2.5 mb-1.5 text-ink-900 leading-snug line-clamp-2"
    >
      {{ card.title }}
    </h4>

    <!-- 摘要 -->
    <p v-if="excerpt" class="text-[12.5px] text-ink-500 leading-normal mb-2.5">
      {{ excerpt }}
    </p>

    <!-- 底部信息 -->
    <div class="text-[11.5px] text-ink-500">
      {{ visibilityLabel }} · {{ relativeEdited }}
      <template v-if="card.visibility === 'public' && card.likes_count > 0">
        · <span class="text-bad">❤</span> {{ card.likes_count }}
      </template>
    </div>

    <!-- 悬停操作栏 -->
    <div
      class="absolute right-2.5 bottom-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card px-1.5 py-1 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
      @click.stop
    >
      <button
        type="button"
        title="编辑"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ink-500 hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
        @click="emit('edit', card)"
      >
        ✏️
      </button>
      <button
        type="button"
        :title="card.is_pinned ? '取消置顶' : '置顶'"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
        :class="card.is_pinned ? 'text-brand' : 'text-ink-500'"
        @click="onPin()"
      >
        📌
      </button>
      <button
        type="button"
        :title="card.visibility === 'public' ? '设为私有' : '设为公开'"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ink-500 hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
        @click="onToggleVisibility()"
      >
        {{ card.visibility === "public" ? "🔒" : "🌐" }}
      </button>
      <button
        type="button"
        title="删除"
        class="w-7 h-7 rounded-[7px] flex items-center justify-center text-ok hover:bg-bad-soft hover:text-bad transition-colors cursor-pointer"
        @click="onDelete()"
      >
        🗑
      </button>
    </div>
  </div>
</template>
