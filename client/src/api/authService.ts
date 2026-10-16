import client from "./index";
import { User } from "../types/auth";

/**注册*/
const register = (params: {
  username: string;
  email: string;
  password: string;
}) => client.post<{ token: string; user: User }>("auth/register", params);
/**登录*/
const login = (params: { email: string; password: string }) =>
  client.post<{ token: string; user: User }>("auth/login", params);
/**获取用户信息*/
const getUserInfo = () => client.get<User>("auth/me");

export { register, login, getUserInfo };
