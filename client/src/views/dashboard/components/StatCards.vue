<!--
  概览统计卡（4 格）：渐变暖底 + 实心图标 + 浮雕大数字
  - 数据来自 overview：卡片总数 / 获得点赞 / 被收藏 / 已掌握
-->
<script setup lang="ts">
import { computed } from "vue";
import {
  LibraryOutline,
  HeartOutline,
  Star,
  TrophyOutline,
} from "@vicons/ionicons5";
import type { OverviewStats } from "@/types/dashboard";

const props = defineProps<{
  stats: OverviewStats | null;
  loading?: boolean;
}>();

const items = computed(() => [
  {
    label: "卡片总数",
    en: "CARDS",
    value: props.stats?.total_cards ?? 0,
    icon: LibraryOutline,
    color: "#b45309",
    grad: "linear-gradient(135deg,#fffbeb,#fef3c7)",
  },
  {
    label: "获得点赞",
    en: "LIKES",
    value: props.stats?.total_likes_received ?? 0,
    icon: HeartOutline,
    color: "#b91c1c",
    grad: "linear-gradient(135deg,#fffbeb,#fee2e2)",
  },
  {
    label: "被收藏",
    en: "SAVED",
    value: props.stats?.total_favorites_received ?? 0,
    icon: Star,
    color: "#ca8a04",
    grad: "linear-gradient(135deg,#fffdf5,#fef9c3)",
  },
  {
    label: "已掌握",
    en: "MASTERED",
    value: props.stats?.mastery_distribution?.master ?? 0,
    icon: TrophyOutline,
    color: "#15803d",
    grad: "linear-gradient(135deg,#f6fff9,#dcfce7)",
  },
]);
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
    <!-- 加载态 -->
    <template v-if="loading">
      <div
        v-for="i in 4"
        :key="i"
        class="border border-line-soft rounded-[18px] px-6 py-5"
      >
        <div class="flex items-center justify-between mb-3">
          <!-- :sharp="false" ：要圆角的骨架条 -->
          <n-skeleton :width="36" :height="36" class="rounded-[10px]" :sharp="false" />
          <n-skeleton :width="44" :height="12" :sharp="false" />
        </div>
        <n-skeleton :width="56" :height="40" :sharp="false" />
        <n-skeleton :width="48" :height="12" :sharp="false" class="mt-2" />
      </div>
    </template>

    <template v-else>
      <div
        v-for="(item, i) in items"
        :key="i"
        class="border border-line-soft rounded-[18px] px-6 py-5"
        :style="{ background: item.grad }"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-white"
            :style="{ background: item.color }"
          >
            <n-icon :component="item.icon" :size="18" />
          </span>
          <span
            class="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-400"
          >
            {{ item.en }}
          </span>
        </div>
        <div class="font-serif text-[40px] leading-none text-ink-900">
          {{ item.value }}
        </div>
        <div class="text-[12px] text-ink-500 mt-1.5">{{ item.label }}</div>
      </div>
    </template>
  </div>
</template>
