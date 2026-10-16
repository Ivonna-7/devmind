import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/register",
    name: "register",
    meta: {
      title: "注册",
    },
    component: () => import("@/views/auth/RegisterView.vue"),
  },
  {
    path: "/login",
    name: "login",
    meta: {
      title: "登录",
    },
    component: () => import("@/views/auth/LoginView.vue"),
  },
  {
    path: "/home",
    name: "home",
    meta: {
      title: "首页",
    },
    component: () => import("@/views/HomeView.vue"),
  },
];
export default routers;
