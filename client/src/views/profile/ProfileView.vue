<script setup lang="ts">
import { computed, onMounted, ref, watch, inject } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { useAuthStore } from "@/stores/auth";
import { getUserFavorites, getUserPublicInfo } from "@/api/profileService";
import { getCardList } from "@/api/homeService";
import type { Card } from "@/types/home";
import type { ProfileUser } from "@/types/profile";
import HomeCard from "@/components/card/HomeCard.vue";

const authStore = useAuthStore();
const message = useMessage();
const search = inject("search") as { keyword: Ref<string>; nonce: Ref<number> };

const route = useRoute();
const router = useRouter();

const profile = ref<ProfileUser | null>(null); //用户资料
const publicCards = ref<Card[]>([]); //公开卡片
const favoriteCards = ref<Card[]>([]); //收藏卡片
const publicTotal = ref(0);
const favoriteTotal = ref(0);
const loading = ref(false);
const loadingCards = ref(false);
const activeTab = ref("public");

const userId = computed(() => Number(route.query.id));

// 头像占位：取 username 前两个字符
const defaultAvatar = computed(() =>
  (profile.value?.username ?? "").trim().slice(0, 2).toUpperCase(),
);

// nickname 与 username 不同时，括号里补昵称；相同则不显示
const nicknameSuffix = computed(() => {
  const n = profile.value?.nickname;
  return n && n !== profile.value?.username ? n : "";
});

// 是否登录本人
const isCurrentUser = computed(() => authStore.user?.id === userId.value);

// 加入时间
const joinedDate = computed(() => {
  if (!profile.value?.created_at) return "";
  const d = new Date(profile.value.created_at);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月加入`;
});

// 当前 tab 对应的卡片与加载态
const activeCards = computed(() =>
  activeTab.value === "public" ? publicCards.value : favoriteCards.value,
);

// 标签云
const tagCloud = computed(() => {
  const counts = new Map<string, number>();
  activeCards.value
    .flatMap((card) => card.tags ?? [])
    .forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 0;
  return sorted.map(([name, count]) => {
    // 按占最大频次的比例分 5 档字号
    const ratio = max === 0 ? 0 : count / max;
    const size =
      ratio >= 0.8
        ? "xl"
        : ratio >= 0.6
          ? "l"
          : ratio >= 0.4
            ? "m"
            : ratio >= 0.2
              ? "s"
              : "xs";
    return { name, count, size };
  });
});

// 登录本人 无简介时跳转工作台
function goWorkspace() {
  router.push("/workspace");
}
// 切换 tab 时按需拉取对应列表
function handleTabChange(tab: string) {
  tab === "public" ? getPublicCards() : getFavorites();
}

// 获取用户资料信息
async function getProfileInfo() {
  if (!userId.value) return;
  loading.value = true;
  try {
    profile.value = await getUserPublicInfo(userId.value);
    await getPublicCards();
    // 收藏 tab 仅本人可见，故只给本人拉收藏
    if (isCurrentUser.value) await getFavorites();
  } catch (error) {
    message.error(error.message);
  } finally {
    loading.value = false;
  }
}
// 公开卡片列表
async function getPublicCards() {
  if (!userId.value) return;
  loadingCards.value = true;
  try {
    const keyword = search.keyword.value.trim();
    const response = await getCardList({
      user_id: userId.value,
      page: 1,
      limit: 100,
      visibility: "public",
      keyword,
    });
    publicCards.value = response.cards;
    publicTotal.value = response.total;
  } catch (error) {
    message.error(error.message);
  } finally {
    loadingCards.value = false;
  }
}
// 收藏卡片列表
async function getFavorites() {
  if (!userId.value) return;
  loadingCards.value = true;
  try {
    const keyword = search.keyword.value.trim();
    const response = await getUserFavorites({
      user_id: userId.value,
      page: 1,
      limit: 100,
      keyword,
    });
    favoriteCards.value = response.cards;
    favoriteTotal.value = response.total;
  } catch (error) {
    message.error(error.message);
  } finally {
    loadingCards.value = false;
  }
}

// 搜索动作（回车）触发时重拉当前 tab 的列表
watch(search.nonce, () =>
  activeTab.value === "public" ? getPublicCards() : getFavorites(),
);

onMounted(getProfileInfo);
</script>

<template>
  <n-spin :show="loading">
    <div class="pb-8">
      <section
        class="relative mx-auto h-39 max-w-7xl overflow-hidden rounded-b-2xl bg-linear-to-r from-[#FEF3C7] via-[#FCD34D] to-[#F59E0B]"
        aria-label="个人主页封面"
      >
        <span class="absolute left-10 top-3 text-5xl opacity-20">📚</span>
        <span class="absolute left-[16%] top-12 text-7xl opacity-20">✨</span>
        <span class="absolute right-8 top-12 text-7xl opacity-20">💡</span>
        <span class="absolute right-36 top-8 text-3xl opacity-20">✦</span>
      </section>

      <section class="relative mx-auto mb-8 max-w-7xl px-8">
        <div
          class="-mt-15 flex flex-col gap-4 rounded-2xl border-x border-b border-line-soft bg-card p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] md:flex-row md:items-end md:gap-6"
        >
          <div
            class="-mt-14 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-linear-to-br from-brand to-brand-deep font-serif text-3xl font-bold text-white shadow-md"
          >
            <img
              v-if="profile?.avatar"
              :src="profile.avatar"
              alt="个人头像"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ defaultAvatar }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h1
              class="font-serif text-2xl font-semibold leading-tight tracking-tight text-ink-900"
            >
              {{ profile?.username }}
              <span
                v-if="nicknameSuffix"
                class="font-sans text-lg font-normal text-ink-400"
              >
                （{{ nicknameSuffix }}）
              </span>
            </h1>
            <p
              class="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-700"
            >
              <template v-if="profile?.bio">{{ profile.bio }}</template>
              <template v-else>
                还没有填写个人简介。
                <button
                  v-if="isCurrentUser"
                  type="button"
                  class="text-brand hover:underline"
                  @click="goWorkspace"
                >
                  去工作台完善
                </button>
              </template>
            </p>
            <div v-if="joinedDate" class="mt-1.5 text-[12.5px] text-ink-400">
              {{ joinedDate }}
            </div>
            <div class="mt-3 flex gap-7 border-t border-line-soft pt-3">
              <div>
                <div
                  class="font-serif text-2xl font-bold leading-none text-ink-900"
                >
                  {{ publicTotal }}
                </div>
                <div class="mt-1 text-xs text-ink-500">张公开卡片</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main class="mx-auto max-w-7xl px-8">
        <section>
          <div class="mb-3.5">
            <h2 class="font-serif text-lg font-semibold text-ink-900">
              知识标签云
            </h2>
            <p class="mt-1 text-[13px] text-ink-500">
              大者，热爱所聚；小者，好奇所栖
            </p>
          </div>
          <div>
            <div
              v-if="tagCloud.length"
              class="flex flex-wrap items-center gap-x-3.5 gap-y-2.5"
            >
              <span
                v-for="tag in tagCloud"
                :key="tag.name"
                :class="[
                  'inline-flex cursor-default items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-brand-hover shadow-[0_1px_2px_rgba(28,25,23,0.04)]',
                  tag.size === 'xl' && 'px-4 py-1.25 text-xl font-bold',
                  tag.size === 'l' && 'px-3.5 py-1.25 text-base font-semibold',
                  tag.size === 'm' && 'text-[15px] font-medium',
                  tag.size === 's' && 'text-[13px]',
                  tag.size === 'xs' && 'text-xs',
                ]"
              >
                {{ tag.name }}
                <span class="font-mono text-[10.5px] text-ink-400">{{
                  tag.count
                }}</span>
              </span>
            </div>
            <n-empty v-else description="暂无标签" />
          </div>
        </section>

        <n-tabs
          v-model:value="activeTab"
          type="line"
          animated
          class="mt-8"
          @update:value="handleTabChange"
        >
          <n-tab name="public">公开卡片 ({{ publicTotal }})</n-tab>
          <n-tab v-if="isCurrentUser" name="favorites">
            收藏的卡片 ({{ favoriteTotal }})
          </n-tab>
        </n-tabs>

        <section class="pt-5">
          <div v-if="loadingCards" class="flex justify-center py-20">
            <n-spin size="medium" description="正在加载卡片..." />
          </div>
          <n-empty
            v-else-if="!activeCards.length"
            description="暂无卡片"
            class="py-16"
          />
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <HomeCard v-for="card in activeCards" :key="card.id" :card="card" />
          </div>
        </section>
      </main>
    </div>
  </n-spin>
</template>
