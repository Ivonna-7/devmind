import pool from "../config/db.js";

// 创建卡片(卡片+标签)
export const createCard = async (
  userId: number,
  title: string,
  content: string,
  type: string,
  answer: string | null,
  visibility: string,
  difficulty: string | null,
  tags: string[]
) => {
  const cardResult = await pool.query(
    "INSERT INTO cards (user_id, title, content, type, answer, visibility, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [userId, title, content, type, answer, visibility || "private", difficulty]
  );
  const card = cardResult.rows[0];
  // 判断是否标签已存在
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tagResult = await pool.query(
        `INSERT INTO tags(name) VALUES($1)
         ON CONFLICT (name) DO UPDATE SET name = $1
         RETURNING id`,
        [tagName]
      );
      const tagId = tagResult.rows[0].id;
      // 建立关联
      await pool.query("INSERT INTO card_tags(card_id,tag_id) VALUES($1,$2)", [
        card.id,
        tagId,
      ]);
    }
  }
  return await getCardById(card.id);
};

// 按 id 查卡片（含 tags，联表查询）
export const getCardById = async (id: number) => {
  const cardResult = await pool.query(
    `SELECT c.*, COALESCE(json_agg(t.name) FILTER(WHERE t.name IS NOT NULL), '[]') AS tags
     FROM cards c
     LEFT JOIN card_tags ct ON c.id = ct.card_id
     LEFT JOIN tags t ON ct.tag_id = t.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );
  return cardResult.rows[0];
};
// 获取卡片列表（type:卡片类型，tag:标签名，visibility:可见性，userId:查指定用户的卡片）
/**
 * type:卡片类型，tag:标签名，visibility:可见性，userId:查指定用户的卡片
 * 分页：page:页码，limit:每页数量
 * 排序：sort:默认/最新||最多点赞
 * 访问控制：未登陆：默认只查公开卡片，已登陆查别人的卡片：只能看别人的公开卡片，已登陆查自己：全部可见（含私有）：
 */
export const getCardList = async (
  page: number,
  limit: number,
  keyword?: string,
  type?: string,
  tag?: string,
  visibility?: string,
  userId?: number,
  currentUserId?: number,
  sort?: string
) => {
  let conditions = [];
  let params = [];
  let paramsIndex = 1;
  // 访问控制：未登陆只能看公开卡片
  if (!currentUserId) {
    conditions.push(`c.visibility = 'public'`);
  } else if (userId && userId !== currentUserId) {
    // 已登陆查别人的卡片：只能看别人的公开卡片
    // $${paramIndex} 是模板字符串里嵌入变量。paramIndex 是一个计数器，追踪当前占位符编号
    // 为什么要用计数器？因为不知道前端会传几个参数，占位符编号必须动态递增。
    conditions.push(`c.visibility = 'public' AND c.user_id = $${paramsIndex}`);
    params.push(userId);
    paramsIndex++;
  } else if (userId && userId === currentUserId) {
    // 已登陆查自己：全部可见（含私有）：
    conditions.push(`c.user_id = $${paramsIndex}`);
    params.push(userId);
    paramsIndex++;
    if (visibility) {
      conditions.push(`c.visibility = $${paramsIndex}`);
      params.push(visibility);
      paramsIndex++;
    }
  }
  // 按类型筛选
  if (type) {
    conditions.push(`c.type=$${paramsIndex}`);
    params.push(type);
    paramsIndex++;
  }
  // 按关键词搜索
  if (keyword) {
    conditions.push(
      `(c.title ILIKE $${paramsIndex} OR c.content ILIKE $${paramsIndex})`
    );
    params.push(`%${keyword}%`); //ILIKE — 不区分大小写（PostgreSQL 特有的）
    paramsIndex++;
  }
  // 按标签筛选
  // 但标签不在 cards 表上，在 card_tags + tags 表上。要先通过 JOIN 把有这个标签的卡片关联出来，才能筛
  let tagJoin = "";
  if (tag) {
    tagJoin = `JOIN card_tags ct2 ON c.id=ct2.card_id JOIN tags t2 ON ct2.tag_id=t2.id AND t2.name=$${paramsIndex}`;
    params.push(tag);
    paramsIndex++;
  }
  const where =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  // 如果前端传了 sort=most_liked → 按创建时间降序（后面做点赞功能再改成按点赞数）
  // 否则（默认）→ 先按置顶排（置顶的在前），再按创建时间降序（最新的在前）
  const orderBy =
    sort === "most_liked"
      ? "ORDER BY c.created_at DESC"
      : "ORDER BY c.is_pinned DESC, c.created_at DESC";
  const offset = (page - 1) * limit;
  // 查总数  DISTINCT — 去重
  const countResult = await pool.query(
    `SELECT COUNT(DISTINCT c.id) FROM cards c ${tagJoin} ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);
  // 查列表   json_agg把多个标签名聚合成 JSON 数组
  // COALESCE(..., '[]') — 如果上面整个结果是 NULL（卡片完全没标签），就返回空数组 '[]' 而不是 null
  const listResult = await pool.query(
    `SELECT c.*,COALESCE (json_agg(t.name) FILTER(WHERE t.name IS NOT NULL),'[]')AS tags
    FROM cards c
    LEFT JOIN card_tags ct ON c.id=ct.card_id
    LEFT JOIN tags t ON ct.tag_id=t.id
    ${tagJoin}
    ${where}
    GROUP BY c.id
    ${orderBy}
    LIMIT $${paramsIndex} OFFSET $${paramsIndex + 1}`,
    [...params, limit, offset]
  );
  return {
    cards: listResult.rows,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
};
// 删除卡片
export const deleteCard = async (id: number) => {
  await pool.query("DELETE FROM cards WHERE id=$1", [id]);
};

// 卡片置顶
export const togglePin = async (id: number) => {
  const result = await pool.query(
    "UPDATE cards SET is_pinned = NOT is_pinned WHERE id=$1 RETURNING is_pinned",
    [id]
  );
  return result.rows[0];
};
// 卡片设置是否公开可见
export const toggleVisibility = async (id: number) => {
  const result = await pool.query(
    `UPDATE cards
     SET visibility=CASE
      WHEN visibility='private' THEN'public'
      ELSE 'private' 
      END 
      WHERE id=$1 
      RETURNING visibility`,
    [id]
  );
  return result.rows[0];
};
// 更新卡片
export const updateCard = async (
  id: number,
  title?: string,
  content?: string,
  type?: string,
  answer?: string,
  visibility?: string,
  difficulty?: string,
  tags?: string[]
) => {
  // COALESCE 是 SQL 函数：COALESCE(A, B) 意思是"如果 A 不是 NULL 就用 A，否则用 B"。
  await pool.query(
    `UPDATE cards SET 
      title=COALESCE($1, title),
      content=COALESCE($2, content),
      type=COALESCE($3, type),
      answer=COALESCE($4, answer),
      visibility=COALESCE($5, visibility),
      difficulty=COALESCE($6, difficulty),
      updated_at=NOW()
    WHERE id=$7
    RETURNING *`,
    [title, content, type, answer, visibility, difficulty, id]
  );
  // 用户没传 tags → tags 是 undefined，保留原有标签 → 不处理
  // 用户传了空数组 tags: [] → 用户想清空所有标签 → 要删掉所有关联
  if (tags !== undefined) {
    // 删掉这张卡原有的所有card_tags关联
    await pool.query("DELETE FROM card_tags WHERE card_id=$1", [id]);
    // 按新的tags重新建立关联 （复用createCard里的逻辑）
    if (tags.length > 0) {
      for (const tagName of tags) {
        const tagResult = await pool.query(
          `INSERT INTO tags(name) VALUES($1) ON CONFLICT(name) DO UPDATE SET name=$1 RETURNING id`,
          [tagName]
        );
        const tagId = tagResult.rows[0].id;
        await pool.query(
          `INSERT INTO card_tags(card_id,tag_id) VALUES($1,$2)`,
          [id, tagId]
        );
      }
    }
  }
  return await getCardById(id);
};
// 随机复习卡片
/**
  1. 最需要复习的（mastery = 'new'）排最前
  2. 其次 fuzzy → remember → master
  3. 同掌握度里，最久没复习的优先（last_reviewed_at ASC）
  4. 从没复习过的（NULL）排最前
 */
// GROUP BY c.id	多个 tag JOIN 出多行，按卡片 id 聚合回一行
// last_reviewed_at ASC NULLS FIRST	第二排序条件：时间升序（最久没复习的在前），NULL（从没复习过）排最前
// 这里的case当排序键
export const randomCard = async (userId: number, count: number) => {
  const result = await pool.query(
    `SELECT c.*,
    COALESCE (json_agg(t.name) FILTER (WHERE t.name IS NOT NULL),'[]')AS tags
    FROM cards c
    LEFT JOIN card_tags ct ON c.id=ct.card_id
    LEFT JOIN tags t ON ct.tag_id=t.id
    WHERE c.user_id=$1
    Group BY c.id
    ORDER BY 
    CASE c.mastery
    WHEN 'new' THEN 1
    WHEN 'fuzzy' THEN 2
    WHEN 'remember' THEN 3
    WHEN 'master' THEN 4
    END ASC,
    c.last_reviewed_at ASC NULLS FIRST
    LIMIT $2`,
    [userId, count]
  );
  return result.rows;
};
// 提交复习结果
export const reviewCard = async (
  userId: number,
  cardId: number,
  mastery: string
) => {
  const updated = await pool.query(
    `UPDATE cards SET
    mastery=$1,last_reviewed_at=NOW() WHERE id=$2 RETURNING mastery,last_reviewed_at`,
    [mastery, cardId]
  );
  await pool.query(
    `INSERT INTO review_logs(user_id,card_id,mastery) VALUES($1,$2,$3)`,
    [userId, cardId, mastery]
  );
  return updated.rows[0];
};
