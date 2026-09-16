import request from '@/utils/request.js'

// ====== 存储桶管理 ======

// 创建存储桶
export const createBucket = (data) => {
  return request({
    url: '/api/storage-buckets',
    method: 'post',
    data
  })
}

// 分页查询存储桶
export const getBuckets = (params) => {
  return request({
    url: '/api/storage-buckets',
    method: 'get',
    params
  })
}

// 获取我的存储桶
export const getMyBuckets = () => {
  return request({
    url: '/api/storage-buckets/my',
    method: 'get'
  })
}

// 获取默认存储桶
export const getDefaultBucket = () => {
  return request({
    url: '/api/storage-buckets/default',
    method: 'get'
  })
}

/**
 * 获取存储桶详情
 * @param {string} bucketId - 存储桶ID（雪花ID，必须为字符串）
 * @returns {Promise} - 存储桶详情对象
 */
export const getBucketDetail = (bucketId) => {
  return request({
    url: `/api/storage-buckets/${bucketId}`,
    method: 'get'
  })
}

/**
 * 更新存储桶
 * @param {string} bucketId - 存储桶ID（雪花ID，必须为字符串）
 * @param {Object} data - 更新数据
 * @returns {Promise} - 更新结果
 */
export const updateBucket = (bucketId, data) => {
  return request({
    url: `/api/storage-buckets/${bucketId}`,
    method: 'put',
    data
  })
}

/**
 * 删除存储桶
 * @param {string} bucketId - 存储桶ID（雪花ID，必须为字符串）
 * @returns {Promise} - 删除结果
 */
export const deleteBucket = (bucketId) => {
  return request({
    url: `/api/storage-buckets/${bucketId}`,
    method: 'delete'
  })
}

/**
 * 设置默认存储桶
 * @param {string} bucketId - 存储桶ID（雪花ID，必须为字符串）
 * @returns {Promise} - 设置结果
 */
export const setDefaultBucket = (bucketId) => {
  return request({
    url: `/api/storage-buckets/${bucketId}/set-default`,
    method: 'post'
  })
}

// 检查存储桶名称可用性
export const checkBucketName = (bucketName) => {
  return request({
    url: '/api/storage-buckets/check-name',
    method: 'get',
    params: { bucketName }
  })
}

// 同步存储桶
export const syncBuckets = () => {
  return request({
    url: '/api/storage-buckets/sync',
    method: 'post'
  })
}

// ====== 用户管理 ======

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/api/users',
    method: 'post',
    data
  })
}

/**
 * 获取用户详情
 * @param {string} userId - 用户ID（雪花ID，必须为字符串）
 * @returns {Promise} - 用户详情对象
 */
export const getUserDetail = (userId) => {
  return request({
    url: `/api/users/${userId}`,
    method: 'get'
  })
}

/**
 * 更新用户
 * @param {string} userId - 用户ID（雪花ID，必须为字符串）
 * @param {Object} data - 更新数据
 * @returns {Promise} - 更新结果
 */
export const updateUser = (userId, data) => {
  return request({
    url: `/api/users/${userId}`,
    method: 'put',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/users/info',
    method: 'get'
  })
}