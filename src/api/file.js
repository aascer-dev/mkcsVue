import request from '@/utils/request.js'

// 获取文件列表
export const getFileList = (path = '/') => {
  return request({
    url: '/files/list',
    method: 'get',
    params: { path }
  })
}

// 上传文件
export const uploadFile = (formData, onUploadProgress) => {
  return request({
    url: '/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  })
}

/**
 * 下载文件
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @returns {Promise<Blob>} - 文件 Blob 对象
 */
export const downloadFile = (fileId) => {
  return request({
    url: `/files/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 删除文件
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @returns {Promise} - 删除结果
 */
export const deleteFile = (fileId) => {
  return request({
    url: `/files/delete/${fileId}`,
    method: 'delete'
  })
}

// 创建文件夹
export const createFolder = (data) => {
  return request({
    url: '/files/folder',
    method: 'post',
    data
  })
}

/**
 * 重命名文件/文件夹
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @param {string} newName - 新文件名
 * @returns {Promise} - 重命名结果
 */
export const renameFile = (fileId, newName) => {
  return request({
    url: `/files/rename/${fileId}`,
    method: 'put',
    data: { name: newName }
  })
}

/**
 * 移动文件/文件夹
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @param {string} targetPath - 目标路径
 * @returns {Promise} - 移动结果
 */
export const moveFile = (fileId, targetPath) => {
  return request({
    url: `/files/move/${fileId}`,
    method: 'put',
    data: { targetPath }
  })
}

// ====== 文件预览相关 ======

/**
 * 获取文件预览URL（预签名URL）
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @param {Object} options - 预览选项
 * @param {number} options.expireMinutes - 过期时间（分钟）
 * @param {string} options.operation - 操作类型
 * @param {boolean} options.watermark - 是否添加水印
 * @param {string} options.quality - 质量等级
 * @returns {Promise} - 预览URL对象
 */
export const getPreviewUrl = (fileId, options = {}) => {
  return request({
    url: `/api/files/${fileId}/preview-url`,
    method: 'post',
    data: {
      expireMinutes: options.expireMinutes || 30,
      operation: options.operation || 'preview',
      watermark: options.watermark || false,
      quality: options.quality || 'medium'
    }
  })
}

/**
 * 批量获取预览URL
 * @param {string[]} fileIds - 文件ID数组（雪花ID，必须为字符串）
 * @param {Object} options - 预览选项
 * @returns {Promise} - 预览URL列表
 */
export const getBatchPreviewUrls = (fileIds, options = {}) => {
  return request({
    url: '/api/files/batch/preview-urls',
    method: 'post',
    data: {
      fileIds,
      expireMinutes: options.expireMinutes || 30,
      operation: options.operation || 'preview'
    }
  })
}

/**
 * 检查文件预览权限
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @param {string} operation - 操作类型，默认为 'preview'
 * @returns {Promise} - 权限检查结果
 */
export const checkFilePermission = (fileId, operation = 'preview') => {
  return request({
    url: `/api/files/${fileId}/check-permission`,
    method: 'post',
    data: { operation }
  })
}

/**
 * 获取文件详细信息
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @returns {Promise} - 文件信息对象
 */
export const getFileInfo = (fileId) => {
  return request({
    url: `/api/files/${fileId}/info`,
    method: 'get'
  })
}

/**
 * 记录文件访问日志
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @param {Object} accessInfo - 访问信息
 * @returns {Promise} - 日志记录结果
 */
export const logFileAccess = (fileId, accessInfo) => {
  return request({
    url: `/api/files/${fileId}/access-log`,
    method: 'post',
    data: {
      operation: accessInfo.operation || 'preview',
      userAgent: navigator.userAgent,
      ipAddress: accessInfo.ipAddress,
      accessSource: accessInfo.accessSource || 'web'
    }
  })
}

/**
 * 刷新预览缓存
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @param {string} cacheType - 缓存类型，默认为 'presigned_url'
 * @returns {Promise} - 刷新结果
 */
export const refreshPreviewCache = (fileId, cacheType = 'presigned_url') => {
  return request({
    url: `/api/files/${fileId}/cache/refresh`,
    method: 'post',
    data: { cacheType }
  })
}

/**
 * 获取缓存状态
 * @param {string} fileId - 文件ID（雪花ID，必须为字符串）
 * @returns {Promise} - 缓存状态对象
 */
export const getCacheStatus = (fileId) => {
  return request({
    url: `/api/files/${fileId}/cache/status`,
    method: 'get'
  })
}