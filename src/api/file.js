import request from '@/utils/request.js'
import axios from 'axios'

/**
 * 获取文件夹内容（按文件夹ID）
 * @param {number} folderId - 文件夹ID（0 表示根目录）
 * @param {number} pageNum - 页码
 * @param {number} pageSize - 每页条数
 */
export const getFolderContents = (folderId = 0, pageNum = 1, pageSize = 20) => {
  return request({
    url: `/api/files/folder/${folderId}/contents`,
    method: 'get',
    params: { pageNum, pageSize }
  })
}

/**
 * 获取文件详情
 * @param {number} fileId - 文件ID
 */
export const getFileInfo = (fileId) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'get'
  })
}

/**
 * 上传文件
 * @param {FormData} formData - 包含 file, parentId, bucketId
 * @param {Function} onUploadProgress - 上传进度回调
 * @param {AbortSignal} signal - 中断上传的信号
 */
export const uploadFile = (formData, onUploadProgress, signal) => {
  return request({
    url: '/api/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress,
    signal
  })
}

/**
 * 下载文件
 * @param {number} fileId - 文件ID
 * @returns {Promise<Blob>}
 */
export const downloadFile = (fileId) => {
  return request({
    url: `/api/files/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/** Obtain a short-lived URL for native browser preview and Range streaming. */
export const createPreviewUrl = (fileId) => {
  return request({
    url: `/api/files/${fileId}/preview-url`,
    method: 'post'
  })
}

/**
 * 删除文件（软删除）
 * @param {number} fileId - 文件ID
 */
export const deleteFile = (fileId) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'delete'
  })
}

/**
 * 批量删除文件
 * @param {number[]} fileIds - 文件ID数组
 */
export const batchDeleteFiles = (fileIds) => {
  return request({
    url: '/api/files/batch-delete',
    method: 'post',
    data: fileIds
  })
}

/**
 * 创建文件夹
 * @param {Object} data - { folderName, parentId, bucketId }
 */
export const createFolder = (data) => {
  return request({
    url: '/api/files/folder/create',
    method: 'post',
    data
  })
}

/**
 * 批量创建文件夹（支持嵌套路径）
 * @param {Object} data - { folderPath, parentId, bucketId }
 */
export const batchCreateFolders = (data) => {
  return request({
    url: '/api/files/folder/batch-create',
    method: 'post',
    data
  })
}

/**
 * 重命名文件/文件夹
 * @param {number} fileId - 文件ID
 * @param {string} newName - 新名称
 */
export const renameFile = (fileId, newName) => {
  return request({
    url: `/api/files/${fileId}/rename`,
    method: 'put',
    params: { newName }
  })
}

/**
 * 移动文件/文件夹
 * @param {number} fileId - 文件ID
 * @param {number} targetParentId - 目标父文件夹ID
 */
export const moveFile = (fileId, targetParentId) => {
  return request({
    url: `/api/files/${fileId}/move`,
    method: 'put',
    params: { targetParentId }
  })
}

/**
 * 搜索文件
 * @param {string} keyword - 搜索关键词
 * @param {number} pageNum - 页码
 * @param {number} pageSize - 每页条数
 */
export const searchFiles = (keyword, pageNum = 1, pageSize = 20) => {
  return request({
    url: '/api/files/search',
    method: 'get',
    params: { keyword, pageNum, pageSize }
  })
}

// ==================== 秒传相关 ====================

/**
 * 秒传检查
 * @param {Object} params - { filename, contentHash, fileSize, parentId, bucketId, mimeType }
 */
export const checkFileExists = (params) => {
  return request({
    url: '/api/files/check',
    method: 'post',
    params
  })
}

// ==================== 分片上传相关 ====================

/**
 * 初始化分片上传
 * @param {Object} data - ChunkUploadRequest body
 */
export const initChunkUpload = (data) => {
  return request({
    url: '/api/files/chunk/init',
    method: 'post',
    data
  })
}

/**
 * 上传单个分片
 * @param {FormData} formData - 包含 uploadId, chunkIndex, chunk, chunkHash, randomOffset, randomLength, randomHash
 * @param {Function} onUploadProgress - 上传进度回调
 */
export const uploadChunk = (formData, onUploadProgress) => {
  return request({
    url: '/api/files/chunk/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  })
}

/**
 * 完成分片上传（合并分片）
 * @param {string} uploadId - 上传任务ID
 * @param {string} fileHash - 文件完整hash
 */
export const completeChunkUpload = (uploadId, fileHash) => {
  return request({
    url: '/api/files/chunk/complete',
    method: 'post',
    params: { uploadId, fileHash }
  })
}

/**
 * 取消分片上传
 * @param {string} uploadId - 上传任务ID
 */
export const cancelChunkUpload = (uploadId) => {
  return request({
    url: '/api/files/chunk/cancel',
    method: 'delete',
    params: { uploadId }
  })
}

// ==================== MinIO Multipart 直传 ====================

export const initMultipartUpload = data => request({ url: '/api/files/multipart/init', method: 'post', data })
export const verifyMultipartSecondUpload = data => request({ url: '/api/files/multipart/second-upload/verify', method: 'post', data })
export const getMultipartUploadStatus = uploadId => request({ url: `/api/files/multipart/${uploadId}/status`, method: 'get' })
export const presignMultipartPart = data => request({ url: '/api/files/multipart/presign', method: 'post', data })
export const completeMultipartUpload = data => request({ url: '/api/files/multipart/complete', method: 'post', data })
export const cancelMultipartUpload = uploadId => request({ url: `/api/files/multipart/${uploadId}`, method: 'delete' })

// ==================== 收藏夹 ====================

export const getFavorites = () => request({ url: '/api/favorites', method: 'get' })
export const favoriteFile = (fileId, notes = '') => request({
  url: `/api/favorites/${fileId}`,
  method: 'put',
  data: { notes }
})
export const unfavoriteFile = fileId => request({ url: `/api/favorites/${fileId}`, method: 'delete' })

// ==================== 回收站 ====================

export const getRecycleBinFiles = () => request({ url: '/api/files/recycle-bin', method: 'get' })
export const restoreRecycleBinFiles = fileIds => request({
  url: '/api/files/recycle-bin/restore',
  method: 'post',
  data: { fileIds }
})
export const permanentlyDeleteRecycleBinFiles = fileIds => request({
  url: '/api/files/recycle-bin',
  method: 'delete',
  data: { fileIds }
})

// ==================== 链接分享 ====================

export const getMyShares = () => request({ url: '/api/shares', method: 'get' })
export const createShare = data => request({ url: '/api/shares', method: 'post', data })
export const revokeShare = shareId => request({ url: `/api/shares/${shareId}`, method: 'delete' })
export const accessPublicShare = (shareCode, password = '') => request({
  url: `/api/public/shares/${encodeURIComponent(shareCode)}/access`,
  method: 'post',
  data: { password }
})
/** Upload binary data directly to MinIO. The URL already carries its S3 signature. */
export const uploadMultipartPart = (url, blob, contentType, onUploadProgress, signal) => axios.put(url, blob, {
  headers: { 'Content-Type': contentType || 'application/octet-stream' },
  onUploadProgress,
  signal
})
