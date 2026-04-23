import { Router } from "express";
import { register,login,getUserInfo,updateUserInfo } from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middleware/auth.js";
 
const router = Router();
// 定义一条 POST 路由:'/register' — 路径,register — 这个路径被访问时执行的函数
router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleWare,getUserInfo)
router.put("/me", authMiddleWare,updateUserInfo)
export default router;