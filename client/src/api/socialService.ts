import client from "./index";

/** 点赞 */
export const likeCard = (id: number) => client.post(`cards/${id}/like`);

/** 取消点赞 */
export const unlikeCard = (id: number) => client.delete(`cards/${id}/like`);

/** 收藏 */
export const favoriteCard = (id: number) => client.post(`cards/${id}/favorite`);

/** 取消收藏 */
export const unfavoriteCard = (id: number) =>
  client.delete(`cards/${id}/favorite`);
