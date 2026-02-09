<template>
  <div class="audio-preview">
    <div class="audio-container">
      <div class="audio-header">
        <el-icon size="64" class="audio-icon"><Headset /></el-icon>
        <h3>{{ fileInfo.fileName }}</h3>
        <p class="file-size">{{ formatFileSize(fileInfo.fileSize) }}</p>
      </div>
      <audio
        ref="audioRef"
        :src="previewUrl"
        controls
        controlsList="nodownload"
        @error="handleAudioError"
        @loadedmetadata="handleAudioLoad"
      >
        您的浏览器不支持音频播放
      </audio>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Headset } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/fileUtils.js'

const props = defineProps({
  previewUrl: {
    type: String,
    required: true
  },
  fileInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['error'])

const audioRef = ref(null)

const handleAudioLoad = () => {
  console.log('音频加载成功')
}

const handleAudioError = () => {
  emit('error', { message: '音频加载失败或格式不支持' })
}
</script>

<style scoped>
.audio-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.audio-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  min-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.audio-header {
  text-align: center;
  margin-bottom: 30px;
}

.audio-icon {
  color: #14b8a6;
  margin-bottom: 16px;
}

.audio-header h3 {
  font-size: 18px;
  color: #1f2937;
  margin: 0 0 8px 0;
  word-break: break-all;
}

.file-size {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}

audio {
  width: 100%;
  outline: none;
}
</style>
