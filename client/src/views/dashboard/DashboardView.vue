<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useMessage } from "naive-ui";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart, PieChart, BarChart, RadarChart } from "echarts/charts";
import {
  CalendarComponent,
  VisualMapComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { useAuthStore } from "@/stores/auth";
import {
  getOverviewStats,
  getHeatmap,
  getTagStats,
} from "@/api/dashboardService";
import type { OverviewStats, Mastery } from "@/types/dashboard";
import { MasteryEnum } from "@/types/dashboard";
import {
  buildHeatmapOption,
  buildPieOption,
  buildBarOption,
  buildRadarOption,
} from "./constants";
import { CARD_TYPES } from "@/components/card/constants";
import StatCards from "./components/StatCards.vue";
import ReviewPanel from "./components/ReviewPanel.vue";

use([
  CanvasRenderer,
  HeatmapChart,
  PieChart,
  BarChart,
  RadarChart,
  CalendarComponent,
  VisualMapComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  GridComponent,
]);

const message = useMessage();
const authStore = useAuthStore();

const overview = ref<OverviewStats | null>(null);
const heatmap = ref<{ date: string; count: number }[]>([]);
const tagStats = ref<{ name: string; count: string }[]>([]);

// ---------- 热力图 ----------
const heatmapOption = computed(() => buildHeatmapOption(heatmap.value));

// 三栏卡片配置
const chartCards = computed(() => [
  {
    key: "mastery",
    option: masteryOption.value,
    empty: overview.value?.total_cards === 0,
    emptyIcon: "🌱",
    emptyTitle: "记忆尚未生根",
    emptyDesc: "记下第一张卡，让它慢慢长成你的知识树",
  },
  {
    key: "type",
    option: typeOption.value,
    empty: overview.value?.total_cards === 0,
    emptyIcon: "🗂️",
    emptyTitle: "书架还空着",
    emptyDesc: "笔记、面试题、Bug、TIL —— 从第一张开始填满它",
  },
  {
    key: "radar",
    option: radarOption.value,
    empty: tagStats.value.length < 3,
    emptyIcon: "🎯",
    emptyTitle: "标签还不够画雷达图",
    emptyDesc: "给卡片多打几个标签试试",
  },
]);

// ---------- 掌握度环形 ----------
const masteryOption = computed(() =>
  buildPieOption(
    Object.entries(overview.value?.mastery_distribution ?? {}).map(
      ([key, value]) => {
        const { label, color } = MasteryEnum[key as Mastery];
        return { name: label, color, value };
      },
    ),
  ),
);

// ---------- 卡片类型分布 ----------
const typeOption = computed(() =>
  buildBarOption(
    Object.entries(overview.value?.by_type ?? {}).map(([key, value]) => {
      const { name, color } = CARD_TYPES.find((t) => t.value === key)!;
      return { name, color, value };
    }),
  ),
);

// ---------- 技能雷达 ----------
const radarOption = computed(() => buildRadarOption(tagStats.value));

// 三个统计接口并行请求，全部返回后整页一次性显示（骨架屏期间布局固定不跳动）
const loading = ref(true);

async function loadStats() {
  loading.value = true;
  try {
    const [overviewData, heatmapData, tagData] = await Promise.all([
      getOverviewStats(),
      getHeatmap(),
      getTagStats(8),//返回高频的前8个标签，雷达图多余8个也不太适合
    ]);
    overview.value = overviewData;
    heatmap.value = heatmapData;
    tagStats.value = tagData;
  } catch (error) {
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <main class="max-w-7xl w-full mx-auto px-8 pt-8 pb-10 flex-1">
    <!-- 页头 -->
    <div class="mb-6">
      <h1 class="font-serif text-[32px] font-semibold text-ink-900">
        你的学习仪表盘
      </h1>
      <p class="text-[13.5px] text-ink-500 mt-1">
        {{ authStore.user?.username }} · 今天记一点，明天少一点。
      </p>
    </div>

    <!-- 概览统计卡 -->
    <StatCards :stats="overview" :loading="loading" class="mb-6" />

    <!-- 学习热力图 -->
    <div class="bg-card border border-line rounded-[14px] px-6 py-5.5 mb-6">
      <template v-if="loading">
        <div class="flex items-start justify-between mb-4 gap-4">
          <div>
            <n-skeleton :width="100" :height="18" :sharp="false" />
            <n-skeleton :width="200" :height="13" :sharp="false" class="mt-2" />
          </div>
          <n-skeleton :width="120" :height="14" :sharp="false" />
        </div>
        <n-skeleton height="120px" :sharp="false" />
      </template>
      <v-chart
        v-else
        :option="heatmapOption"
        style="display: block; width: 100%; height: 192px"
        autoresize
      />
    </div>

    <!-- 三栏：掌握度 + 类型 + 雷达 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 mb-6">
      <div
        v-for="c in chartCards"
        :key="c.key"
        class="bg-card border border-line rounded-[14px] px-6 py-5.5"
      >
        <template v-if="loading">
          <div class="mb-4">
            <n-skeleton :width="90" :height="18" :sharp="false" />
            <n-skeleton :width="150" :height="13" :sharp="false" class="mt-2" />
          </div>
          <n-skeleton height="270px" :sharp="false" />
        </template>
        <div
          v-else-if="c.empty"
          class="flex flex-col items-center justify-center pt-16 pb-6 text-ink-500"
        >
          <div class="text-8xl mb-4">{{ c.emptyIcon }}</div>
          <p class="text-sm">{{ c.emptyTitle }}</p>
          <p class="text-xs mt-1 text-ink-400">{{ c.emptyDesc }}</p>
        </div>
        <v-chart
          v-else
          :option="c.option"
          style="display: block; width: 100%; height: 270px"
          autoresize
        />
      </div>
    </div>

    <!-- 今日复习 -->
    <ReviewPanel />
  </main>
</template>
