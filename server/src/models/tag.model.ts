import pool from "../config/db.js";

// 获取所有标签及使用次数
// 访问控制（认证可选）：
//   - 已登录：只统计"当前用户"的卡片里用到的标签,包含私有+公开，所有自己的卡
//   - 未登录：只统计"公开卡片"里用到的标签
export const getAllTags = async (currentUserId?: number) => {
  // 根据登录状态，动态决定 WHERE 条件
  let whereClause: string;
  let params: any[];
  if (currentUserId) {
    whereClause = `WHERE c.user_id = $1`;
    params = [currentUserId];
  } else {
    whereClause = `WHERE c.visibility = 'public'`;
    params = [];
  }
  const result = await pool.query(
    `SELECT t.name, COUNT(DISTINCT ct.card_id) AS count
      FROM tags t
      JOIN card_tags ct ON t.id = ct.tag_id
      JOIN cards c ON ct.card_id = c.id
      ${whereClause}
      GROUP BY t.name
      ORDER BY count DESC`,
    params
  );
  return result.rows.map((row) => ({
    name: row.name,
    count: parseInt(row.count),
  }));
};

//获取某标签下的所有公开卡片（分页）,只返回公开卡（私有卡不在标签搜索范围内）
export const getCardsByTag = async (
  tagName: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;
  //用 DISTINCT c.id 是因为一张卡可能有多个标签，JOIN 后可能出现多行, 只有 DISTINCT 才能准确数"几张卡"
  const countResult = await pool.query(
    `SELECT COUNT(DISTINCT c.id)
    FROM cards c
    JOIN card_tags ct ON c.id =ct.card_id
    JOIN tags t ON ct.tag_id = t.id
    WHERE t.name = $1 AND c.visibility = 'public'`,
    [tagName]
  )
   // ⚠️ 核心难点：既要"按 tagName 筛选卡"，又要"返回每张卡的全部标签"
    //
    // 如果只用一组 JOIN：
    //   FROM cards c JOIN card_tags ct JOIN tags t WHERE t.name = 'JavaScript'
    //   → json_agg(t.name) 只会聚合 'JavaScript' 一个标签，其他标签都丢了 ❌
    //
    // 解决：用两组 JOIN 别名，一组筛选，一组聚合：
    //   - ct2/t2：筛选用（卡片必须有 tagName 这个标签才进入结果集）
    //   - ct/t：聚合用（拿出这张卡的所有标签）
    //
    // 这是 SQL 里"筛选条件" vs "展示数据"分离的经典技巧
  const listResult =await pool.query(
    `SELECT c.*,
    COALESCE (json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags,
    u.id AS author_id,
    u.username AS author_username,
    u.nickname AS author_nickname,
    u.avatar AS author_avatar,
    (SELECT COUNT(*) FROM likes WHERE card_id = c.id)::int AS likes_count,
    (SELECT COUNT(*) FROM favorites WHERE card_id = c.id)::int AS favorites_count
    FROM cards c
    LEFT JOIN users u ON c.user_id = u.id
    JOIN card_tags ct2 ON c.id=ct2.card_id
    JOIN tags t2 ON ct2.tag_id=t2.id AND t2.name=$1
    LEFT JOIN card_tags ct ON c.id=ct.card_id
    LEFT JOIN tags t ON ct.tag_id =t.id
    WHERE c.visibility = 'public'
    GROUP BY c.id, u.id
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3`,
    [tagName, limit, offset]
  )
  const total = parseInt(countResult.rows[0].count);
  const cards = listResult.rows.map((row: any) => {
    const { author_id, author_username, author_nickname, author_avatar, ...card } = row;
    return {
      ...card,
      author: { id: author_id, username: author_username, nickname: author_nickname, avatar: author_avatar },
    };
  });
  return{
    cards,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  }

};
