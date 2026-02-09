import { defineStore } from 'pinia'
import { logout as logoutApi, getUserInfo, refreshToken, checkLoginStatus } from '@/api/auth.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    isLoggedIn: !!localStorage.getItem('token'),
    loginTime: localStorage.getItem('loginTime') || null,
    tokenExpireTime: localStorage.getItem('tokenExpireTime') || null
  }),
  
  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
    currentBucketId: (state) => state.userInfo?.currentBucketId || null,
    userRoles: (state) => state.userInfo?.roles || [],
    userPermissions: (state) => state.userInfo?.permissions || [],
    isTokenExpired: (state) => {
      if (!state.tokenExpireTime) return false
      return Date.now() > parseInt(state.tokenExpireTime)
    },
    hasRole: (state) => (role) => {
      return state.userInfo?.roles?.includes(role) || false
    },
    hasPermission: (state) => (permission) => {
      return state.userInfo?.permissions?.includes(permission) || false
    }
  },
  
  actions: {
    setToken(token, expiresIn = null) {
      this.token = token
      this.isLoggedIn = true
      this.loginTime = Date.now().toString()
      
      localStorage.setItem('token', token)
      localStorage.setItem('loginTime', this.loginTime)
      
      if (expiresIn) {
        this.tokenExpireTime = (Date.now() + expiresIn * 1000).toString()
        localStorage.setItem('tokenExpireTime', this.tokenExpireTime)
      }
    },
    
    setRefreshToken(refreshToken) {
      this.refreshToken = refreshToken
      localStorage.setItem('refreshToken', refreshToken)
    },
    
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    
    updateCurrentBucket(bucketId) {
      if (this.userInfo) {
        this.userInfo.currentBucketId = bucketId
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },
    
    // 刷新用户信息
    async refreshUserInfo() {
      try {
        const userInfo = await getUserInfo()
        this.setUserInfo(userInfo)
        return userInfo
      } catch (error) {
        console.error('刷新用户信息失败:', error)
        throw error
      }
    },
    
    // 刷新Token
    async refreshAuthToken() {
      try {
        const result = await refreshToken()
        this.setToken(result.token, result.expiresIn)
        return result
      } catch (error) {
        console.error('刷新Token失败:', error)
        // 刷新失败，清除本地状态
        this.clearAuth()
        throw error
      }
    },
    
    // 检查登录状态
    async checkAuthStatus() {
      try {
        const result = await checkLoginStatus()
        return result
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.clearAuth()
        return false
      }
    },
    
    // 清除认证信息
    clearAuth() {
      this.token = ''
      this.refreshToken = ''
      this.userInfo = null
      this.isLoggedIn = false
      this.loginTime = null
      this.tokenExpireTime = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('loginTime')
      localStorage.removeItem('tokenExpireTime')
    },
    
    // 退出登录
    async logout() {
      try {
        // 调用后端 API 删除服务器端 token
        await logoutApi()
      } catch (error) {
        console.error('退出登录请求失败:', error)
      } finally {
        // 无论请求成功与否，都清除本地状态
        this.clearAuth()
      }
    },
    
    // 初始化：测试token有效性
    async initialize() {
      if (this.token) {
        try {
          // 检查token是否过期
          if (this.isTokenExpired) {
            // 尝试刷新token
            if (this.refreshToken) {
              await this.refreshAuthToken()
            } else {
              this.clearAuth()
              return false
            }
          }
          
          // 验证token有效性
          await this.checkAuthStatus()
          
          // 获取最新用户信息
          if (!this.userInfo) {
            await this.refreshUserInfo()
          }
          
          return true
        } catch (error) {
          this.clearAuth()
          return false
        }
      }
      return false
    }
  }
})