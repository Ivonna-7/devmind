/** 公开用户资料 */
export class ProfileUser {
  /** 用户 ID */
  id!: number;
  /** 用户名 */
  username!: string;
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

  constructor(raw: Partial<ProfileUser> = {}) {
    Object.assign(this, raw);
  }
}
