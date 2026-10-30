<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, inject } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { ListOutline, GridOutline } from "@vicons/ionicons5";
import { getCardList } from "@/api/homeService";
import { getCardDetail } from "@/api/detailService";
import { createCard } from "@/api/workspaceService";
import { useAuthStore } from "@/stores/auth";
import type { Card, CardSort } from "@/types/home";
import WorkspaceSidebar from "./components/WorkspaceSidebar.vue";
import WorkspaceCard from "./components/WorkspaceCard.vue";
import CardForm from "./components/CardForm.vue";

const message = useMessage();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const search = inject("search") as { keyword: Ref<string>; nonce: Ref<number> };

// ---------- 筛选 / 布局状态 ----------
const sort = ref<CardSort>("newest");
const layout = ref<"list" | "grid">("list");

// ---------- 数据 ----------
const cards = ref<Card[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(20);
const totalPages = ref(1);
const loading = ref(false);

// 侧边栏实例（增删改后调用其 refresh 刷新计数 / 标签云）
const sidebarRef = ref<InstanceType<typeof WorkspaceSidebar> | null>(null);

// ---------- 新建或编辑CardForm 弹窗状态 ----------
const dialog = reactive<{
  visible: boolean;
  mode: "create" | "edit";
  card: Card | null;
}>({
  visible: false,
  mode: "create",
  card: null,
});

// 当前页按置顶拆分（仅用于展示分区，非服务端筛选）
const pinnedCards = computed(() => cards.value.filter((c) => c.is_pinned));
const normalCards = computed(() => cards.value.filter((c) => !c.is_pinned));

// 侧边栏筛选 / 最新、最热排序
// 筛选 / 排序 / 搜索 / 每页条数变：回第 1 页（已是 1 则直接请求，避免双请求）
function reload() {
  if (page.value === 1) getCards();
  else page.value = 1;
}

// ---------- 快速创建 ----------
// 顶部输入标题后回车自动生成一条私有的til（今日所学）类型的卡片
const quickTitle = ref("");
const quickCreating = ref(false);
async function quickCreate() {
  const text = quickTitle.value.trim();
  if (!text || quickCreating.value) return;
  quickCreating.value = true;
  try {
    await createCard({ title: text, content: text, type: "til" });
    quickTitle.value = "";
    message.success("已创建 TIL");
    await refreshAll();
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    quickCreating.value = false;
  }
}

// ---------- 新建 / 编辑弹窗 ----------
function openForm(mode: "create" | "edit", card: Card | null = null) {
  dialog.mode = mode;
  dialog.card = card;
  dialog.visible = true;
}
function closeForm() {
  dialog.visible = false;
  dialog.card = null;
}

// 从详情页跳过来带 ?edit=卡片id：按 id 拉该卡并打开编辑弹窗，随后清掉 query（防刷新重弹）
async function openEditFromQuery() {
  const id = Number(route.query.edit);
  if (!id) return;
  try {
    const card = await getCardDetail(id);
    openForm("edit", card);
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    router.replace({ query: {} });
  }
}

/** 刷新列表 + 侧边栏计数 / 标签云（增删改后调用） */
async function refreshAll() {
  await Promise.all([getCards(), sidebarRef.value?.refresh()]);
}

/** 加载卡片列表（始终带 user_id = 自己；筛选条件读侧边栏持有的 filter） */
async function getCards() {
  if (!authStore.user) return;
  const filter = sidebarRef.value?.filter;
  loading.value = true;
  try {
    const res = await getCardList({
      user_id: authStore.user.id,
      type: filter?.type ?? undefined,
      visibility: filter?.visibility ?? undefined,
      tag: filter?.tag ?? undefined,
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

watch([sort, search.nonce, limit], reload);
watch(page, getCards);

onMounted(() => {
  getCards();
  openEditFromQuery();
});
</script>

<template>
  <main class="max-w-7xl w-full mx-auto px-8 flex-1">
    <div class="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-9 pt-8">
      <!-- 左侧筛选 -->
      <WorkspaceSidebar
        ref="sidebarRef"
        class="hidden lg:block"
        @change="reload"
      />

      <!-- 右侧主区 -->
      <section class="min-w-0">
        <!-- 头部 -->
        <div class="flex items-end justify-between mb-5">
          <div>
            <span class="font-serif text-[32px] font-semibold text-ink-900"
              >我的卡片</span
            >
            <span class="text-[13px] text-ink-500 ml-2.5">{{ total }} 张</span>
          </div>
          <button
            type="button"
            class="px-4.5 py-2.5 rounded-xl bg-brand text-white text-[15px] font-medium cursor-pointer hover:bg-brand-hover transition-colors shadow-[0_1px_3px_rgba(180,83,9,0.25)]"
            @click="openForm('create')"
          >
            + 新建卡片
          </button>
        </div>

        <!-- 快速创建 -->
        <div
          class="flex items-center gap-3 mb-6 px-4.5 py-3.5 rounded-[14px] border border-dashed border-[#FDE68A] bg-linear-to-br from-[#FFFBEB] to-[#FEF3C7]"
        >
          <span class="text-xl">✍️</span>
          <input
            v-model="quickTitle"
            type="text"
            placeholder="记一则 TIL，从一个标题开始…"
            :disabled="quickCreating"
            class="flex-1 bg-white/50 border border-line-soft rounded-[10px] px-3.5 py-2 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand transition-colors"
            @keydown.enter.prevent="quickCreate"
          />
          <span class="text-[11.5px] text-[#A16207] whitespace-nowrap">
            按
            <kbd
              class="font-mono text-[11px] px-1.25 py-px rounded bg-soft text-ink-500 border border-line"
              >Enter</kbd
            >
            创建为 TIL
          </span>
        </div>

        <!-- 工具栏 -->
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex gap-2">
            <button
              type="button"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors',
                layout === 'list'
                  ? 'bg-brand text-white border-brand'
                  : 'bg-card text-ink-700 border-line hover:bg-soft',
              ]"
              @click="layout = 'list'"
            >
              <n-icon :component="ListOutline" /> 列表
            </button>
            <button
              type="button"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors',
                layout === 'grid'
                  ? 'bg-brand text-white border-brand'
                  : 'bg-card text-ink-700 border-line hover:bg-soft',
              ]"
              @click="layout = 'grid'"
            >
              <n-icon :component="GridOutline" /> 网格
            </button>
          </div>
          <select
            v-model="sort"
            class="bg-card border border-line rounded-lg px-3 py-1.5 text-[13px] text-ink-700 focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="newest">最新</option>
            <option value="most_liked">最热</option>
          </select>
        </div>

        <!-- 空状态 -->
        <div
          v-if="!loading && cards.length === 0"
          class="text-center py-24 text-ink-500"
        >
          <div class="text-4xl mb-3">🗂️</div>
          <p class="text-base font-medium text-ink-700">这里还空空如也</p>
          <p class="text-sm mt-1 text-ink-400">
            点右上角「新建卡片」，或用上面的快速记录开张
          </p>
        </div>

        <!-- 卡片区：n-spin 包裹 -->
        <n-spin
          v-else
          :show="loading"
          :class="loading ? 'block min-h-60' : ''"
        >
          <!-- 置顶区（当前页存在置顶卡时展示，统一用网格迷你卡） -->
          <template v-if="pinnedCards.length > 0">
            <div
              class="flex items-center gap-2 text-[11.5px] font-semibold text-ink-500 uppercase tracking-wider mt-2 mb-2.5"
            >
              📌 置顶卡片 · {{ pinnedCards.length }}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5">
              <WorkspaceCard
                v-for="card in pinnedCards"
                :key="card.id"
                :card="card"
                variant="grid"
                @edit="(card) => openForm('edit', card)"
                @changed="refreshAll"
              />
            </div>
          </template>

          <!-- 普通区 -->
          <div
            v-if="normalCards.length > 0"
            class="flex items-center gap-2 text-[11.5px] font-semibold text-ink-500 uppercase tracking-wider mt-6.5 mb-2.5"
          >
            {{ pinnedCards.length > 0 ? "其他卡片" : "全部卡片" }}
          </div>

          <!-- 列表布局 -->
          <div v-if="layout === 'list'" class="space-y-2.5">
            <WorkspaceCard
              v-for="card in normalCards"
              :key="card.id"
              :card="card"
              variant="list"
              @edit="(card) => openForm('edit', card)"
              @changed="refreshAll"
            />
          </div>

          <!-- 网格布局 -->
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5"
          >
            <WorkspaceCard
              v-for="card in normalCards"
              :key="card.id"
              :card="card"
              variant="grid"
              @edit="(card) => openForm('edit', card)"
              @changed="refreshAll"
            />
          </div>

          <!-- 分页 -->
          <div class="flex justify-center mt-4 pb-4">
            <n-pagination
              v-model:page="page"
              v-model:page-size="limit"
              :page-count="totalPages"
              :page-sizes="[10, 20, 30, 50]"
              show-size-picker
            />
          </div>
        </n-spin>
      </section>
    </div>

    <!-- 新建 / 编辑弹窗 -->
    <CardForm
      v-if="dialog.visible"
      :mode="dialog.mode"
      :card="dialog.card"
      @saved="refreshAll"
      @close="closeForm"
    />
  </main>
</template>
