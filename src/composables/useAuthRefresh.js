import { useUserStore } from '@/stores/user.js'
import { ElMessage } from 'element-plus'

/**
 * 用户状态刷新钩子
 * 在更新操作后自动刷新用户登录状态和信息
 */
export function useAuthRefresh() {
  const userStore = useUserStore()

  /**
   * 刷新用户状态
   * 在任何更新操作后调用此方法来同步最新的用户信息
   * @param {Object} options - 配置选项
   * @param {boolean} options.silent - 是否静默刷新（不显示错误消息）
   * @param {boolean} options.showSuccess - 是否显示成功消息
   * @returns {Promise<Object|null>} 返回更新后的用户信息，失败返回null
   */
  const refreshAuth = async (options = {}) => {
    const { silent = true, showSuccess = false } = options

    try {
      // 刷新用户信息
      const userInfo = await userStore.refreshUserInfo()
      
      if (showSuccess) {
        ElMessage.success('用户状态已更新')
      }
      
      return userInfo
    } catch (error) {
      console.error('刷新用户状态失败:', error)
      
      if (!silent) {
        ElMessage.error('刷新用户状态失败')
      }
      
      return null
    }
  }

  /**
   * 包装操作函数，在操作成功或失败后都自动刷新用户状态
   * @param {Function} operation - 要执行的操作函数
   * @param {Object} options - 刷新选项
   * @param {boolean} options.refreshOnError - 操作失败时是否也刷新，默认true
   * @returns {Function} 包装后的函数
   */
  const withAuthRefresh = (operation, options = {}) => {
    const { refreshOnError = true, ...refreshOptions } = options
    
    return async (...args) => {
      try {
        // 执行原操作
        const result = await operation(...args)
        
        // 操作成功后刷新用户状态
        await refreshAuth(refreshOptions)
        
        return result
      } catch (error) {
        // 操作失败时也刷新用户状态（如果配置了refreshOnError）
        if (refreshOnError) {
          await refreshAuth(refreshOptions)
        }
        
        // 继续抛出错误
        throw error
      }
    }
  }

  /**
   * 检查并刷新登录状态
   * 用于验证当前token是否仍然有效
   * @returns {Promise<boolean>} token是否有效
   */
  const checkAndRefreshAuth = async () => {
    try {
      const isValid = await userStore.checkAuthStatus()
      
      if (isValid) {
        // 如果token有效，刷新用户信息
        await userStore.refreshUserInfo()
      }
      
      return isValid
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  /**
   * 登录后初始化用户信息
   * 在登录成功设置token后，调用此方法获取完整的用户信息
   * @param {Object} loginResponse - 登录接口返回的令牌与用户信息
   * @returns {Promise<Object|null>} 返回用户信息，失败返回null
   */
  const initUserInfoAfterLogin = async (loginResponse) => {
    try {
      userStore.setToken(loginResponse.accessToken, loginResponse.expiresIn)
      userStore.setRefreshToken(loginResponse.refreshToken)
      
      // 调用 /api/auth/userinfo 获取完整用户信息
      const userInfo = await userStore.refreshUserInfo()
      
      console.log('✅ 登录后用户信息初始化成功')
      return userInfo
    } catch (error) {
      console.error('初始化用户信息失败:', error)
      // 如果获取用户信息失败，清除token
      userStore.clearAuth()
      throw error
    }
  }

  return {
    refreshAuth,
    withAuthRefresh,
    checkAndRefreshAuth,
    initUserInfoAfterLogin
  }
}
