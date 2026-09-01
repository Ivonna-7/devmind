# 免费 AI 编程环境搭建指南

> 针对全栈开发的白嫖党配置手册
> 编辑器：VS Code + Roo Code
> 策略：多家免费 API key 轮换使用，永不断档

---

## 目录

- [一、方案概览](#一方案概览)
- [二、安装 VS Code](#二安装-vs-code)
- [三、安装 Roo Code 插件](#三安装-roo-code-插件)
- [四、免费 API Key 获取清单](#四免费-api-key-获取清单)
- [五、Roo Code 配置 API Profile](#五roo-code-配置-api-profile)
- [六、日常使用建议](#六日常使用建议)
- [七、常见问题](#七常见问题)

---

## 一、方案概览

### 核心组合

```
VS Code（编辑器，免费）
  + Roo Code（AI agent 插件，免费开源）
  + 通义灵码（Tab 补全插件，免费无限）
  + 多家免费 API key（轮换使用）
```

### 为什么这么选

| 组件 | 作用 | 成本 |
|------|------|------|
| VS Code | 编辑器本体 | 免费 |
| Roo Code | AI agent，多文件修改、跑命令 | 免费（接自己的 key） |
| 通义灵码 | Tab 补全 + 轻量问答 | 免费无限 |
| 免费 API | 给 Roo Code 提供 AI 能力 | 免费/极便宜 |

### 核心优势

- 编辑器完全免费
- 支持多家 API key 预设，一键切换
- 一家额度用完切下一家，基本永远不断
- 等同 Cursor Composer 的体验，0 订阅费

---

## 二、安装 VS Code

### 下载地址

[https://code.visualstudio.com/](https://code.visualstudio.com/)

### 安装步骤

1. 下载对应系统的版本（Windows/Mac/Linux）
2. 按提示安装，推荐勾选：
   - 将「通过 Code 打开」添加到 Windows 资源管理器文件/目录上下文菜单
   - 添加到 PATH（默认勾选）
3. 完成后打开 VS Code

### 推荐基础插件（可选）

- **Chinese (Simplified) Language Pack** - 中文界面
- **Prettier** - 代码格式化
- **GitLens** - Git 增强
- **Error Lens** - 错误高亮

---

## 三、安装 Roo Code 插件

### 安装步骤

1. VS Code 左侧边栏点击「扩展」图标（Ctrl+Shift+X）
2. 搜索框输入 `Roo Code`
3. 找到 **Roo Code** 作者为 `RooVeterinaryInc` 的那个
4. 点「Install」

### 同时推荐安装

- **通义灵码** (`TONGYI Lingma`)：搜索安装，用阿里云账号登录，免费
- **Cline**（可选）：Roo Code 的原版，想对比可以装

### 启动 Roo Code

- VS Code 左侧边栏会多出一个 Roo Code 图标（类似袋鼠 logo）
- 点击打开 Roo Code 面板

---

## 四、免费 API Key 获取清单

### 优先级推荐

**国内用户（无梯子）**：硅基流动 → 智谱 → DeepSeek 官方
**有梯子**：OpenRouter + Google AI Studio（黄金组合）

---

### 4.1 Google AI Studio（Gemini，强推）

- **地址**：[https://aistudio.google.com](https://aistudio.google.com)
- **注册**：Google 账号登录即可
- **获取 Key**：左侧菜单「Get API key」→ 「Create API key」→ 复制
- **免费额度**：
  - Gemini 2.0 Flash：每天 1500 次请求
  - Gemini 2.5 Pro：每天 50-100 次请求
- **要求**：需要能连 Google（国内需梯子）
- **优势**：模型质量高，额度慷慨

---

### 4.2 OpenRouter（白嫖神器）

- **地址**：[https://openrouter.ai](https://openrouter.ai)
- **注册**：支持 GitHub/Google 账号
- **获取 Key**：右上角头像 → Keys → Create Key
- **免费模型**（不充值就能用）：
  - DeepSeek R1 Free
  - DeepSeek V3 Free
  - Gemini 2.0 Flash Free
  - Llama 3.3 70B Free
  - 等几十个
- **优势**：一个 key 接入几十个模型，切换方便
- **要求**：需要梯子（海外服务）

---

### 4.3 硅基流动（国内首选）

- **地址**：[https://siliconflow.cn](https://siliconflow.cn)
- **注册**：手机号注册
- **获取 Key**：登录后「API 密钥」→「新建 API 密钥」
- **赠送额度**：新用户送 14 元（大约能用几个月）
- **可用模型**：
  - DeepSeek V3 / R1
  - Qwen 系列
  - GLM 系列
  - 部分模型完全免费
- **优势**：国内直连，速度快，不用梯子

---

### 4.4 DeepSeek 官方

- **地址**：[https://platform.deepseek.com](https://platform.deepseek.com)
- **注册**：手机号 / 邮箱
- **获取 Key**：「API keys」→「创建 API key」
- **赠送额度**：新用户送少量免费额度
- **价格**：极便宜（V3 大约 ¥1/百万 token）
- **优势**：官方直连，稳定，中文体验最好

---

### 4.5 智谱 BigModel（备胎）

- **地址**：[https://bigmodel.cn](https://bigmodel.cn)
- **注册**：手机号
- **获取 Key**：「API 密钥管理」→「添加新的 API Key」
- **免费模型**：**GLM-4-Flash** 完全免费
- **优势**：有完全免费的模型，国内直连

---

### 4.6 火山引擎（进阶）

- **地址**：[https://www.volcengine.com](https://www.volcengine.com)
- **说明**：字节云，有 DeepSeek 免费活动
- **注意**：注册较复杂，企业用户更适合

---

### Key 安全准则（重要！）

1. **不要**发给任何人（包括 AI 助手）
2. **不要**截图发微信群、论坛、GitHub
3. **不要**提交到 Git 仓库
4. 放到 `.env` 文件，`.env` 加入 `.gitignore`
5. 一旦泄露，立即去平台删掉重新生成

---

## 五、Roo Code 配置 API Profile

Roo Code 的核心优势：**API Configuration Profiles**，预设多套 key 一键切换。

### 5.1 打开配置

1. 点击 VS Code 左侧 Roo Code 图标
2. 右上角齿轮图标 → Settings
3. 找到「API Provider」或「Configuration Profiles」

### 5.2 添加第一个 Profile（以 Gemini 为例）

1. 点「+ New Profile」
2. 填写：
   - **Profile Name**：`Gemini-Free`
   - **API Provider**：选择 `Google Gemini`
   - **API Key**：粘贴 Google AI Studio 拿到的 key
   - **Model**：选 `gemini-2.5-pro` 或 `gemini-2.0-flash`
3. 保存

### 5.3 添加第二个 Profile（以 OpenRouter 为例）

1. 继续新建 Profile
2. 填写：
   - **Profile Name**：`OpenRouter-DeepSeekR1`
   - **API Provider**：`OpenRouter`
   - **API Key**：OpenRouter 的 key
   - **Model**：`deepseek/deepseek-r1:free`
3. 保存

### 5.4 添加国内 Profile（硅基流动）

1. 新建 Profile
2. 填写：
   - **Profile Name**：`SiliconFlow-DeepSeek`
   - **API Provider**：选 `OpenAI Compatible`
   - **Base URL**：`https://api.siliconflow.cn/v1`
   - **API Key**：硅基流动的 key
   - **Model ID**：`deepseek-ai/DeepSeek-V3`
3. 保存

### 5.5 推荐 Profile 配置套装

预设 4-5 个，日常切换：

| Profile 名 | Provider | Model | 用途 |
|-----------|----------|-------|------|
| Gemini-Pro | Google Gemini | gemini-2.5-pro | 复杂任务主力 |
| Gemini-Flash | Google Gemini | gemini-2.0-flash | 简单任务，额度多 |
| OpenRouter-R1 | OpenRouter | deepseek/deepseek-r1:free | Gemini 备胎 |
| SiliconFlow | OpenAI Compatible | deepseek-ai/DeepSeek-V3 | 国内直连 |
| Zhipu-Flash | OpenAI Compatible | glm-4-flash | 最后兜底，永久免费 |

### 5.6 切换 Profile

- Roo Code 面板顶部有 Profile 下拉菜单
- 点击选择即可切换
- 也可以为不同 Custom Mode 绑定不同 Profile

---

## 六、日常使用建议

### 6.1 模型使用策略

```
日常简单任务（加 CRUD、写组件）
  → Gemini 2.0 Flash / DeepSeek V3（额度大，够用）

复杂需求（架构设计、疑难 bug）
  → Gemini 2.5 Pro / DeepSeek R1（思考能力强）

补全（敲代码时的 Tab 提示）
  → 通义灵码（免费无限）

实在搞不定的
  → DeepSeek 网页版人肉粘贴（chat.deepseek.com）
```

### 6.2 额度管理

- 每天优先用 Gemini Flash（1500 次/天，几乎用不完）
- 复杂任务才上 Gemini Pro（50-100 次/天）
- 月底 Gemini 紧张 → 切 OpenRouter / 硅基流动
- 所有都用完 → GLM-4-Flash 兜底（完全免费）

### 6.3 Git 习惯

AI 写代码快，但可能改崩。养成习惯：

```bash
# 每个能跑的版本立刻提交
git add .
git commit -m "feat: 登录页 AI 版本 1"

# AI 改崩了一键回滚
git reset --hard HEAD
```

### 6.4 .env 安全（重要！）

写后端项目时：

1. 项目根目录创建 `.env` 文件，存所有密钥
2. 在 `.gitignore` 加一行：
   ```
   .env
   .env.local
   *.env
   ```
3. 创建 `.env.example` 当模板（不放真实 key，只写变量名）
4. 提交前检查 `git status`，确认 `.env` 没被 track

### 6.5 Custom Mode 妙用（Roo Code 特色）

为不同任务设不同模式：

- **Architect**（规划模式）→ 绑 Gemini 2.5 Pro，只讨论不写代码
- **Code**（编码模式）→ 绑 DeepSeek V3，直接写
- **Debug**（调试模式）→ 绑 DeepSeek R1，深度思考
- **Ask**（问答模式）→ 绑 Gemini Flash，快速问答

在 Roo Code 设置里配置。

---

## 七、常见问题

### Q: 为什么不用 Cursor？

A: Cursor 免费版额度小（50 次高级模型/月），BYOK 支持有限。如果订阅 Cursor Pro（$20/月）体验最好，但白嫖场景下 VS Code + Roo Code 更合适。

### Q: 为什么不用 Trae？

A: Trae 的免费额度是用它内置的模型池，不方便切换自己的 API key。适合懒人，不适合白嫖党。

### Q: Roo Code 和 Cline 选哪个？

A: Cline 稳，Roo Code 功能多。想切换多 API key → Roo Code。可以都装对比。

### Q: 额度用完了怎么办？

A: 不会"永久封死"，都是按月/按日重置：
- 月度额度：下月 1 号满血
- 日度额度：第二天重置
- 切换到另一家免费 key 继续用

### Q: 免费模型质量够用吗？

A:
- **Gemini 2.5 Pro / DeepSeek R1**：接近 Claude 3.5，复杂任务能打
- **Gemini 2.0 Flash / DeepSeek V3**：日常任务够用，速度快
- **GLM-4-Flash**：轻量任务，兜底用

### Q: Roo Code 能跑命令吗？安全吗？

A: 能跑（npm install、git 等）。Roo Code 有「审批机制」——每条命令都会弹框问你确认，不会偷偷执行。可以在设置里调「自动批准」的范围。

### Q: 国内用户没梯子怎么办？

A: 主力用 **硅基流动** + **智谱 GLM-4-Flash** + **DeepSeek 官方**。这三个国内直连，完全不用梯子，免费/极便宜。

---

## 八、快速上手清单

照这个顺序做，30 分钟搞定：

- [ ] 安装 VS Code
- [ ] VS Code 扩展市场装 Roo Code
- [ ] VS Code 扩展市场装通义灵码（用阿里账号登录）
- [ ] 注册硅基流动，拿 key
- [ ] 注册智谱 BigModel，拿 key
- [ ] （有梯子）注册 Google AI Studio，拿 Gemini key
- [ ] （有梯子）注册 OpenRouter，拿 key
- [ ] Roo Code 里配置 2-3 个 Profile
- [ ] 测试：让 Roo Code 写个 Hello World
- [ ] 开始白嫖全栈开发

---

## 九、参考链接

- Roo Code 官方文档：[https://docs.roocode.com](https://docs.roocode.com)
- Roo Code GitHub：[https://github.com/RooVetGit/Roo-Code](https://github.com/RooVetGit/Roo-Code)
- Cline GitHub：[https://github.com/cline/cline](https://github.com/cline/cline)
- OpenRouter 模型列表：[https://openrouter.ai/models](https://openrouter.ai/models)
- Google AI Studio：[https://aistudio.google.com](https://aistudio.google.com)

---

**最后更新**：2026-05-08
**适用场景**：全栈开发、AI 辅助编程、白嫖党
梯子能带来的增益：

Gemini 2.5 Pro（质量略高，但和 DeepSeek R1 差距不大）
Claude Sonnet（最强编码，但要付费）
OpenRouter 免费模型池（锦上添花）
我的建议：

先不折腾梯子，用国内三件套（硅基流动 + 智谱 + DeepSeek 官方）
把 Roo Code 配好，跑起来，感受下工作流
真用起来觉得「我需要 Gemini/Claude」再折腾梯子也不迟
