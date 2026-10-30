<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import type { CardType } from "@/types/home";
import type { OverviewStats } from "@/types/dashboard";
import { getAllTags } from "@/api/workspaceService";
import { getOverviewStats } from "@/api/dashboardService";
import { CARD_TYPES, VISIBILITY_OPTIONS } from "@/components/card/constants";

const emit = defineEmits<{
  // 筛选变了，通知父组件重查（状态由本组件持有，父组件通过 defineExpose 读 filter）
  (e: "change"): void;
}>();

// 展示数据：概览统计（计数）+ 标签云
const stats = ref<OverviewStats | null>(null);
const tags = ref<{ name: string; count: number }[]>([]);

// 筛选状态（高亮用；变更时 emit 给父组件查列表）
const filter = reactive<{
  type: CardType | null;
  visibility: "public" | "private" | null;
  tag: string | null;
}>({
  type: null,
  visibility: null,
  tag: null,
});

/** 计数：从 overview 指定分布桶（by_type / by_visibility）读取，无数据显示 0 */
function count(group: "by_type" | "by_visibility", value: string): number {
  return (stats.value?.[group] as Record<string, number>)?.[value] ?? 0;
}

// 「全部」激活态：三个维度都未选
const isAllActive = computed(
  () =>
    filter.type === null && filter.visibility === null && filter.tag === null,
);

/**
 * 统一筛选入口：
 * - select()：清空三个维度（「全部」）
 * - select(key, value)：切换该维度（再点同值取消回 null = 不筛）
 */
function select(key?: "type" | "visibility" | "tag", value?: string) {
  if (!key) {
    filter.type = null;
    filter.visibility = null;
    filter.tag = null;
  } else {
    filter[key] = filter[key] === value ? null : (value as any);
  }
  emit("change");
}

/** 拉取展示数据（计数 + 标签云）；任一失败整块回落 */
async function getSidebarData() {
  try {
    const [s, t] = await Promise.all([getOverviewStats(), getAllTags()]);
    stats.value = s;
    tags.value = t;
  } catch {
    stats.value = null;
    tags.value = [];
  }
}

onMounted(getSidebarData);

// 对外暴露：filter（父组件查列表时读）、refresh（增删改后刷新计数 / 标签云）
defineExpose({ filter, refresh: getSidebarData });
</script>

<template>
  <aside class="sticky top-22 self-start">
    <!-- 视图 -->
    <div class="mb-6.5">
      <div
        class="text-[11.5px] font-semibold text-ink-500 uppercase tracking-wider mb-2.5 pl-2.5"
      >
        视图
      </div>
      <button
        type="button"
        :class="[
          'w-full flex items-center justify-between px-3 py-2 rounded-[9px] text-[13.5px] cursor-pointer transition-colors',
          isAllActive
            ? 'bg-brand-soft text-brand-hover font-medium'
            : 'text-ink-700 hover:bg-soft',
        ]"
        @click="select()"
      >
        <span>📋 全部</span>
        <span
          :class="[
            'text-[11.5px] font-mono',
            isAllActive ? 'text-brand' : 'text-ink-400',
          ]"
          >{{ stats?.total_cards ?? 0 }}</span
        >
      </button>
    </div>

    <!-- 类型 -->
    <div class="mb-6.5">
      <div
        class="text-[11.5px] font-semibold text-ink-500 uppercase tracking-wider mb-2.5 pl-2.5"
      >
        类型
      </div>
      <button
        v-for="t in CARD_TYPES"
        :key="t.value"
        type="button"
        :class="[
          'w-full flex items-center justify-between px-3 py-2 rounded-[9px] text-[13.5px] cursor-pointer transition-colors',
          filter.type === t.value
            ? 'bg-brand-soft text-brand-hover font-medium'
            : 'text-ink-700 hover:bg-soft',
        ]"
        @click="select('type', t.value)"
      >
        <span>{{ t.label }}</span>
        <span
          :class="[
            'text-[11.5px] font-mono',
            filter.type === t.value ? 'text-brand' : 'text-ink-400',
          ]"
          >{{ count("by_type", t.value) }}</span
        >
      </button>
    </div>

    <!-- 可见性 -->
    <div class="mb-6.5">
      <div
        class="text-[11.5px] font-semibold text-ink-500 uppercase tracking-wider mb-2.5 pl-2.5"
      >
        可见性
      </div>
      <button
        v-for="opt in VISIBILITY_OPTIONS"
        :key="opt.value"
        type="button"
        :class="[
          'w-full flex items-center justify-between px-3 py-2 rounded-[9px] text-[13.5px] cursor-pointer transition-colors',
          filter.visibility === opt.value
            ? 'bg-brand-soft text-brand-hover font-medium'
            : 'text-ink-700 hover:bg-soft',
        ]"
        @click="select('visibility', opt.value)"
      >
        <span>{{ opt.label }}</span>
        <span
          :class="[
            'text-[11.5px] font-mono',
            filter.visibility === opt.value ? 'text-brand' : 'text-ink-400',
          ]"
          >{{ count("by_visibility", opt.value) }}</span
        >
      </button>
    </div>

    <!-- 标签云 -->
    <div v-if="tags.length > 0" class="mb-6.5">
      <div
        class="text-[11.5px] font-semibold text-ink-500 uppercase tracking-wider mb-2.5 pl-2.5"
      >
        标签
      </div>
      <div class="flex flex-wrap gap-1.5 px-2.5">
        <button
          v-for="tag in tags"
          :key="tag.name"
          type="button"
          :class="[
            'text-[12.5px] px-2.25 py-0.75 rounded-full cursor-pointer transition-colors',
            filter.tag === tag.name
              ? 'bg-brand-soft text-brand'
              : 'bg-soft text-ink-700 hover:bg-brand-soft hover:text-brand',
          ]"
          @click="select('tag', tag.name)"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>
  </aside>
</template>
