import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilePreviewStore = defineStore('filePreview', () => {
  // 预览状态
  const isPreviewVisible = ref(false)
  const currentFileId = ref(null)
  const previewHistory = ref([])
  const maxHistorySize = 20

  /**
   * 打开文件预览
   */
  const openPreview = (fileId) => {
    currentFileId.value = fileId
    isPreviewVisible.value = true
    
    // 添加到历史记录
    addToHistory(fileId)
  }

  /**
   * 关闭预览
   */
  const closePreview = () => {
    isPreviewVisible.value = false
    // 不立即清空fileId，等动画结束后再清空
    setTimeout(() => {
      if (!isPreviewVisible.value) {
        currentFileId.value = null
      }
    }, 300)
  }

  /**
   * 添加到预览历史
   */
  const addToHistory = (fileId) => {
    // 移除已存在的（确保比较字符串）
    const fileIdStr = String(fileId)
    const index = previewHistory.value.findIndex(id => String(id) === fileIdStr)
    if (index > -1) {
      previewHistory.value.splice(index, 1)
    }
    
    // 添加到开头
    previewHistory.value.unshift(fileIdStr)
    
    // 限制历史记录数量
    if (previewHistory.value.length > maxHistorySize) {
      previewHistory.value = previewHistory.value.slice(0, maxHistorySize)
    }
  }

  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    previewHistory.value = []
  }

  /**
   * 预览上一个文件
   */
  const previewPrevious = () => {
    if (!currentFileId.value) return null
    
    const currentIdStr = String(currentFileId.value)
    const currentIndex = previewHistory.value.findIndex(id => String(id) === currentIdStr)
    if (currentIndex < previewHistory.value.length - 1) {
      const prevFileId = previewHistory.value[currentIndex + 1]
      openPreview(prevFileId)
      return prevFileId
    }
    return null
  }

  /**
   * 预览下一个文件
   */
  const previewNext = () => {
    if (!currentFileId.value) return null
    
    const currentIdStr = String(currentFileId.value)
    const currentIndex = previewHistory.value.findIndex(id => String(id) === currentIdStr)
    if (currentIndex > 0) {
      const nextFileId = previewHistory.value[currentIndex - 1]
      openPreview(nextFileId)
      return nextFileId
    }
    return null
  }

  return {
    // state
    isPreviewVisible,
    currentFileId,
    previewHistory,

    // actions
    openPreview,
    closePreview,
    clearHistory,
    previewPrevious,
    previewNext
  }
})
