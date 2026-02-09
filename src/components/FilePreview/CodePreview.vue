<template>
  <div class="code-preview">
    <div class="code-header">
      <span class="language-badge">{{ language }}</span>
      <el-button size="small" @click="copyCode">
        <el-icon><DocumentCopy /></el-icon>
        复制代码
      </el-button>
    </div>
    <pre class="code-content"><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCodeLanguage, escapeHtml } from '@/utils/fileUtils.js'

const props = defineProps({
  fileContent: {
    type: String,
    required: true
  },
  fileInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['error'])

const language = computed(() => {
  return getCodeLanguage(props.fileInfo.fileName)
})

// 简单的语法高亮（可以后续接入Prism.js或highlight.js）
const highlightedCode = computed(() => {
  return escapeHtml(props.fileContent)
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.fileContent)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.code-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
}

.language-badge {
  color: #14b8a6;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.code-content {
  flex: 1;
  margin: 0;
  padding: 20px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  background: #1e1e1e;
}

.code-content code {
  display: block;
  white-space: pre;
  word-wrap: normal;
}
</style>
