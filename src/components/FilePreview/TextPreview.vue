<template>
  <div class="text-preview">
    <div class="text-header">
      <span>文本文件</span>
      <el-button size="small" @click="copyText">
        <el-icon><DocumentCopy /></el-icon>
        复制内容
      </el-button>
    </div>
    <div class="text-content">
      <pre>{{ fileContent }}</pre>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(props.fileContent)
    ElMessage.success('内容已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.text-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.text-header span {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.text-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.text-content pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
