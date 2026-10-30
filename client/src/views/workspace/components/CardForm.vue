<!--
  卡片创建 / 编辑弹窗（同一表单复用）：
  - mode="create" 创建模式；mode="edit" 编辑模式（同时传 card 用于预填 + 拿 id）

  ⚠️ 编辑器待优化（当前工具栏用默认全集，以下功能未接通 / 有隐患）：
  - 图片上传 / 裁剪上传：未实现 onUploadImg 回调，且后端无上传接口 / 存储，上传后不会插图（只能用「添加链接」贴图片外链）
  - 代码高亮 / katex 公式 / mermaid 图 / prettier 美化 / 浏览器全屏(fullscreen)：这些功能 md-editor-v3 默认从 unpkg.com CDN 加载，且在弹窗打开(onMounted)时即加载、非按需；断网 / CDN 不可达时失效（需改为本地打包或配自建 CDN）。注：pageFullscreen（页内全屏）不依赖 CDN，不受影响
  - 注：:preview="false" 只隐藏预览面板，不阻止 CDN 加载（内容渲染器仍无条件挂载）
-->
<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMessage } from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import type { Card, CardType } from "@/types/home";
import type { CardPayload } from "@/types/workspace";
import { createCard, updateCard } from "@/api/workspaceService";
import {
  CARD_TYPES,
  VISIBILITY_OPTIONS,
  DIFFICULTY_MAP,
} from "@/components/card/constants";

const props = defineProps<{
  mode: "create" | "edit";
  card?: Card | null;
}>();

const emit = defineEmits<{
  // 保存成功（接口已在本组件调完），通知父组件刷新列表 / 侧边栏
  (e: "saved"): void;
  (e: "close"): void;
}>();

const message = useMessage();
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);

// 表单字段类型
type FormState = {
  title: string;
  type: CardType;
  visibility: "public" | "private";
  difficulty: "easy" | "medium" | "hard";
  tagsInput: string;
  content: string;
  answer: string;
};

// 根据 mode 构建表单值（edit = 读 card 预填，create = 默认值）——字段清单只写这一处
function buildForm(): FormState {
  const c = props.mode === "edit" ? props.card : null;
  return {
    title: c?.title ?? "",
    type: c?.type ?? "note",
    visibility: c?.visibility === "public" ? "public" : "private",
    difficulty: c?.difficulty ?? "medium",
    tagsInput: (c?.tags ?? []).join(", "),
    content: c?.content ?? "",
    answer: c?.answer ?? "",
  };
}

const form = reactive<FormState>(buildForm());

// 难度选项
const difficultyOptions = Object.entries(DIFFICULTY_MAP).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

// 表单校验规则（结构化字段）——只有标题必填，其余有默认值不会为空
const rules: FormRules = {
  title: {
    required: true,
    message: "请输入标题",
    trigger: ["input", "blur"],
  },
};

// 收集表单 → 提交载荷
function buildPayload(): CardPayload {
  const isQuestion = form.type === "question";
  return {
    title: form.title.trim(),
    content: form.content,
    type: form.type,
    visibility: form.visibility,
    tags: [
      ...new Set(
        form.tagsInput
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ],
    // 难度 / 答案仅面试题有意义
    difficulty: isQuestion ? form.difficulty : null,
    answer: isQuestion ? form.answer.trim() || null : null,
  };
}

async function handleSubmit() {
  // 结构化字段走表单校验（未通过 n-form-item 已内联提示）
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  // 正文是富文本、不在表单内，单独守卫必填
  if (!form.content.trim()) {
    message.warning("正文不能为空");
    return;
  }
  const payload = buildPayload();
  submitting.value = true;
  try {
    if (props.mode === "edit" && props.card) {
      await updateCard(props.card.id, payload);
      message.success("修改成功");
    } else {
      await createCard(payload);
      message.success("创建成功");
    }
    emit("saved");
    emit("close");
  } catch (e) {
    message.error(e.message);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <n-modal
    :show="true"
    :auto-focus="false"
    @update:show="
      (v: any) => {
        if (!v) emit('close');
      }
    "
  >
    <div
      class="w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-2xl border border-line shadow-[0_12px_48px_rgba(0,0,0,0.18)] overflow-hidden"
    >
      <!-- 头部 -->
      <div
        class="flex items-center justify-between px-7 py-5 border-b border-line-soft shrink-0"
      >
        <div>
          <h2 class="font-serif text-[22px] font-semibold text-ink-900">
            {{ mode === "edit" ? "编辑卡片" : "新建卡片" }}
          </h2>
          <p class="text-xs text-ink-400 mt-0.5">
            {{
              mode === "edit"
                ? "修改这张卡片的内容"
                : "记录一个知识点，稍后复习"
            }}
          </p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-soft hover:text-ink-900 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- 表单主体（可滚动） -->
      <div class="flex-1 overflow-y-auto px-7 py-6 space-y-5">
        <!-- 结构化字段：走 n-form 校验 -->
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item path="title" label="标题">
            <n-input
              v-model:value="form.title"
              placeholder="给这张卡起个名字"
            />
          </n-form-item>

          <div class="flex flex-wrap gap-3">
            <n-form-item label="类型" class="flex-1 min-w-37.5">
              <n-select v-model:value="form.type" :options="CARD_TYPES" />
            </n-form-item>
            <n-form-item label="可见性" class="flex-1 min-w-37.5">
              <n-select
                v-model:value="form.visibility"
                :options="VISIBILITY_OPTIONS"
              />
            </n-form-item>
            <n-form-item
              v-if="form.type === 'question'"
              label="难度"
              class="flex-1 min-w-37.5"
            >
              <n-select
                v-model:value="form.difficulty"
                :options="difficultyOptions"
              />
            </n-form-item>
          </div>

          <n-form-item path="tagsInput" label="标签（逗号分隔）">
            <n-input
              v-model:value="form.tagsInput"
              placeholder="JavaScript, Vue 3, 性能"
            />
          </n-form-item>
        </n-form>

        <!-- 正文（富文本，必填，不走表单） -->
        <div>
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">
            正文 <span class="text-ink-400">（Markdown）</span>
          </label>
          <MdEditor
            v-model="form.content"
            :preview="false"
            placeholder="在这里用 Markdown 写正文……"
            style="height: 320px"
          />
        </div>

        <!-- 参考答案（仅面试题，选填） -->
        <div v-if="form.type === 'question'">
          <label class="block text-[13px] font-medium text-ink-700 mb-1.5">
            参考答案 <span class="text-ink-400">（可选）</span>
          </label>
          <MdEditor
            v-model="form.answer"
            :preview="false"
            placeholder="参考答案……"
            style="height: 200px"
          />
        </div>
      </div>

      <!-- 底部操作 -->
      <div
        class="flex items-center justify-end gap-2.5 px-7 py-4 border-t border-line-soft bg-softer shrink-0"
      >
        <button type="button" class="cf-btn-ghost" @click="emit('close')">
          取消
        </button>
        <button
          type="button"
          :disabled="submitting"
          class="cf-btn-primary"
          @click="handleSubmit"
        >
          {{
            submitting ? "保存中…" : mode === "edit" ? "保存修改" : "创建卡片"
          }}
        </button>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
/* —— n-form 紧凑化 + 贴合暖调（覆盖 naive-ui 默认）—— */
/* 标签：缩小、减粗、收紧间距 */
:deep(.n-form-item-label) {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink-700);
  padding-bottom: 6px;
}
/* 校验反馈区：压缩默认预留的大空白 */
:deep(.n-form-item-feedback-wrapper) {
  min-height: 18px;
  font-size: 12px;
}
/* form-item 本身不再额外掌间距（靠 feedback 区和外层 space-y） */
:deep(.n-form-item) {
  margin-bottom: 0;
}
/* 输入框 / 下拉：圆角和卡片统一 */
:deep(.n-input),
:deep(.n-base-selection) {
  border-radius: 10px;
}

.cf-btn-ghost {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--color-line);
  background: var(--color-card);
  font-size: 13.5px;
  color: var(--color-ink-700);
  cursor: pointer;
  transition: background 0.15s;
}
.cf-btn-ghost:hover {
  background: var(--color-soft);
}
.cf-btn-primary {
  padding: 8px 18px;
  border-radius: 10px;
  background: var(--color-brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.cf-btn-primary:hover {
  background: var(--color-brand-hover);
}
.cf-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
