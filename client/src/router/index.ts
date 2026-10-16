import { createRouter, createWebHistory } from "vue-router";
import routes from "./routers";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }; //浏览器前进、后退：恢复之前的滚动位置。
  },
});

// 整个 app 生命周期内只做一次启动校验
let bootstrapped = false;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem("token");

  if (!token) {
    // 没 token = 未登录。清掉 persist 可能残留的缓存 user，保证两者一致
    if (authStore.user) authStore.setUser(null);
  } else if (!bootstrapped) {
    // 有 token 且本次启动还没校验：获取最新用户信息
    await authStore.loadUser();
  }
  bootstrapped = true;

  // 需要登录却没登录 → 踢回登录页
  if (to.meta.requiresAuth && !authStore.user) {
    return "/login";
  }

  // 已登录还想去登录/注册 → 回首页
  if (authStore.user && (to.name === "login" || to.name === "register")) {
    return "/home";
  }
});

router.afterEach((to) => {
  document.title = to.meta.title as string;
});
export default router;
