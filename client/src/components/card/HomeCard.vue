<!--
  社区卡片组件：含点赞 / 收藏互动，用于首页、个人主页（公开卡 + 收藏）、标签页等社区浏览场景。
  ⚠️ 此组件含社区互动，工作台（管理自己的卡片，操作为置顶/编辑/删除）需另做处理，勿直接复用。
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useMessage } from "naive-ui";
import { useAuthStore } from "@/stores/auth";
import type { Card } from "@/types/home";
import {
  likeCard,
  unlikeCard,
  favoriteCard,
  unfavoriteCard,
} from "@/api/socialService";
import { CARD_TYPES, DIFFICULTY_MAP } from "./constants";
import removeMd from "remove-markdown";
import dayjs from "@/utils/dayjs";

const { card } = defineProps<{
  card: Card;
}>();

const message = useMessage();
const authStore = useAuthStore();

// 点赞 / 收藏本地状态（乐观更新，不直接改 props）
const liked = ref(card.liked_by_me);
const likesCount = ref(card.likes_count);
const favorited = ref(card.favorited_by_me);
const favoritesCount = ref(card.favorites_count);
const liking = ref(false);
const favoriting = ref(false);

// 标签徽章 如果标签为面试题 + 展示简单|中等|困难
const badgeLabel = computed(() => {
  const config = CARD_TYPES.find((t) => t.value === card.type);
  const baseLabel = config?.label;
  if (
    card.type === "question" &&
    card.difficulty &&
    DIFFICULTY_MAP[card.difficulty]
  ) {
    return `${baseLabel} · ${DIFFICULTY_MAP[card.difficulty]}`;
  }
  return baseLabel;
});

// 卡片徽章该用的颜色
const badgeClasses = computed(() => {
  const config = CARD_TYPES.find((t) => t.value === card.type);
  return config?.classes || "bg-soft text-ink-700 border-line";
});

// 卡片内容（content）摘要，需Markdown解析
const excerpt = computed(() => {
  const plain = removeMd(card.content);
  if (!plain) return "";
  if (plain.length <= 80) return plain;
  return plain.slice(0, 80) + "...";
});

// 默认头像
const authorInitials = computed(() => {
  const name = card.author?.username?.trim();
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
});

// 相对时间
const relativeTime = computed(() =>
  card.created_at ? dayjs(card.created_at).fromNow() : "",
);

/** 切换点赞 / 收藏：乐观更新，失败回滚 */
async function toggleSocial(action: "like" | "favorite") {
  if (!authStore.user) {
    message.warning("请先登录");
    return;
  }
  const isLike = action === "like";
  const active = isLike ? liked : favorited;
  const count = isLike ? likesCount : favoritesCount;
  const loading = isLike ? liking : favoriting;
  if (loading.value) return;
  loading.value = true;
  const prev = active.value;
  active.value = !prev;
  count.value += prev ? -1 : 1;
  try {
    if (isLike) {
      await (prev ? unlikeCard(card.id) : likeCard(card.id));
    } else {
      await (prev ? unfavoriteCard(card.id) : favoriteCard(card.id));
    }
  } catch (error) {
    active.value = prev;
    count.value += prev ? 1 : -1;
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <article
    class="bg-card rounded-[14px] p-[22px_22px_18px] border border-line/60 shadow-[0_1px_2px_rgba(28,25,23,0.035),0_4px_14px_rgba(28,25,23,0.045)]"
  >
    <!-- 便签徽章：正常文档流 + 负边距探出卡片左上角（避开 absolute 在多列布局下的残影） -->
    <span
      :class="[
        'flex w-fit -mt-7.75 -ml-1 px-2.75 py-0.75 text-[11px] font-semibold -rotate-2 rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border',
        badgeClasses,
      ]"
    >
      {{ badgeLabel }}
    </span>

    <!-- 标题：唯一跳详情入口（颜色 / hover 放在 h3，链接继承，避开全局 a{color:inherit} 压制工具类） -->
    <h3
      class="mt-3 mb-2 text-[17px] font-semibold leading-snug tracking-tight text-ink-900 transition-colors hover:text-brand"
    >
      <RouterLink :to="`/card/${card.id}`">{{ card.title }}</RouterLink>
    </h3>

    <!-- 纯文本摘要 -->
    <p
      v-if="excerpt"
      class="text-[13.5px] text-ink-700 leading-relaxed wrap-break-word"
    >
      {{ excerpt }}
    </p>

    <!-- 标签 -->
    <div
      v-if="card.tags && card.tags.length > 0"
      class="flex flex-wrap gap-1.5 mt-3.5"
    >
      <span
        v-for="tag in card.tags"
        :key="tag"
        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-line bg-card text-ink-700"
      >
        {{ tag }}
      </span>
    </div>

    <!-- 底部作者与互动信息 -->
    <div
      class="flex items-center justify-between mt-4 pt-3.5 border-t border-line-soft text-xs text-ink-500"
    >
      <span class="flex items-center gap-2 min-w-0">
        <img
          v-if="card.author?.avatar"
          :src="card.author.avatar"
          alt="avatar"
          class="w-5 h-5 rounded-full object-cover shrink-0"
        />
        <span
          v-else
          class="w-5 h-5 rounded-full bg-linear-to-br from-brand to-brand-deep flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
        >
          {{ authorInitials }}
        </span>
        <span class="truncate">{{ card.author?.username }}</span>
        <span class="shrink-0">· {{ relativeTime }}</span>
      </span>
      <span class="flex items-center gap-3 shrink-0 ml-2">
        <button
          type="button"
          :disabled="liking"
          class="flex items-center gap-1 transition-colors cursor-pointer hover:text-bad"
          :class="liked ? 'text-bad' : 'text-ink-500'"
          @click="toggleSocial('like')"
        >
          {{ liked ? "❤" : "♡" }} {{ likesCount }}
        </button>
        <button
          type="button"
          :disabled="favoriting"
          class="flex items-center gap-1 transition-colors cursor-pointer hover:text-brand"
          :class="favorited ? 'text-brand' : 'text-ink-500'"
          @click="toggleSocial('favorite')"
        >
          {{ favorited ? "★" : "☆" }} {{ favoritesCount }}
        </button>
      </span>
    </div>
  </article>
</template>
