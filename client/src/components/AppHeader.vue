<script setup lang="ts">
import { ref, computed, watch, inject } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  SearchOutline,
  DocumentTextOutline,
  GridOutline,
} from "@vicons/ionicons5";
import type { Component } from "vue";
import type { MenuOption } from "naive-ui";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// 有卡片列表的页面显示搜索框；其余（如详情、仪表盘）显示标题胶囊横幅
const showSearch = computed(() =>
  ["home", "workspace", "profile"].includes(route.name as string),
);

// 根据 route.name 推导横幅的图标与标题（内部映射，不依赖 router meta）
const banner = computed<{ icon: Component; title: string }>(() =>
  route.name === "detail"
    ? { icon: DocumentTextOutline, title: "卡片详情" }
    : { icon: GridOutline, title: "仪表盘" },
);

const keyword = ref("");
const search = inject("search") as { keyword: Ref<string>; nonce: Ref<number> };
function handleSearch() {
  // inject拿到共享变量并赋值
  // nonce 每次必变，故相同关键词也能触发页面重新请求。
  search.keyword.value = keyword.value.trim();
  search.nonce.value++;
}

// 路由路径变化时清空搜索框（不从 query 回填，保持各页面作用域隔离）
watch(
  () => route.path,
  () => {
    keyword.value = "";
    search.keyword.value = "";
  },
);
// 导航菜单
const menuOptions: MenuOption[] = [
  { label: "首页", key: "/home" },
  { label: "工作台", key: "/workspace" },
  { label: "仪表盘", key: "/dashboard" },
];

// 菜单高亮：三个菜单项躺在那里,各自有 key,但它们不知道"用户现在在哪个页面"。
const activeKey = computed(
  () =>
    menuOptions.find((m) => route.path.startsWith(m.key as string))?.key ??
    null,
);

function handleMenuSelect(key: string) {
  router.push(key);
}

const userName = computed(() => authStore.user?.username ?? "");
// 无头像的取名字前两个字符转大写展示
const userInitials = computed(() => userName.value.slice(0, 2).toUpperCase());

// 头像菜单和跳转
const userMenuOptions = [
  { label: "个人主页", key: "profile" },
  { label: "退出", key: "logout" },
];

function handleUserMenuSelect(key: string | number) {
  switch (key) {
    case "profile":
      router.push(`/profile?id=${authStore.user?.id}`);
      break;
    case "logout":
      localStorage.removeItem("token");
      authStore.setUser(null);
      router.push("/login");
      break;
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 backdrop-blur bg-bg/90 border-b border-line">
    <div class="max-w-7xl mx-auto flex items-center gap-6 px-8 h-16">
      <!-- Logo -->
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-[9px] bg-brand flex items-center justify-center text-white shadow-[0_1px_3px_rgba(180,83,9,0.35)]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"
            />
          </svg>
        </div>
        <span
          class="font-serif text-[22px] font-semibold tracking-tight text-ink-900"
        >
          DevMind
        </span>
      </div>

      <!-- 中部：搜索框（列表页） / 标题胶囊横幅（详情、仪表盘） -->
      <div class="flex-1 max-w-xl">
        <n-input
          v-if="showSearch"
          v-model:value="keyword"
          placeholder="搜索标题或内容..."
          clearable
          round
          @keydown.enter="handleSearch"
        >
          <template #prefix>
            <n-icon :component="SearchOutline" class="text-ink-400" />
          </template>
        </n-input>
        <span
          v-else
          class="inline-flex items-center gap-2 rounded-full border border-line bg-soft px-3.5 py-1.5 text-[14px] font-medium text-ink-700"
        >
          <n-icon :component="banner.icon" class="text-brand" :size="17" />
          {{ banner.title }}
        </span>
      </div>

      <!-- Nav -->
      <div class="shrink-0 grow-0">
        <n-menu
          mode="horizontal"
          :value="activeKey"
          :options="menuOptions"
          :style="{ width: 'max-content' }"
          @update:value="handleMenuSelect"
        />
      </div>

      <!-- 登录态 -->
      <div class="ml-auto flex items-center">
        <template v-if="authStore.user">
          <n-dropdown
            trigger="hover"
            :options="userMenuOptions"
            @select="handleUserMenuSelect"
          >
            <n-avatar
              v-if="authStore.user.avatar"
              round
              :size="36"
              :src="authStore.user.avatar"
              class="cursor-pointer"
            />
            <n-avatar
              v-else
              round
              :size="36"
              class="cursor-pointer font-semibold shadow-[0_1px_3px_rgba(180,83,9,0.3)]"
              :style="{ backgroundColor: '#b45309', color: '#fff' }"
              :title="userName"
            >
              {{ userInitials }}
            </n-avatar>
          </n-dropdown>
        </template>
        <n-button v-else type="primary" round @click="router.push('/login')">
          登录
        </n-button>
      </div>
    </div>
  </header>
</template>
