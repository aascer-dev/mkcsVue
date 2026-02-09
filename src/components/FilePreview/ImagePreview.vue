<template>
  <div class="image-preview">
    <div class="image-toolbar">
      <el-button-group>
        <el-tooltip content="放大">
          <el-button size="small" @click="zoomIn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="缩小">
          <el-button size="small" @click="zoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="1:1">
          <el-button size="small" @click="resetZoom">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="旋转">
          <el-button size="small" @click="rotate">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
      <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
    </div>

    <div class="image-container" @wheel="handleWheel">
      <img
        :src="previewUrl"
        :style="imageStyle"
        @load="handleImageLoad"
        @error="handleImageError"
        @mousedown="handleMouseDown"
        draggable="false"
        alt="preview"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ZoomIn, ZoomOut, FullScreen, RefreshRight } from '@element-plus/icons-vue'

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

const scale = ref(1)
const rotation = ref(0)
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const imageStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
  transition: dragging.value ? 'none' : 'transform 0.3s ease',
  cursor: dragging.value ? 'grabbing' : scale.value > 1 ? 'grab' : 'default'
}))

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.25)
}

const resetZoom = () => {
  scale.value = 1
  rotation.value = 0
  position.value = { x: 0, y: 0 }
}

const rotate = () => {
  rotation.value = (rotation.value + 90) % 360
}

const handleWheel = (e) => {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

const handleMouseDown = (e) => {
  if (scale.value <= 1) return
  dragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }

  const handleMouseMove = (e) => {
    if (dragging.value) {
      position.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y
      }
    }
  }

  const handleMouseUp = () => {
    dragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleImageLoad = () => {
  console.log('图片加载成功')
}

const handleImageError = () => {
  emit('error', { message: '图片加载失败' })
}
</script>

<style scoped>
.image-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1f2937;
}

.image-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.6);
}

.zoom-info {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.image-container img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  user-select: none;
}
</style>
