<script setup lang="ts">
import { provide, ref } from "vue";
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

// 搜索上下文：keyword（已提交关键词 + nonce（回车动作触发器，每次递增）
// nonce 解决「相同关键词回车不触发」。
const search = { keyword: ref(""), nonce: ref(0) };
provide("search", search);
</script>

<template>
  <div class="min-h-screen bg-bg text-ink-900 flex flex-col font-sans">
    <AppHeader />
    <RouterView :key="$route.fullPath" />
    <AppFooter />
  </div>
</template>
