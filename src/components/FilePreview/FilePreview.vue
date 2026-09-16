<template>
  <el-dialog
    v-model="visible"
    :title="fileInfo.fileName"
    width="min(1080px, calc(100vw - 32px))"
    :fullscreen="isFullscreen"
    destroy-on-close
    @closed="resetPreview"
  >
    <template #header>
      <div class="preview-header">
        <div class="preview-header__name">
          <el-icon><Document /></el-icon>
          <span>{{ fileInfo.fileName }}</span>
          <span class="preview-header__size">{{ fileConfig.formattedSize }}</span>
        </div>
        <div class="preview-header__actions">
          <el-tooltip content="下载"><el-button circle aria-label="下载文件" :loading="downloading" @click="handleDownload"><el-icon><Download /></el-icon></el-button></el-tooltip>
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'"><el-button circle :aria-label="isFullscreen ? '退出全屏' : '全屏'" @click="isFullscreen = !isFullscreen"><el-icon><FullScreen /></el-icon></el-button></el-tooltip>
        </div>
      </div>
    </template>

    <div v-if="loading" class="preview-state"><el-icon class="is-loading" size="36"><Loading /></el-icon></div>
    <div v-else-if="error" class="preview-state">
      <el-icon size="36" color="var(--el-color-danger)"><WarningFilled /></el-icon>
      <p>{{ error }}</p>
      <el-button type="primary" @click="loadPreview">重试</el-button>
    </div>
    <div v-else-if="!fileConfig.canPreview" class="preview-state">
      <el-icon size="36"><Document /></el-icon>
      <p>此文件类型暂不支持在线预览</p>
      <el-button type="primary" @click="handleDownload">下载文件</el-button>
    </div>
    <div v-else class="preview-content">
      <component :is="previewComponent" :file-info="fileInfo" :preview-url="previewUrl" :file-content="fileContent" @error="handlePreviewError" />
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Document, Download, FullScreen, Loading, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadFile } from '@/api/file.js'
import { FILE_TYPES, getPreviewConfig } from '@/utils/fileUtils.js'
import AudioPreview from './AudioPreview.vue'
import CodePreview from './CodePreview.vue'
import ImagePreview from './ImagePreview.vue'
import PdfPreview from './PdfPreview.vue'
import TextPreview from './TextPreview.vue'
import VideoPreview from './VideoPreview.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  fileId: { type: [String, Number], required: true },
  file: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue', 'closed'])

const visible = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const loading = ref(false)
const downloading = ref(false)
const error = ref('')
const previewUrl = ref('')
const fileContent = ref('')
const isFullscreen = ref(false)
const previewComponent = shallowRef(null)
const previewBlob = ref(null)

const fileInfo = computed(() => ({
  fileName: props.file.filename || '未命名文件',
  fileSize: Number(props.file.size) || 0,
  mimeType: previewBlob.value?.type || ''
}))
const fileConfig = computed(() => getPreviewConfig(fileInfo.value))
const componentMap = {
  [FILE_TYPES.IMAGE]: ImagePreview,
  [FILE_TYPES.VIDEO]: VideoPreview,
  [FILE_TYPES.AUDIO]: AudioPreview,
  [FILE_TYPES.PDF]: PdfPreview,
  [FILE_TYPES.CODE]: CodePreview,
  [FILE_TYPES.TEXT]: TextPreview
}

const revokePreviewUrl = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

const loadPreview = async () => {
  loading.value = true
  error.value = ''
  revokePreviewUrl()
  try {
    const blob = await downloadFile(props.fileId)
    previewBlob.value = blob
    const config = getPreviewConfig({ ...fileInfo.value, mimeType: blob.type })
    if (config.canPreview) {
      previewComponent.value = componentMap[config.type]
      previewUrl.value = URL.createObjectURL(blob)
      if (config.type === FILE_TYPES.TEXT || config.type === FILE_TYPES.CODE) fileContent.value = await blob.text()
    }
  } catch (requestError) {
    console.error('加载文件预览失败:', requestError)
    error.value = requestError.message || '加载预览失败'
  } finally {
    loading.value = false
  }
}

const handlePreviewError = previewError => {
  error.value = previewError?.message || '文件预览失败'
}

const handleDownload = async () => {
  downloading.value = true
  try {
    const blob = previewBlob.value || await downloadFile(props.fileId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileInfo.value.fileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (requestError) {
    console.error('文件下载失败:', requestError)
    ElMessage.error('文件下载失败')
  } finally {
    downloading.value = false
  }
}

const resetPreview = () => {
  revokePreviewUrl()
  previewBlob.value = null
  fileContent.value = ''
  previewComponent.value = null
  error.value = ''
  isFullscreen.value = false
  emit('closed')
}

watch(() => [visible.value, props.fileId], ([isVisible]) => {
  if (isVisible) loadPreview()
}, { immediate: true })
onBeforeUnmount(revokePreviewUrl)
</script>

<style scoped>
.preview-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; }
.preview-header__name { display: flex; align-items: center; gap: 8px; min-width: 0; font-weight: 600; }
.preview-header__name > span:first-of-type { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-header__size { flex: 0 0 auto; color: var(--el-text-color-secondary); font-size: 13px; font-weight: 400; }
.preview-header__actions { display: flex; gap: 8px; }
.preview-state { min-height: 50vh; display: grid; place-content: center; justify-items: center; gap: 16px; color: var(--el-text-color-secondary); }
.preview-state p { margin: 0; }
.preview-content { min-height: min(70vh, 720px); }
</style>
