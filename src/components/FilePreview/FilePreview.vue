<template>
  <el-dialog
    v-model="visible"
    :title="fileInfo?.fileName || '文件预览'"
    width="90%"
    :fullscreen="isFullscreen"
    :before-close="handleClose"
    class="file-preview-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="preview-header">
        <div class="file-info">
          <el-icon size="20" class="file-icon">
            <component :is="fileIconComponent" />
          </el-icon>
          <span class="file-name">{{ fileInfo?.fileName }}</span>
          <el-tag v-if="fileConfig.type" size="small" type="info">
            {{ fileTypeLabel }}
          </el-tag>
          <span class="file-size">{{ fileConfig.formattedSize }}</span>
        </div>
        <div class="preview-actions">
          <el-tooltip content="下载">
            <el-button circle @click="handleDownload" :loading="downloading">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
            <el-button circle @click="toggleFullscreen">
              <el-icon>
                <component :is="isFullscreen ? 'Minus' : 'FullScreen'" />
              </el-icon>
            </el-button>
          </el-tooltip>
          <el-button circle @click="handleClose">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <!-- 加载状态 -->
    <div v-if="loading" class="preview-loading">
      <el-icon class="is-loading" size="48"><Loading /></el-icon>
      <p>正在加载预览...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="preview-error">
      <el-icon size="48" color="#f56c6c"><WarningFilled /></el-icon>
      <p>{{ error }}</p>
      <el-button type="primary" @click="retryLoad">重试</el-button>
    </div>

    <!-- 不支持预览 -->
    <div v-else-if="!fileConfig.canPreview" class="preview-unsupported">
      <el-icon size="48"><Document /></el-icon>
      <p>此文件类型暂不支持预览</p>
      <el-button type="primary" @click="handleDownload">下载文件</el-button>
    </div>

    <!-- 预览内容 -->
    <div v-else class="preview-content">
      <component
        :is="previewComponent"
        :file-info="fileInfo"
        :preview-url="previewUrl"
        :file-content="fileContent"
        @error="handlePreviewError"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, shallowRef } from 'vue'
import {
  Download,
  Close,
  FullScreen,
  Minus,
  Loading,
  WarningFilled,
  Document,
  Picture,
  VideoPlay,
  Headset,
  Memo,
  FolderOpened
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPreviewUrl, getFileInfo, logFileAccess, downloadFile } from '@/api/file.js'
import { getPreviewConfig, FILE_TYPES } from '@/utils/fileUtils.js'

// 动态导入预览组件
import ImagePreview from './ImagePreview.vue'
import VideoPreview from './VideoPreview.vue'
import AudioPreview from './AudioPreview.vue'
import PdfPreview from './PdfPreview.vue'
import CodePreview from './CodePreview.vue'
import TextPreview from './TextPreview.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fileId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'closed'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const error = ref('')
const fileInfo = ref(null)
const previewUrl = ref('')
const fileContent = ref(null)
const isFullscreen = ref(false)
const downloading = ref(false)

// 文件配置
const fileConfig = computed(() => {
  if (!fileInfo.value) return {}
  return getPreviewConfig(fileInfo.value)
})

// 文件类型标签
const fileTypeLabel = computed(() => {
  const typeLabels = {
    [FILE_TYPES.IMAGE]: '图片',
    [FILE_TYPES.VIDEO]: '视频',
    [FILE_TYPES.AUDIO]: '音频',
    [FILE_TYPES.PDF]: 'PDF',
    [FILE_TYPES.DOCUMENT]: '文档',
    [FILE_TYPES.CODE]: '代码',
    [FILE_TYPES.TEXT]: '文本',
    [FILE_TYPES.ARCHIVE]: '压缩包',
    [FILE_TYPES.UNKNOWN]: '未知'
  }
  return typeLabels[fileConfig.value.type] || '文件'
})

// 文件图标组件
const fileIconComponent = computed(() => {
  const iconMap = {
    [FILE_TYPES.IMAGE]: Picture,
    [FILE_TYPES.VIDEO]: VideoPlay,
    [FILE_TYPES.AUDIO]: Headset,
    [FILE_TYPES.PDF]: Document,
    [FILE_TYPES.DOCUMENT]: Document,
    [FILE_TYPES.CODE]: Memo,
    [FILE_TYPES.TEXT]: Document,
    [FILE_TYPES.ARCHIVE]: FolderOpened,
    [FILE_TYPES.UNKNOWN]: Document
  }
  return iconMap[fileConfig.value.type] || Document
})

// 预览组件
const previewComponent = shallowRef(null)

// 组件映射
const componentMap = {
  [FILE_TYPES.IMAGE]: ImagePreview,
  [FILE_TYPES.VIDEO]: VideoPreview,
  [FILE_TYPES.AUDIO]: AudioPreview,
  [FILE_TYPES.PDF]: PdfPreview,
  [FILE_TYPES.CODE]: CodePreview,
  [FILE_TYPES.TEXT]: TextPreview
}

// 监听文件ID变化，加载预览
watch(() => props.fileId, async (newFileId) => {
  if (newFileId && visible.value) {
    await loadPreview()
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(visible, async (isVisible) => {
  if (isVisible && props.fileId) {
    await loadPreview()
  }
})

// 加载预览
const loadPreview = async () => {
  if (!props.fileId) return

  loading.value = true
  error.value = ''
  
  try {
    // 1. 获取文件信息
    const fileInfoRes = await getFileInfo(props.fileId)
    fileInfo.value = fileInfoRes.data

    // 2. 检查是否支持预览
    const config = getPreviewConfig(fileInfo.value)
    if (!config.canPreview) {
      loading.value = false
      return
    }

    // 3. 设置预览组件
    previewComponent.value = componentMap[config.type]

    // 4. 获取预览URL
    const urlRes = await getPreviewUrl(props.fileId, {
      expireMinutes: 30,
      operation: 'preview'
    })
    previewUrl.value = urlRes.data.presignedUrl

    // 5. 对于文本和代码类型，需要获取文件内容
    if (config.type === FILE_TYPES.TEXT || config.type === FILE_TYPES.CODE) {
      const response = await fetch(previewUrl.value)
      fileContent.value = await response.text()
    }

    // 6. 记录访问日志
    await logFileAccess(props.fileId, {
      operation: 'preview',
      accessSource: 'web'
    })

    loading.value = false
  } catch (err) {
    console.error('加载预览失败:', err)
    error.value = err.message || '加载预览失败，请重试'
    loading.value = false
  }
}

// 重试加载
const retryLoad = () => {
  loadPreview()
}

// 处理预览错误
const handlePreviewError = (err) => {
  error.value = err.message || '预览失败'
}

// 下载文件
const handleDownload = async () => {
  downloading.value = true
  try {
    const blob = await downloadFile(props.fileId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileInfo.value?.fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (err) {
    console.error('下载失败:', err)
    ElMessage.error('下载失败')
  } finally {
    downloading.value = false
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 关闭预览
const handleClose = () => {
  visible.value = false
  emit('closed')
  // 重置状态
  setTimeout(() => {
    fileInfo.value = null
    previewUrl.value = ''
    fileContent.value = null
    error.value = ''
    isFullscreen.value = false
    previewComponent.value = null
  }, 300)
}
</script>

<style scoped>
.file-preview-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.file-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  height: calc(85vh - 60px);
  overflow: hidden;
}

.file-preview-dialog.is-fullscreen :deep(.el-dialog__body) {
  height: calc(100vh - 60px);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  color: #14b8a6;
}

.file-name {
  font-weight: 600;
  color: #1f2937;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #6b7280;
  font-size: 13px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-loading,
.preview-error,
.preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.preview-loading p,
.preview-error p,
.preview-unsupported p {
  margin: 16px 0;
  color: #6b7280;
  font-size: 15px;
}

.preview-content {
  height: 100%;
  overflow: auto;
  background: #f9fafb;
}
</style>
