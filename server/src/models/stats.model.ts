import pool from "../config/db.js";

// 标签分布：返回当前用户使用最多的前 N 个标签,雷达图 / 标签云
export const getTagStats = async (userId: number, limit: number) => {
  const result = await pool.query(
    `SELECT t.name, COUNT(ct.card_id) AS count
     FROM tags t
     JOIN card_tags ct ON t.id = ct.tag_id
     JOIN cards c ON ct.card_id = c.id
     WHERE c.user_id = $1
     GROUP BY t.name
     ORDER BY count DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

// 总览统计:卡片总数、类型分布、掌握度分布、被点赞/收藏数
export const getOverviewStats = async (userId: number) => {
  // 6 个查询互不依赖，并行发出（耗时从 6×RTT 降为 1×RTT）。
  // 全是只读 SELECT，任一失败 Promise.all 整体 reject，语义与串行版一致。
  const [
    totalResult,
    typeResult,
    masteryResult,
    visibilityResult,
    likesResult,
    favoritesResult,
  ] =
    await Promise.all([
      // 卡片总数
      pool.query(`SELECT COUNT(*) FROM cards WHERE user_id =$1 `, [userId]),
      //  按类型分布（note / question / bug / til）
      pool.query(
        `SELECT type,COUNT(*) AS count FROM cards WHERE user_id =$1 GROUP BY type`,
        [userId]
      ),
      //按掌握度分布（new / fuzzy / remember / master）
      pool.query(
        `SELECT mastery,COUNT(*) AS count FROM cards WHERE user_id =$1 GROUP BY mastery`,
        [userId]
      ),
      //按可见性分布（public / private）
      pool.query(
        `SELECT visibility,COUNT(*) AS count FROM cards WHERE user_id =$1 GROUP BY visibility`,
        [userId]
      ),
      // 被点赞总数（我的卡被别人点了多少赞）
      pool.query(
        `SELECT COUNT(*) AS count
    FROM likes l
    JOIN cards c ON l.card_id = c.id
    WHERE c.user_id =$1`,
        [userId]
      ),
      // 被收藏总数（我的卡被别人收藏了多少）
      pool.query(
        `SELECT COUNT(*) AS count
    FROM favorites f
    JOIN cards c ON f.card_id = c.id
    WHERE c.user_id =$1`,
        [userId]
      ),
    ]);

  // ⚠️ 注意：pg 驱动把 COUNT 返回成字符串（因为 PostgreSQL COUNT 是 BIGINT，
  // JS Number 精度不够）。需要 parseInt 转数字。
  const total_cards = parseInt(totalResult.rows[0].count);
  // SQL 返回：[{ type: 'note', count: '15' }, { type: 'question', count: '12' }]
  // 前端要：{ note: 15, question: 12 }
  const by_type = typeResult.rows.reduce((acc: any, cur: any) => {
    acc[cur.type] = parseInt(cur.count);
    return acc;
  }, {});
  const mastery_distribution = masteryResult.rows.reduce(
    (acc: any, cur: any) => {
      acc[cur.mastery] = parseInt(cur.count);
      return acc;
  }, {});
  const by_visibility = visibilityResult.rows.reduce((acc: any, cur: any) => {
    acc[cur.visibility] = parseInt(cur.count);
    return acc;
  }, {});
  const total_likes_received = parseInt(likesResult.rows[0].count);
  const total_favorites_received = parseInt(favoritesResult.rows[0].count);
  return {
    total_cards,
    by_type,
    mastery_distribution,
    by_visibility,
    total_likes_received,
    total_favorites_received,
  };
};

// 热力图数据:最近 365 天每天创建的卡片数,GitHub 风格的贡献热力图
/**
 * 
   返回格式示例：
   [
     { date: '2025-05-01', count: 3 },
     { date: '2025-05-02', count: 1 },
      ...
    ]
   注意：只返回"有创建卡的天"，没卡的天不出现在结果里。
   前端画热力图时，自己补上没卡的天（count=0）。
 */

export const getHeatmapStats = async (userId: number) => {
  //  DATE(created_at)：把 TIMESTAMP 转成 DATE（去掉时分秒），才能按"天"分组
  // - INTERVAL '365 days'：PostgreSQL 日期间隔语法
  const result = await pool.query(
    `SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS count
    FROM cards
    WHERE user_id = $1
       AND created_at >=NOW() -INTERVAL '365 days'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC`,
    [userId]
  );
  // count 是字符串，转成数字；date 已经是 Date 对象
  return result.rows.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    count: parseInt(row.count),
  }));
};
