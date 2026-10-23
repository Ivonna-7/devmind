<script setup lang="ts">
import { RouterView } from "vue-router";
import { NConfigProvider, NMessageProvider, zhCN, dateZhCN } from "naive-ui";
import type { GlobalThemeOverrides } from "naive-ui";

// 用项目的暖琥珀主色覆盖Naive ui默认蓝
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#b45309",//主色默认态
    primaryColorHover: "#92400e",//鼠标悬停时颜色
    primaryColorPressed: "#78350f",//按下（active）那一刻的颜色
    primaryColorSuppl: "#b45309",//补充色，典型是暗色主题下的填充、或 loading 条之类。官方要求必须单独给，不会自动等于 primaryColor
  },
  Dropdown: {
    color: "#fbf8f3",
    optionColorHover: "#f5f0e8",
    optionTextColor: "#44403c",
    optionTextColorHover: "#1c1917",
    borderRadius: "10px",
  },
};
</script>
<template>
  <!-- Naive UI 的提示挂在 Vue 组件树里（而不是像有些库直接挂 body），这样它能继承你的主题。所以 useMessage() 只能在 provider 内部的组件里调。 -->
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <RouterView />
    </n-message-provider>
  </n-config-provider>
</template>
