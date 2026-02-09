<template>
  <div class="video-preview">
    <video
      ref="videoRef"
      :src="previewUrl"
      controls
      controlsList="nodownload"
      @error="handleVideoError"
      @loadedmetadata="handleVideoLoad"
    >
      您的浏览器不支持视频播放
    </video>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

const videoRef = ref(null)

const handleVideoLoad = () => {
  console.log('视频加载成功')
}

const handleVideoError = () => {
  emit('error', { message: '视频加载失败或格式不支持' })
}
</script>

<style scoped>
.video-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 20px;
}

video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}
</style>
