import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/types/auth";
import { getUserInfo } from "@/api/authService";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const setUser = (value: User | null) => {
      user.value = value;
    };
    // 启动校验
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        user.value = await getUserInfo();
      } catch {
        localStorage.removeItem("token");
        user.value = null;
      }
    };

    return { user, setUser, loadUser };
  },
  {
    persist: true,//现在就生效,刷新后 user 自动从 localStorage 恢复,登录态不丢
  },
);
