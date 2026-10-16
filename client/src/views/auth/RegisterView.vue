<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";
import { register } from "@/api/authService";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const message = useMessage();
const authStore = useAuthStore();
const router = useRouter();

const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const model = ref({
  username: "",
  email: "",
  password: "",
});

const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: ["blur", "input"] },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: ["blur", "input"] },
    { type: "email", message: "邮箱格式不正确", trigger: ["blur"] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: ["blur", "input"] },
  ],
};

// 注册提交
const handleRegister = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      return;
    }

    loading.value = true;
    try {
      const { token, user } = await register({
        username: model.value.username,
        email: model.value.email,
        password: model.value.password,
      });
      localStorage.setItem("token", token);
      authStore.setUser(user);
      message.success("注册成功");
      router.push("/home");
    } catch (error) {
      message.error(error.message);
    } finally {
      loading.value = false;
    }
  });
};
</script>

<template>
  <main
    class="auth-shell grid min-h-screen grid-cols-[1.05fr_0.95fr] max-[900px]:grid-cols-1"
  >
    <!-- 左侧区域 -->
    <section
      class="brand-side relative flex flex-col overflow-hidden px-14 py-12 max-[900px]:px-7 max-[900px]:py-9 max-[420px]:px-5 max-[420px]:py-7"
      aria-label="DevMind 介绍"
    >
      <!-- 左侧标题 -->
      <div class="relative z-10">
        <div class="inline-flex items-center gap-2.75">
          <span
            class="flex size-10 items-center justify-center rounded-[11px] bg-brand-deep text-white shadow-[0_2px_8px_rgba(120,53,15,0.4)]"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
              />
            </svg>
          </span>
          <span class="font-serif text-[29px] leading-none text-ink-900"
            >DevMind</span
          >
        </div>
      </div>
      <!-- 左侧介绍 -->
      <div class="relative z-10 mt-13.5 max-w-110 max-[900px]:mt-7.5">
        <div
          class="font-mono text-xs uppercase tracking-[0.08em] text-brand-deep opacity-80"
        >
          // knowledge, bound
        </div>
        <h1
          class="mt-3.5 font-serif text-[50px] font-normal leading-[1.08] tracking-[-0.01em] text-ink-900 max-[900px]:text-[38px] max-[420px]:text-[32px]"
        >
          把散落的顿悟，<br />
          装订成<span class="text-brand-deep">一册</span>。
        </h1>
        <p
          class="mt-4.5 max-w-95 text-[15px] leading-[1.7] text-brand-deep max-[420px]:text-sm"
        >
          笔记、面经、Bug
          复盘、每日一得——登录后，它们重新回到你手边，随手可翻，随查随用。
        </p>
      </div>
      <!-- 左侧卡片 -->
      <div
        class="relative z-10 mt-auto h-58 shrink-0 max-[900px]:hidden"
        aria-hidden="true"
      >
        <div class="absolute inset-x-0 bottom-0 -translate-y-12.5">
          <div
            class="absolute bottom-1 left-0.5 w-52.5 -rotate-6 rounded-xl bg-card px-4 py-3.5 shadow-[0_10px_30px_rgba(120,53,15,0.16)]"
          >
            <span
              class="absolute -top-2 left-4 -rotate-2 rounded-[3px] border border-sky-200 bg-info-soft px-2.25 py-0.5 text-[10.5px] font-semibold tracking-[0.02em] text-info shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              笔记
            </span>
            <div
              class="mb-1.75 mt-1.5 text-[13px] font-semibold tracking-[-0.01em] text-ink-900"
            >
              Vue 响应式原理
            </div>
            <div class="mb-1.5 h-1.25 rounded-[3px] bg-line"></div>
            <div class="h-1.25 w-[62%] rounded-[3px] bg-line"></div>
          </div>
          <div
            class="absolute bottom-7.5 left-29.5 w-52.5 rotate-3 rounded-xl bg-card px-4 py-3.5 shadow-[0_10px_30px_rgba(120,53,15,0.16)]"
          >
            <span
              class="absolute -top-2 left-4 -rotate-2 rounded-[3px] border border-red-200 bg-bad-soft px-2.25 py-0.5 text-[10.5px] font-semibold tracking-[0.02em] text-bad shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              Bug 日记
            </span>
            <div
              class="mb-1.75 mt-1.5 text-[13px] font-semibold tracking-[-0.01em] text-ink-900"
            >
              RLS 调了三小时
            </div>
            <div class="mb-1.5 h-1.25 rounded-[3px] bg-line"></div>
            <div class="h-1.25 w-[62%] rounded-[3px] bg-line"></div>
          </div>
          <div
            class="absolute bottom-0.5 left-58 w-52.5 -rotate-2 rounded-xl bg-card px-4 py-3.5 shadow-[0_10px_30px_rgba(120,53,15,0.16)]"
          >
            <span
              class="absolute -top-2 left-4 -rotate-2 rounded-[3px] border border-amber-200 bg-brand-soft px-2.25 py-0.5 text-[10.5px] font-semibold tracking-[0.02em] text-brand-deep shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              面试题
            </span>
            <div
              class="mb-1.75 mt-1.5 text-[13px] font-semibold tracking-[-0.01em] text-ink-900"
            >
              闭包与陷阱
            </div>
            <div class="mb-1.5 h-1.25 rounded-[3px] bg-line"></div>
            <div class="h-1.25 w-[62%] rounded-[3px] bg-line"></div>
          </div>
        </div>
        <span
          class="absolute left-23 top-0.5 font-serif text-xl text-brand-deep"
          >✦</span
        >
        <span class="absolute right-2.5 top-13.5 font-serif text-xl text-bad"
          >✦</span
        >
      </div>
    </section>
    <!-- 右侧注册 -->
    <section
      class="right-side flex items-center justify-center px-10 py-12 max-[900px]:px-5 max-[900px]:pb-12 max-[900px]:pt-8"
      aria-label="注册"
    >
      <n-form
        ref="formRef"
        :model="model"
        :rules="rules"
        :show-label="false"
        class="relative w-full max-w-101 rounded-[18px] border border-line bg-card px-9.5 pb-8.5 pt-10 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_18px_50px_rgba(28,25,23,0.08)] max-[420px]:rounded-2xl max-[420px]:px-6 max-[420px]:pb-7 max-[420px]:pt-8"
        @submit.prevent="handleRegister"
      >
        <h2
          class="mt-1.5 font-serif text-[32px] font-normal leading-[1.1] text-ink-900 max-[420px]:text-[28px]"
        >
          创建你的知识卡册
        </h2>
        <p class="mb-6.5 mt-1 text-[13.5px] text-ink-500">
          注册后开始整理你的知识卡册。
        </p>

        <label
          for="username"
          class="mb-1.75 block text-[13px] font-semibold text-ink-700"
          >用户名</label
        >
        <n-form-item path="username" :show-label="false" class="mb-4.5">
          <n-input
            v-model:value="model.username"
            placeholder="请输入用户名"
            :input-props="{
              id: 'username',
              inputmode: 'text',
              autocomplete: 'username',
            }"
          >
            <template #prefix>
              <svg
                class="text-ink-400"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </template>
          </n-input>
        </n-form-item>

        <label
          for="email"
          class="mb-1.75 block text-[13px] font-semibold text-ink-700"
          >邮箱</label
        >
        <n-form-item path="email" :show-label="false" class="mb-4.5">
          <n-input
            v-model:value="model.email"
            placeholder="请输入邮箱地址"
            :input-props="{
              id: 'email',
              type: 'email',
              inputmode: 'email',
              autocomplete: 'email',
            }"
          >
            <template #prefix>
              <svg
                class="text-ink-400"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m3 6 9 7 9-7" />
              </svg>
            </template>
          </n-input>
        </n-form-item>

        <label
          for="password"
          class="mb-1.75 block text-[13px] font-semibold text-ink-700"
          >密码</label
        >
        <n-form-item path="password" :show-label="false" class="mb-4.5">
          <n-input
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            placeholder="输入密码"
            :input-props="{ id: 'password', autocomplete: 'new-password' }"
          >
            <template #prefix>
              <svg
                class="text-ink-400"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </template>
          </n-input>
        </n-form-item>

        <button
          type="submit"
          :disabled="loading"
          class="mt-1.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand bg-brand text-[15px] font-semibold tracking-[0.01em] text-white shadow-[0_1px_3px_rgba(180,83,9,0.3)] transition-[background,transform,box-shadow] duration-150 hover:bg-brand-hover hover:shadow-[0_4px_14px_rgba(180,83,9,0.28)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-deep focus-visible:outline-offset-2"
        >
          {{ loading ? "注册中..." : "注册" }}
          <svg
            v-if="!loading"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>

        <p
          class="mt-5.5 border-t border-line-soft pt-5 text-center text-[13.5px] text-ink-500"
        >
          已有账号？
          <RouterLink
            to="/login"
            class="font-semibold text-brand underline decoration-brand/35 underline-offset-3"
            >去登录</RouterLink
          >
        </p>
        <p class="mt-4.5 text-center font-mono text-[11.5px] text-ink-400">
          devmind.app · username + email + password
        </p>
      </n-form>
    </section>
  </main>
</template>

<style scoped>
.auth-shell {
  background: linear-gradient(
    110deg,
    #fff4d6 0%,
    #f8e3b0 26%,
    #f9edcf 45%,
    #faf4e8 60%,
    #faf7f2 100%
  );
}

.brand-side,
.right-side {
  background: transparent;
}

.brand-side::after {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(120 53 15 / 3.2%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(120 53 15 / 3.2%) 1px, transparent 1px);
  background-size: 26px 26px;
  content: "";
  pointer-events: none;
  mask-image: linear-gradient(90deg, #000 0%, #000 55%, transparent 100%);
}
</style>
