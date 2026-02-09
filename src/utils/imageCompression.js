/**
 * 图像压缩工具
 * 用于压缩上传的图片文件，减小文件大小
 */

import { API_CONFIG } from '@/config/api.js'

/**
 * 压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度，默认800
 * @param {number} options.maxHeight - 最大高度，默认800
 * @param {number} options.quality - 压缩质量 0-1，默认0.8
 * @param {number} options.maxSize - 目标最大文件大小（字节），默认2MB
 * @returns {Promise<File>} 压缩后的文件
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = API_CONFIG.AVATAR.MAX_WIDTH,
    maxHeight = API_CONFIG.AVATAR.MAX_HEIGHT,
    quality = API_CONFIG.AVATAR.COMPRESSION_QUALITY,
    maxSize = API_CONFIG.AVATAR.MAX_COMPRESSED_SIZE
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // 计算压缩后的尺寸
          let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight)
          
          // 创建canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          
          // 使用更好的图像平滑算法
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height)
          
          // 转换为Blob，逐步降低质量直到满足大小要求
          compressToTargetSize(canvas, file.type, quality, maxSize)
            .then(blob => {
              // 创建新的File对象
              const compressedFile = new File(
                [blob],
                file.name,
                { type: file.type, lastModified: Date.now() }
              )
              
              console.log(`📦 图片压缩完成: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`)
              resolve(compressedFile)
            })
            .catch(reject)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 计算压缩后的尺寸（保持宽高比）
 * @param {number} width - 原始宽度
 * @param {number} height - 原始高度
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {Object} { width, height }
 */
function calculateDimensions(width, height, maxWidth, maxHeight) {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }
  
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const ratio = Math.min(widthRatio, heightRatio)
  
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  }
}

/**
 * 压缩到目标文件大小
 * @param {HTMLCanvasElement} canvas - canvas元素
 * @param {string} mimeType - MIME类型
 * @param {number} initialQuality - 初始质量
 * @param {number} maxSize - 目标最大大小
 * @returns {Promise<Blob>}
 */
async function compressToTargetSize(canvas, mimeType, initialQuality, maxSize) {
  let quality = initialQuality
  let blob = null
  let attempts = 0
  const maxAttempts = 10
  
  // 如果是PNG，先尝试转换为JPEG以获得更好的压缩效果
  const outputType = mimeType === 'image/png' ? 'image/jpeg' : mimeType
  
  while (attempts < maxAttempts) {
    blob = await new Promise(resolve => {
      canvas.toBlob(resolve, outputType, quality)
    })
    
    // 如果文件大小满足要求，或质量已经很低了，就返回
    if (blob.size <= maxSize || quality <= 0.1) {
      break
    }
    
    // 根据当前大小和目标大小，智能调整质量
    const ratio = maxSize / blob.size
    quality = Math.max(0.1, quality * ratio * 0.9) // 稍微保守一点
    attempts++
  }
  
  return blob
}

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateImageFile(file) {
  // 检查文件类型
  const allowedTypes = API_CONFIG.AVATAR.ALLOWED_TYPES
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `不支持的文件格式。仅支持: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    }
  }
  
  // 检查文件大小
  const maxSize = API_CONFIG.AVATAR.MAX_SIZE
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `文件大小超过限制。最大允许: ${formatFileSize(maxSize)}`
    }
  }
  
  return { valid: true, message: '' }
}

/**
 * 检查图片是否需要压缩
 * @param {File} file - 文件对象
 * @returns {boolean}
 */
export function needsCompression(file) {
  const targetSize = API_CONFIG.AVATAR.MAX_COMPRESSED_SIZE
  return file.size > targetSize
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取图片的尺寸信息
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} { width, height }
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        reject(new Error('无法加载图片'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}
