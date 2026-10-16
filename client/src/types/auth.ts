/** 用户信息 */
export class User {
  /** 用户 ID */
  id!: number; //项目开启了严格模式,告诉 TypeScript，这个字段虽然没有在声明处初始化，但构造过程会给它赋值
  /** 用户名 */
  username!: string;
  /** 邮箱 */
  email!: string;
  /** 昵称 */
  nickname: string | null = null;
  /** 头像地址 */
  avatar: string | null = null;
  /** 个人简介 */
  bio: string | null = null;
  /** 创建时间 */
  created_at!: string;
  /** 更新时间 */
  updated_at!: string;

  constructor(raw: Partial<User> = {}) {
    Object.assign(this, raw);
  }
}
