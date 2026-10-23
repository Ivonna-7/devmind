<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from "vue";
import type { Ref } from "vue";
import { useMessage } from "naive-ui";
import { getCardList } from "@/api/homeService";
import type { Card, CardType, CardSort } from "@/types/home";
import HomeCard from "@/components/card/HomeCard.vue";
import { CARD_TYPES } from "@/components/card/constants";

const message = useMessage();
const search = inject("search") as { keyword: Ref<string>; nonce: Ref<number> };

// 筛选与排序状态
const currentType = ref<CardType | "all">("all");
const sort = ref<CardSort>("newest");

// 卡片列表与请求状态
const cards = ref<Card[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(20);
const totalPages = ref(1);
const loading = ref(false);

const typeTabs: { label: string; name: string; value: CardType | "all" }[] = [
  { label: "全部", name: "记录", value: "all" },
  ...CARD_TYPES.map(({ label, name, value }) => ({ label, name, value })),
];

// 结果数文案：全部 → “共 X 篇记录”；具体类型 → “共 X 篇笔记”
const resultLabel = computed(() => {
  const name =
    typeTabs.find((t) => t.value === currentType.value)?.name ?? "记录";
  return `共 ${total.value} 篇${name}`;
});
/** 加载卡片列表数据 */
async function getCards() {
  loading.value = true;
  try {
    const res = await getCardList({
      type: currentType.value === "all" ? null : currentType.value,
      sort: sort.value,
      keyword: search.keyword.value.trim() || undefined,
      page: page.value,
      limit: limit.value,
    });
    cards.value = res.cards;
    total.value = res.total;
    totalPages.value = res.total_pages;
  } catch (error) {
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}

// 筛选条件（类型 / 排序 / 每页条数）或搜索动作（searchNonce）变化：回到第 1 页
// page 已是 1 时不会触发下方 watch，故这里直接 getCards；page 非 1 时置 1 会触发下方 watch。
// 为避免双请求，这里只重置 page，统一由 page 的 watch 发请求
watch([currentType, sort, search.nonce, limit], () => {
  if (page.value === 1) {
    getCards();
  } else {
    page.value = 1;
  }
});

// 翻页：页码变化重新获取
watch(page, getCards);

onMounted(getCards);
</script>

<template>
  <!-- Hero Section -->
  <section class="max-w-7xl w-full mx-auto px-8 pt-6 pb-6">
    <div class="flex items-end justify-between gap-12">
      <div>
        <h1
          class="font-serif text-[40px] font-semibold leading-[1.1] tracking-tight text-ink-900"
        >
          你的知识，成册成<em class="text-brand not-italic">篇</em>。
        </h1>
        <p class="mt-3 text-ink-700 text-[15.5px] leading-relaxed max-w-xl">
          开发者的知识卡片社区。记录笔记、沉淀面经、复盘
          Bug、分享顿悟——像便签纸一样轻，像图书馆一样整齐。
        </p>
      </div>
      <div class="hidden lg:block shrink-0">
        <svg width="160" height="124" viewBox="0 0 220 170" fill="none">
          <rect
            x="30"
            y="80"
            width="120"
            height="80"
            rx="7"
            fill="#FDE68A"
            stroke="#B45309"
            stroke-width="1.5"
            transform="rotate(-5 90 120)"
          />
          <line
            x1="48"
            y1="100"
            x2="130"
            y2="100"
            stroke="#B45309"
            stroke-width="1"
            opacity="0.35"
            transform="rotate(-5 90 120)"
          />
          <line
            x1="48"
            y1="112"
            x2="115"
            y2="112"
            stroke="#B45309"
            stroke-width="1"
            opacity="0.35"
            transform="rotate(-5 90 120)"
          />
          <rect
            x="70"
            y="55"
            width="120"
            height="90"
            rx="7"
            fill="#FFFFFF"
            stroke="#15803D"
            stroke-width="1.5"
            transform="rotate(3 130 100)"
          />
          <line
            x1="88"
            y1="78"
            x2="175"
            y2="78"
            stroke="#15803D"
            stroke-width="1"
            opacity="0.3"
            transform="rotate(3 130 100)"
          />
          <line
            x1="88"
            y1="92"
            x2="160"
            y2="92"
            stroke="#15803D"
            stroke-width="1"
            opacity="0.3"
            transform="rotate(3 130 100)"
          />
          <line
            x1="88"
            y1="106"
            x2="170"
            y2="106"
            stroke="#15803D"
            stroke-width="1"
            opacity="0.3"
            transform="rotate(3 130 100)"
          />
          <rect
            x="50"
            y="30"
            width="120"
            height="85"
            rx="7"
            fill="#FEE2E2"
            stroke="#B91C1C"
            stroke-width="1.5"
            transform="rotate(-2 110 72)"
          />
          <line
            x1="68"
            y1="55"
            x2="150"
            y2="55"
            stroke="#B91C1C"
            stroke-width="1"
            opacity="0.3"
            transform="rotate(-2 110 72)"
          />
          <line
            x1="68"
            y1="68"
            x2="140"
            y2="68"
            stroke="#B91C1C"
            stroke-width="1"
            opacity="0.3"
            transform="rotate(-2 110 72)"
          />
          <line
            x1="68"
            y1="81"
            x2="145"
            y2="81"
            stroke="#B91C1C"
            stroke-width="1"
            opacity="0.3"
            transform="rotate(-2 110 72)"
          />
          <text x="195" y="45" font-size="18" fill="#B45309">✦</text>
          <text x="10" y="110" font-size="14" fill="#15803D">✦</text>
          <text x="200" y="150" font-size="12" fill="#B91C1C">✦</text>
        </svg>
      </div>
    </div>
  </section>

  <!-- Filter Bar (Sticky under header) -->
  <section
    class="border-y border-line bg-bg/95 backdrop-blur sticky top-16 z-30"
  >
    <div
      class="max-w-7xl mx-auto px-8 py-3.5 flex items-center justify-between flex-wrap gap-3"
    >
      <div class="flex items-center gap-1 overflow-x-auto py-0.5">
        <button
          v-for="tab in typeTabs"
          :key="tab.value"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-[13.5px] transition-colors cursor-pointer whitespace-nowrap',
            currentType === tab.value
              ? 'bg-brand text-white font-medium shadow-xs'
              : 'text-ink-700 hover:bg-soft',
          ]"
          @click="currentType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-[13px] text-ink-500 whitespace-nowrap">{{
          resultLabel
        }}</span>
        <div class="flex items-center gap-2.5 text-[13px] text-ink-700">
          <span class="text-ink-500">排序</span>
          <select
            v-model="sort"
            class="bg-card border border-line rounded-lg px-3 py-1.5 text-[13px] text-ink-700 focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="newest">最新</option>
            <option value="most_liked">最热</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content / Cards Feed -->
  <main class="max-w-7xl w-full mx-auto px-8 pt-6 pb-4 flex-1">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24 text-ink-500"
    >
      <div
        class="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin mb-3"
      ></div>
      <p class="text-sm">正在加载卡片...</p>
    </div>
    <div v-else-if="cards.length === 0" class="text-center py-24 text-ink-500">
      <div class="text-4xl mb-3">🌱</div>
      <p class="text-base font-medium text-ink-700">空白也是一种开始</p>
      <p class="text-sm mt-1 text-ink-400">
        试试别的分类，或成为第一个记录的人
      </p>
    </div>

    <!-- 瀑布流：CSS columns 按列填充，卡片高度各自保留、错落排列 -->
    <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-5.5">
      <div
        v-for="card in cards"
        :key="card.id"
        class="break-inside-avoid mb-5.5"
      >
        <HomeCard :card="card" />
      </div>
    </div>
  </main>

  <!-- 分页（main 外，独立间距） -->
  <div
    v-if="cards.length > 0"
    class="max-w-7xl w-full mx-auto px-8 pb-4 flex justify-center"
  >
    <n-pagination
      v-model:page="page"
      v-model:page-size="limit"
      :page-count="totalPages"
      :page-sizes="[10, 20, 30, 50]"
      show-size-picker
      show-quick-jumper
    />
  </div>
</template>
