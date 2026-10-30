import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// 校验目标：请求体 / 查询参数 / 路径参数
type Target = "body" | "query" | "params";

/**
 * 通用校验中间件（工厂函数：传入 schema，返回一个中间件）
 * - 用 schema 检查 req 的指定部分
 * - 不合法 → 400 + 具体哪个字段错
 * - 合法 → 放行；body 会被替换成「清洗后的数据」
 * 用工厂函数：因为每个接口的 schema 不同，但校验逻辑一样。validate(某schema) 生成一个专属该接口的中间件，挂到路由上。
 */
/**
 *
 * type Target = "body" | "query" | "params";
 * "body" → 检查 req.body（POST/PUT 的请求体，如注册表单）
 * "query" → 检查 req.query（URL 问号后面的，如 ?page=1&limit=20）
 * "params" → 检查 req.params（路径里的，如 /cards/:id 的 id）
 * 默认是 "body"，所以 validate(registerSchema) 等于 validate(registerSchema, "body")
 */
export const validate =
  (schema: ZodType, target: Target = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    // safeParse 而不是 parse：safeParse 返回 { success, data }，不抛异常，我们自己决定返回 400。parse 会直接 throw，不好控制。
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // 用项目统一的 { error } 格式（前端拦截器读的是 error 字段）
      // 取第一条校验失败信息作为提示；带上字段名方便定位
      const first = result.error.issues[0];
      const field = first?.path.join(".");//first?.path 是出错字段的路径数组
      const error = field
        ? `${field}: ${first?.message}`
        : (first?.message ?? "参数校验失败");
      return res.status(400).json({ error });
    }

    // 只有 body 能安全覆盖；Express 5 里 req.query / req.params 是只读 getter，不能重新赋值
    if (target === "body") {
      req.body = result.data;
    }
    next();
  };
