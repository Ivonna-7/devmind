import pool from "../config/db.js";

// 点赞
export const likeCard = async (userId: number, cardId: number) => {
  await pool.query(`INSERT INTO likes(user_id,card_id) VALUES($1,$2)`, [
    userId,
    cardId,
  ]);
};
// 取消点赞
export const unLikeCard = async (userId: number, cardId: number) => {
  await pool.query(`DELETE FROM likes WHERE user_id=$1 AND card_id=$2`, [
    userId,
    cardId,
  ]);
};
// 收藏
export const favoriteCard = async (userId: number, cardId: number) => {
  await pool.query(`INSERT INTO favorites(user_id,card_id) VALUES($1,$2)`, [
    userId,
    cardId,
  ]);
};
// 取消收藏
export const unFavoriteCard = async (userId: number, cardId: number) => {
  await pool.query(`DELETE FROM favorites WHERE user_id=$1 AND card_id=$2`, [
    userId,
    cardId,
  ]);
};
// 获取收藏的所有卡片详情
// 为什么 GROUP BY 两个字段？因为 SELECT 里非聚合字段必须出现在 GROUP BY 里。c.* 展开后所有字段都由 c.id 唯一决定（已经 GROUP BY 了），但 f.created_at 来自另一张表，必须单独加进去。
export const getUserFavoriteCards = async (
  userId: number,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;
  // 查总数
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM favorites WHERE user_id=$1`,
    [userId]
  );
  const total = parseInt(countResult.rows[0].count);
  // 查列表
//   favorites 表的 created_at 是收藏时间（和卡片的 created_at 不一样）
  const listResult = await pool.query(
    `SELECT c.*,
    COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL),'[]')AS tags,
    f.created_at AS favorited_at
    FROM favorites f
    JOIN cards c ON f.card_id = c.id
    LEFT JOIN card_tags ct ON c.id = ct.card_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE f.user_id = $1
    GROUP BY c.id,f.created_at
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return {
    cards:listResult.rows,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
};
