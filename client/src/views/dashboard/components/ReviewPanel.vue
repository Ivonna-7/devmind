<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useMessage, useDialog } from "naive-ui";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getReviewCards, reviewCardSubmit } from "@/api/dashboardService";
import { CARD_TYPES, DIFFICULTY_MAP } from "@/components/card/constants";
import { MasteryEnum } from "@/types/dashboard";
import type { ReviewCard, Mastery } from "@/types/dashboard";

const message = useMessage();
const dialog = useDialog();

const cards = ref<ReviewCard[]>([]);
const loading = ref(false);
const submitting = ref(false);
const activeIndex = ref(0); // 当前翻到第几张（可循环切换）
const answerExpanded = ref(false); // 当前卡的答案折叠态

/** 类型徽章文案（面试题拼难度） */
const badgeLabel = computed(() => {
  if (!current.value) return "";
  const config = CARD_TYPES.find((t) => t.value === current.value!.type);
  const base = config?.label ?? "";
  if (
    current.value.type === "question" &&
    current.value.difficulty &&
    DIFFICULTY_MAP[current.value.difficulty]
  ) {
    return `${base} · ${DIFFICULTY_MAP[current.value.difficulty]}`;
  }
  return base;
});

/** 正文摘要（til/note/bug 用，粗略截断） */
const contentPreview = computed(() => {
  const c = current.value?.content ?? "";
  return c.length > 240 ? c.slice(0, 240) + "…" : c;
});

//面试题不展示正文 只展示参考答案
const hasAnswer = computed(
  () => current.value?.type === "question" && !!current.value.answer?.trim(),
);

const renderedAnswer = computed(() => {
  if (!current.value?.answer) return "";
  const raw = marked.parse(current.value.answer, { async: false }) as string;
  return DOMPurify.sanitize(raw);
});

/** 复习按钮*/
const ACTIONS = Object.entries(MasteryEnum)
  .filter(([value]) => value !== "new")
  .map(([value, { label, color }]) => ({
    value: value as Mastery,
    label,
    color,
  }));

const current = computed<ReviewCard | null>(
  () => cards.value[activeIndex.value] ?? null,
);

/** 翻到下一张（循环切换） */
function nextCard() {
  if (cards.value.length <= 1) return;
  // 要循环，所以要取余
  activeIndex.value = (activeIndex.value + 1) % cards.value.length;
  answerExpanded.value = false;
}

async function loadReviewCards() {
  loading.value = true;
  try {
    cards.value = await getReviewCards(3);
    activeIndex.value = 0;
    answerExpanded.value = false;
  } catch (error) {
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}

/** 点击掌握度按钮：二次确认后提交，成功后重新抽取最新 3 张 */
function submit(mastery: Mastery) {
  if (!current.value || submitting.value) return;
  const label = ACTIONS.find((a) => a.value === mastery)?.label ?? "";
  dialog.warning({
    title: "确认复习结果",
    content: `将这张卡片标记为「${label}」？提交后会更新掌握度，无法撤销。`,
    positiveText: "确认",
    negativeText: "再想想",
    onPositiveClick: async () => {
      if (!current.value) return;
      submitting.value = true;
      try {
        await reviewCardSubmit(current.value.id, mastery);
        await loadReviewCards(); // 提交后重新抽卡，直到卡池抽空显示空态
      } catch (error) {
        message.error(error.message);
      } finally {
        submitting.value = false;
      }
    },
  });
}

onMounted(loadReviewCards);
</script>

<template>
  <div class="pl-6">
    <!-- 标题行 -->
    <div class="mb-3.5">
      <div class="text-[19px] font-semibold text-ink-900">🎲 随手复习</div>
      <div class="text-xs text-ink-500 mt-1">来都来了，复习两张再走</div>
    </div>

    <!-- 加载态：骨架屏（贴合当前卡片结构：徽章 + 标题 + 正文 + 右下标签） -->
    <div v-if="loading" class="review-card">
      <div class="flex items-center justify-between mb-4">
        <n-skeleton :width="72" :height="20" :sharp="false" />
        <n-skeleton :width="90" :height="16" :sharp="false" />
      </div>
      <n-skeleton :width="220" :height="24" :sharp="false" class="mb-3" />
      <n-skeleton text :repeat="2" :sharp="false" class="mb-6" />
      <div class="flex justify-end gap-2">
        <n-skeleton :width="64" :height="30" :sharp="false" />
        <n-skeleton :width="64" :height="30" :sharp="false" />
        <n-skeleton :width="72" :height="30" :sharp="false" />
      </div>
    </div>

    <!-- 空态 -->
    <div
      v-else-if="cards.length === 0"
      class="review-card flex flex-col items-center justify-center py-14 text-center"
    >
      <div class="text-4xl mb-2.5">☕</div>
      <p class="text-base font-medium text-ink-700">空杯以待</p>
      <p class="text-sm mt-1 text-brand-hover">
        去工作台创建几张卡片开始积累吧
      </p>
    </div>

    <!-- 堆叠卡牌 -->
    <div v-else-if="current" class="deck-wrap">
      <!-- 背后堆叠层（按剩余张数显示 1~2 层） -->
      <div v-if="cards.length >= 3" class="deck-peek deck-peek-2"></div>
      <div v-if="cards.length >= 2" class="deck-peek deck-peek-1"></div>

      <!-- 顶层：当前卡 -->
      <div class="review-card deck-top">
        <!-- 徽章 + 切换 -->
        <div class="flex items-center justify-between mb-4">
          <span
            class="inline-block px-2.75 py-0.75 text-[11px] font-semibold -rotate-2 rounded-[3px] border bg-brand-soft text-brand-hover border-[#fde68a]"
          >
            {{ badgeLabel }}
          </span>
          <button
            v-if="cards.length > 1"
            type="button"
            class="text-[13px] text-brand-hover font-medium cursor-pointer hover:text-brand transition-colors"
            @click="nextCard"
          >
            {{ activeIndex + 1 }} / {{ cards.length }} · 下一张 ›
          </button>
        </div>

        <!-- 标题：点击跳卡片详情 -->
        <h3
          class="text-[20px] font-semibold text-ink-900 mb-2.5 leading-snug transition-colors hover:text-brand-hover"
        >
          <RouterLink :to="`/card/${current.id}`">{{
            current.title
          }}</RouterLink>
        </h3>

        <!-- 正文摘要（til/note/bug 直接看内容回忆） -->
        <p
          v-if="contentPreview && current.type !== 'question'"
          class="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-wrap mb-4"
        >
          {{ contentPreview }}
        </p>

        <!-- 面试题：答案折叠 -->
        <div v-if="hasAnswer" class="mb-4">
          <button
            type="button"
            class="text-[13px] font-semibold text-brand-hover cursor-pointer"
            @click="answerExpanded = !answerExpanded"
          >
            {{ answerExpanded ? "▲ 收起答案" : "▼ 查看答案" }}
          </button>
          <div
            v-show="answerExpanded"
            class="mt-2.5 text-sm text-ink-700 leading-relaxed detail-prose"
            v-html="renderedAnswer"
          ></div>
        </div>

        <div class="text-[13.5px] text-brand-hover mb-4">
          请先回忆知识点，再选择你的掌握程度：
        </div>

        <!-- 掌握度：右下角悬浮操作（小尺寸靠边，卡片内容为主） -->
        <div class="flex items-center justify-end gap-2">
          <span class="text-[12px] text-ink-400 mr-auto">掌握程度：</span>
          <button
            v-for="a in ACTIONS"
            :key="a.value"
            type="button"
            :disabled="submitting"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e7e2da] bg-white text-[13px] font-medium text-ink-700 hover:border-[#fcd34d] cursor-pointer disabled:opacity-60"
            @click="submit(a.value)"
          >
            <span
              class="w-2 h-2 rounded-full"
              :style="{ background: a.color }"
            ></span>
            {{ a.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 28px 32px;
}
/* 堆叠卡牌：顶层正常文档流撑高度，背后两层整卡大小、向左上平移，从左上角露出卡角 */
.deck-wrap {
  position: relative;
  margin-top: 20px; /* 给左上堆叠层凸出留白，避免顶到副标题 */
}
.deck-top {
  position: relative;
  z-index: 3;
}
.deck-peek {
  position: absolute;
  inset: 0; /* 贴合顶层卡大小 */
  border-radius: 14px;
  border: 1px solid #fde68a;
}
.deck-peek-1 {
  z-index: 2;
  background: #fef3c7;
  transform: translate(-8px, -8px);
}
.deck-peek-2 {
  z-index: 1;
  background: #fdecc8;
  transform: translate(-16px, -16px);
}
</style>
<style src="@/styles/prose.css"></style>
