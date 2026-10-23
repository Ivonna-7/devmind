import type { RouteRecordRaw } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "",
        redirect: "/home",
      },
      {
        path: "home",
        name: "home",
        meta: { title: "首页" },
        component: () => import("@/views/home/HomeView.vue"),
      },
      {
        path: "workspace",
        name: "workspace",
        meta: { title: "工作台" },
        component: () => import("@/views/workspace/WorkspaceView.vue"),
      },
      {
        path: "dashboard",
        name: "dashboard",
        meta: { title: "仪表盘" },
        component: () => import("@/views/dashboard/DashboardView.vue"),
      },
      {
        path: "profile",
        name: "profile",
        meta: { title: "个人主页" },
        component: () => import("@/views/profile/ProfileView.vue"),
      },
      {
        path: "card/:id",
        name: "detail",
        meta: { title: "详情" },
        component: () => import("@/views/detail/DetailView.vue"),
      },
    ],
  },
  {
    path: "/register",
    name: "register",
    meta: { title: "注册" },
    component: () => import("@/views/auth/RegisterView.vue"),
  },
  {
    path: "/login",
    name: "login",
    meta: { title: "登录" },
    component: () => import("@/views/auth/LoginView.vue"),
  },
];
export default routers;
