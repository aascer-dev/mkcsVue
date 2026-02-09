<template>
  <div class="pdf-preview">
    <iframe
      :src="previewUrl"
      frameborder="0"
      @load="handlePdfLoad"
      @error="handlePdfError"
    ></iframe>
  </div>
</template>

<script setup>
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

const handlePdfLoad = () => {
  console.log('PDF加载成功')
}

const handlePdfError = () => {
  emit('error', { message: 'PDF加载失败' })
}
</script>

<style scoped>
.pdf-preview {
  height: 100%;
  background: #525252;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
