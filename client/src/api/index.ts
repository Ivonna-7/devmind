import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
// 后端错误响应类型
interface ErrorResponse {
  error?: string;
}

interface Client extends AxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  // delete 默认是 void，适配后端的 204 空响应
  delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// 创建一个配置好的 Axios 实例
const client = axios.create({
  // VITE_API_BASE_URL：生产环境配置的后端地址；'/api'：本地开发时走 Vite 代理；
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
}) as Client; //这个实例使用前面定义的返回类型

// 请求拦截器
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // config.headers.set()，因为新版 Axios 的 headers 是 AxiosHeaders 实例，比直接赋值更符合当前 Axios 类型
    // 有 token 时添加请求头 Authorization: Bearer xxx，没有 token 时不处理，登录、注册等公开接口仍能正常请求；
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// 响应拦截器
client.interceptors.response.use(
  // 成功时返回 response.data，完成剥壳
  (response) => response.data,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    const message = error.response?.data?.error ?? error.message;
    return Promise.reject(new Error(message));
  },
);
export default client;
