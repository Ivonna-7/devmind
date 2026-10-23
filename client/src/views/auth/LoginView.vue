<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";
import { useAuthStore } from "@/stores/auth";
import { login } from "@/api/authService";
import { useRouter } from "vue-router";
import { ArrowForwardOutline, LockClosedOutline, MailOutline } from "@vicons/ionicons5";

const message = useMessage();
const authStore = useAuthStore();
const router = useRouter();

const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const model = ref({
  email: "",
  password: "",
});

const rules: FormRules = {
  email: [
    { required: true, message: "请输入邮箱地址", trigger: ["blur", "input"] },
    { type: "email", message: "邮箱格式不正确", trigger: ["blur"] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: ["blur", "input"] },
  ],
};

// 登录提交
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return; // 校验没过，终止提交

    loading.value = true;
    try {
      const { token, user } = await login({
        email: model.value.email,
        password: model.value.password,
      });
      localStorage.setItem("token", token);
      authStore.setUser(user);
      message.success("登录成功");
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
  <main class="auth-shell flex min-h-screen items-center justify-center px-5 py-10 max-[420px]:px-4 max-[420px]:py-7">
    <div class="flex w-full max-w-101 flex-col items-center">
      <div class="mb-6 inline-flex items-center gap-2.75" aria-label="DevMind">
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
        <span class="font-serif text-[29px] leading-none text-ink-900">DevMind</span>
      </div>
      <n-form
        ref="formRef"
        :model="model"
        :rules="rules"
        :show-label="false"
        class="relative w-full max-w-101 rounded-[18px] border border-line bg-card px-9.5 pb-8.5 pt-10 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_18px_50px_rgba(28,25,23,0.08)] max-[420px]:rounded-2xl max-[420px]:px-6 max-[420px]:pb-7 max-[420px]:pt-8"
        @submit.prevent="handleSubmit"
      >
        <h2
          class="mt-1.5 font-serif text-[32px] font-normal leading-[1.1] text-ink-900 max-[420px]:text-[28px]"
        >
          欢迎回来
        </h2>
        <p class="mb-6.5 mt-1 text-[13.5px] text-ink-500">
          登录以继续整理你的知识卡册。
        </p>

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
              <n-icon :component="MailOutline" :size="17" class="text-ink-400" />
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
            :input-props="{ id: 'password', autocomplete: 'current-password' }"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" :size="17" class="text-ink-400" />
            </template>
          </n-input>
        </n-form-item>

        <n-button
          attr-type="submit"
          type="primary"
          :loading="loading"
          :disabled="loading"
          block
          size="large"
          class="mt-1.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand bg-brand text-[15px] font-semibold tracking-[0.01em] text-white shadow-[0_1px_3px_rgba(180,83,9,0.3)] transition-[background,transform,box-shadow] duration-150 hover:bg-brand-hover hover:shadow-[0_4px_14px_rgba(180,83,9,0.28)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-deep focus-visible:outline-offset-2"
        >
          <template #icon>
            <n-icon v-if="!loading" :component="ArrowForwardOutline" :size="17" />
          </template>
          {{ loading ? "登录中..." : "登录" }}
        </n-button>

        <p
          class="mt-5.5 border-t border-line-soft pt-5 text-center text-[13.5px] text-ink-500"
        >
          还没有账号？
          <RouterLink
            to="/register"
            class="font-semibold text-brand underline decoration-brand/35 underline-offset-3"
            >注册一册属于你的</RouterLink
          >
        </p>
        <p class="mt-4.5 text-center font-mono text-[11.5px] text-ink-400">
          devmind.app · email + password
        </p>
      </n-form>
    </div>
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
