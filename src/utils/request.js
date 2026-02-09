import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user.js'

// 需要在请求成功后刷新用户状态的 API 路径
const REFRESH_AUTH_PATHS = [
  '/files/upload',
  '/files/delete',
  '/files/move',
  '/api/users/profile',
  '/api/users/avatar',
  '/api/auth/oauth2/bindings'
]

// 创建 axios 实例
const request = axios.create({
  baseURL: '', // 使用相对路径，由API文件指定完整路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    const token = userStore.getToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  async response => {
    const resData = response.data
    
    // 如果响应是 blob 类型（如文件下载），直接返回
    if (response.config.responseType === 'blob') {
      return resData
    }
    
    let result = resData
    
    // 标准 JSON 响应格式: { code, message, data, timestamp }
    if (resData && typeof resData === 'object' && 'code' in resData) {
      const { code, message, data } = resData
      
      if (code === 200 || code === 0 || code === 201) {
        result = data
      } else {
        // 业务逻辑错误，不弹全局消息（让调用方处理）
        const error = new Error(message || '请求失败')
        error.code = code
        error.data = data
        error.response = response
        return Promise.reject(error)
      }
    }
    
    // 检查是否需要刷新用户状态
    const requestUrl = response.config.url || ''
    const needsRefresh = REFRESH_AUTH_PATHS.some(path => 
      requestUrl.includes(path)
    )
    
    // 如果需要刷新且请求方法是修改类操作（POST, PUT, DELETE, PATCH）
    const isModifyingRequest = ['post', 'put', 'delete', 'patch'].includes(
      response.config.method?.toLowerCase() || ''
    )
    
    if (needsRefresh && isModifyingRequest) {
      try {
        const userStore = useUserStore()
        // 静默刷新用户信息，不影响当前请求的返回
        await userStore.refreshUserInfo()
        console.log('🔄 用户状态已自动刷新')
      } catch (error) {
        // 刷新失败不影响主请求
        console.warn('自动刷新用户状态失败:', error)
      }
    }
    
    return result
  },
  error => {
    console.error('响应错误:', error)
    
    // 检查是否是CORS错误
    if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
      ElMessage.error('网络请求失败，请检查后端服务是否运行')
      return Promise.reject(error)
    }
    
    if (error.response) {
      const { status, data } = error.response
      
      // 后端返回的业务错误（如 401 带 JSON body）
      if (data && typeof data === 'object' && 'code' in data) {
        const bizError = new Error(data.message || '请求失败')
        bizError.code = data.code
        bizError.data = data.data
        bizError.status = status
        bizError.response = error.response
        
        // 401 未授权 - 清除登录状态
        if (status === 401) {
          const userStore = useUserStore()
          userStore.clearAuth()
        }
        
        return Promise.reject(bizError)
      }
      
      // 非 JSON 错误响应
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          {
            const userStore = useUserStore()
            userStore.clearAuth()
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求地址不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default request