<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getCardDetail } from "@/api/detailService";
import {
  likeCard,
  unlikeCard,
  favoriteCard,
  unfavoriteCard,
} from "@/api/socialService";
import { togglePin } from "@/api/workspaceService";
import { useAuthStore } from "@/stores/auth";
import type { Card } from "@/types/home";
import { CARD_TYPES, DIFFICULTY_MAP } from "@/components/card/constants";
import dayjs from "@/utils/dayjs";
import {
  Heart,
  HeartOutline,
  Star,
  StarOutline,
  ShareSocialOutline,
} from "@vicons/ionicons5";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

const cardDetail = ref<Card | null>(null);
const loading = ref(true);

// 点赞 / 收藏请求中标志（防重复点击）
const liking = ref(false);
const favoriting = ref(false);

// 参考答案折叠状态（默认收起）
const answerExpanded = ref(false);

//标签徽章
const badgeLabel = computed(() => {
  if (!cardDetail.value) return "";
  const config = CARD_TYPES.find((t) => t.value === cardDetail.value!.type);
  const baseLabel = config?.label;
  if (
    cardDetail.value.type === "question" &&
    cardDetail.value.difficulty &&
    DIFFICULTY_MAP[cardDetail.value.difficulty]
  ) {
    return `${baseLabel} · ${DIFFICULTY_MAP[cardDetail.value.difficulty]}`;
  }
  return baseLabel;
});

// 标签徽章颜色
const badgeClasses = computed(() => {
  if (!cardDetail.value) return "";
  const config = CARD_TYPES.find((t) => t.value === cardDetail.value!.type);
  return config?.classes || "bg-soft text-ink-700 border-line";
});

// 作者
const authorInitials = computed(() => {
  const name = cardDetail.value?.author?.username?.trim();
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
});

// 创建时间
const createdDate = computed(() =>
  cardDetail.value?.created_at
    ? dayjs(cardDetail.value.created_at).format("YYYY-MM-DD")
    : "",
);

// 最后更新时间
const relativeUpdated = computed(() =>
  cardDetail.value?.updated_at
    ? dayjs(cardDetail.value.updated_at).fromNow()
    : "",
);

// 是否登录本人（卡片作者）
const isCurrentUser = computed(
  () => authStore.user?.id === cardDetail.value?.user_id,
);

// 面试题类有参考答案
const hasAnswer = computed(
  () =>
    cardDetail.value?.type === "question" && !!cardDetail.value.answer?.trim(),
);

// ---------- Markdown 渲染 ----------
/** 目录项（右侧「本页目录」的一条） */
interface TocItem {
  /** 锚点 id（如 heading-0），点击目录时据此定位到正文对应标题 */
  id: string;
  /** 目录显示文字（从正文标题文本提取） */
  text: string;
  /** 标题层级：2=h2、3=h3，用于控制目录缩进 */
  level: 2 | 3;
}

const tocItems = ref<TocItem[]>([]);
// 详情正文
const renderedHtml = computed(() => {
  if (!cardDetail.value?.content) return "";
  // 输入（Markdown）：  ## 标题\n**加粗**   输出（HTML）：      <h2>标题</h2><p><strong>加粗</strong></p>
  const rawHtml = marked.parse(cardDetail.value.content, {
    async: false,
  }) as string;
  // sanitize = "消毒/净化"。它把上一步生成的 HTML 里危险的部分删掉，只留安全的标签，防 XSS 攻击（跨站脚本攻击）
  return DOMPurify.sanitize(rawHtml);
});

/** 参考答案的 Markdown 渲染 */
const sanitizedAnswer = computed(() => {
  if (!cardDetail.value?.answer) return "";
  const rawHtml = marked.parse(cardDetail.value.answer, {
    async: false,
  }) as string;
  return DOMPurify.sanitize(rawHtml);
});

/** 渲染完成后扫描 h2/h3，生成目录并写入 id 锚点 */
async function buildToc() {
  tocItems.value = [];
  await nextTick();
  const container = contentRef.value;
  if (!container) return;
  const headings = container.querySelectorAll("h2, h3");
  headings.forEach((el, index) => {
    const level = el.tagName === "H2" ? 2 : 3;
    const text = el.textContent?.trim() || `章节 ${index + 1}`;
    const id = `heading-${index}`;
    el.id = id;
    tocItems.value.push({ id, text, level: level as 2 | 3 });
  });
}

const contentRef = ref<HTMLElement | null>(null);

function scrollToHeading(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- 数据加载 ----------
// 面包屑返回
function goBack() {
  // 有浏览历史就返回上一页（从哪来回哪去）
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push("/home");
  }
}
// 置顶/取消置顶
async function onPin() {
  if (!cardDetail.value) return;
  try {
    const { is_pinned } = await togglePin(cardDetail.value.id);
    cardDetail.value.is_pinned = is_pinned;
    message.success(is_pinned ? "置顶成功" : "已取消置顶");
  } catch (error) {
    message.error(error.message);
  }
}

// 去工作台编辑
function goEdit() {
  if (!cardDetail.value) return;
  router.push(`/workspace?edit=${cardDetail.value.id}`);
}

/** 切换点赞 / 收藏：乐观更新，失败回滚 */
async function toggleSocial(action: "like" | "favorite") {
  const c = cardDetail.value;
  if (!c) return;
  if (!authStore.user) {
    message.warning("请先登录");
    return;
  }
  const isLike = action === "like";
  const loading = isLike ? liking : favoriting;
  if (loading.value) return;
  loading.value = true;
  const prevActive = isLike ? c.liked_by_me : c.favorited_by_me;
  // 乐观更新：直接改 cardDetail 上的状态和计数
  if (isLike) {
    c.liked_by_me = !prevActive;
    c.likes_count += prevActive ? -1 : 1;
  } else {
    c.favorited_by_me = !prevActive;
    c.favorites_count += prevActive ? -1 : 1;
  }
  try {
    if (isLike) {
      await (prevActive ? unlikeCard(c.id) : likeCard(c.id));
    } else {
      await (prevActive ? unfavoriteCard(c.id) : favoriteCard(c.id));
    }
  } catch (error) {
    // 失败回滚
    if (isLike) {
      c.liked_by_me = prevActive;
      c.likes_count += prevActive ? 1 : -1;
    } else {
      c.favorited_by_me = prevActive;
      c.favorites_count += prevActive ? 1 : -1;
    }
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}
// 链接复制分享
async function shareCard() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    message.success("链接已复制到剪贴板");
  } catch {
    message.warning("复制失败，请手动复制地址栏链接");
  }
}

function goAuthor() {
  if (cardDetail.value?.author?.id) {
    router.push(`/profile?id=${cardDetail.value.author.id}`);
  }
}

async function getCardInfo() {
  loading.value = true;
  try {
    cardDetail.value = await getCardDetail(Number(route.params.id));
    await buildToc();
  } catch (error) {
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(getCardInfo);
</script>

<template>
  <n-spin :show="loading">
    <main class="max-w-7xl w-full mx-auto px-8 pt-7 pb-5 flex-1 min-h-[60vh]">
      <div
        v-if="cardDetail"
        class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-12"
      >
        <!-- 主内容 -->
        <article class="min-w-0">
          <!-- 面包屑 -->
          <nav class="flex items-center gap-2 text-[13px] text-ink-500 mb-4.5">
            <button
              type="button"
              class="hover:text-brand transition-colors cursor-pointer"
              @click="goBack"
            >
              ‹ 返回
            </button>
            <span class="text-ink-300">›</span>
            <span class="truncate text-ink-700">{{ cardDetail.title }}</span>
          </nav>

          <!-- 标题块 -->
          <div class="relative pt-4.5 mb-6">
            <span
              :class="[
                'inline-block mb-3.5 px-2.75 py-0.75 text-[11px] font-semibold -rotate-2 rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border',
                badgeClasses,
              ]"
            >
              {{ badgeLabel }}
            </span>
            <h1
              class="font-serif text-[32px] font-semibold leading-[1.2] tracking-tight text-ink-900"
            >
              {{ cardDetail.title }}
            </h1>
          </div>

          <!-- 作者行 -->
          <div
            class="flex items-center gap-3.5 py-3.5 border-y border-line-soft mb-8"
          >
            <div class="min-w-0 text-[13px] text-ink-500">
              <button
                type="button"
                class="font-semibold text-brand cursor-pointer"
                @click="goAuthor"
              >
                {{ cardDetail.author?.username }}
              </button>
              <span class="mx-1.5 text-ink-300">·</span>
              <span>{{ createdDate }}</span>
              <span class="mx-1.5 text-ink-300">·</span>
              <span>更新于 {{ relativeUpdated }}</span>
            </div>
            <div v-if="isCurrentUser" class="ml-auto flex gap-2 shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border text-[13px] cursor-pointer transition-colors"
                :class="
                  cardDetail.is_pinned
                    ? 'bg-brand-soft border-[#fde68a] text-brand-hover'
                    : 'bg-card border-line text-ink-700 hover:bg-soft'
                "
                @click="onPin"
              >
                📌 {{ cardDetail.is_pinned ? "取消置顶" : "置顶" }}
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-line bg-card text-[13px] text-ink-700 cursor-pointer hover:bg-soft transition-colors"
                @click="goEdit"
              >
                ✏️ 编辑
              </button>
            </div>
          </div>

          <!-- 正文（Markdown 渲染）；为空时展示空状态 -->
          <div
            v-if="cardDetail.content?.trim()"
            ref="contentRef"
            class="detail-prose text-[15px] text-ink-700 leading-[1.8]"
            v-html="renderedHtml"
          ></div>
          <div
            v-else
            class="flex flex-col items-center justify-center py-32 text-ink-500"
          >
            <div class="text-7xl mb-5">📭</div>
            <p class="text-lg font-medium text-ink-700">这里空空如也</p>
            <p class="text-sm mt-1.5 text-ink-400">作者还没写下只言片语</p>
          </div>

          <!-- 参考答案（面试题） -->
          <div
            v-if="hasAnswer"
            class="my-5.5 p-4.5 rounded-xl border border-[#fde68a] bg-linear-to-br from-[#fffbeb] to-brand-soft"
          >
            <button
              type="button"
              class="w-full flex items-center gap-2 text-[13px] font-semibold text-brand-hover cursor-pointer"
              @click="answerExpanded = !answerExpanded"
            >
              🎯 参考答案
              <span class="ml-auto text-[10px]">
                {{ answerExpanded ? "▲ 收起" : "▼ 展开" }}
              </span>
            </button>
            <div
              v-show="answerExpanded"
              class="mt-2.5 text-sm text-ink-700 leading-[1.75] detail-prose"
              v-html="sanitizedAnswer"
            ></div>
          </div>

          <!-- 操作栏 -->
          <div
            class="flex flex-wrap items-center gap-2.5 pt-5 border-t border-line mt-10"
          >
            <button
              type="button"
              class="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border text-[13.5px] cursor-pointer transition-colors"
              :class="
                cardDetail.liked_by_me
                  ? 'bg-bad-soft border-[#fca5a5] text-bad'
                  : 'bg-bad-soft/50 border-[#fecaca] text-ink-700 hover:bg-bad-soft'
              "
              @click="toggleSocial('like')"
            >
              <n-icon
                :component="cardDetail.liked_by_me ? Heart : HeartOutline"
                :size="16"
                class="text-bad"
              />
              {{ cardDetail.liked_by_me ? "已点赞" : "点赞" }} ·
              {{ cardDetail.likes_count }}
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border text-[13.5px] cursor-pointer transition-colors"
              :class="
                cardDetail.favorited_by_me
                  ? 'bg-brand-soft border-[#fde68a] text-brand-hover'
                  : 'bg-brand-soft/50 border-[#fde68a] text-ink-700 hover:bg-brand-soft'
              "
              @click="toggleSocial('favorite')"
            >
              <n-icon
                :component="cardDetail.favorited_by_me ? Star : StarOutline"
                :size="16"
                class="text-brand"
              />
              {{ cardDetail.favorited_by_me ? "已收藏" : "收藏" }} ·
              {{ cardDetail.favorites_count }}
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#bae6fd] bg-info-soft/50 text-ink-700 text-[13.5px] cursor-pointer hover:bg-info-soft transition-colors"
              @click="shareCard"
            >
              <n-icon
                :component="ShareSocialOutline"
                :size="16"
                class="text-info"
              />
              分享
            </button>
            <div
              v-if="cardDetail.tags && cardDetail.tags.length > 0"
              class="ml-auto flex flex-wrap gap-1.5"
            >
              <span
                v-for="tag in cardDetail.tags"
                :key="tag"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#fde68a] bg-brand-soft text-brand-hover"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </article>

        <!-- 右侧栏 -->
        <aside class="hidden lg:block">
          <div class="sticky top-24 space-y-4.5">
            <!-- 作者卡 -->
            <div
              class="bg-card border border-line rounded-xl p-5.5 text-center"
            >
              <button
                type="button"
                class="block w-full cursor-pointer"
                @click="goAuthor"
              >
                <div
                  class="w-14 h-14 rounded-full mx-auto mb-2.5 flex items-center justify-center text-white text-lg font-semibold bg-linear-to-br from-brand to-brand-deep shadow-[0_2px_8px_rgba(180,83,9,0.25)] overflow-hidden"
                >
                  <img
                    v-if="cardDetail.author?.avatar"
                    :src="cardDetail.author.avatar"
                    alt="avatar"
                    class="w-full h-full object-cover"
                  />
                  <template v-else>{{ authorInitials }}</template>
                </div>
                <div
                  class="text-base font-semibold tracking-tight text-ink-900 hover:text-brand transition-colors"
                >
                  {{ cardDetail.author?.username }}
                </div>
              </button>
              <div
                v-if="cardDetail.author?.bio"
                class="text-[12.5px] text-ink-500 mt-1"
              >
                {{ cardDetail.author.bio }}
              </div>
            </div>

            <!-- 目录（客户端从 h2/h3 生成） -->
            <div
              v-if="tocItems.length > 0"
              class="bg-card border border-line rounded-xl p-4.5"
            >
              <div
                class="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3.5"
              >
                本页目录
              </div>
              <nav class="text-[13px]">
                <button
                  v-for="item in tocItems"
                  :key="item.id"
                  type="button"
                  class="block w-full text-left py-1.5 pl-2.5 border-l-2 border-transparent text-ink-700 hover:text-brand hover:border-brand transition-colors cursor-pointer"
                  :class="
                    item.level === 3 ? 'pl-5.5 text-[12.5px] text-ink-500' : ''
                  "
                  @click="scrollToHeading(item.id)"
                >
                  {{ item.text }}
                </button>
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </n-spin>
</template>

<style src="@/styles/prose.css"></style>
