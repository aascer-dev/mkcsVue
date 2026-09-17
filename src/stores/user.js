import { defineStore } from 'pinia'
import { logout as logoutApi, refreshToken, checkLoginStatus } from '@/api/auth.js'
import { getUserInfo } from '@/api/user.js'

const addAvatarVersion = (userInfo) => {
  const avatarUrl = userInfo?.avatarUrl
  if (!avatarUrl || avatarUrl.startsWith('blob:')) return userInfo

  const separator = avatarUrl.includes('?') ? '&' : '?'
  return {
    ...userInfo,
    avatarUrl: `${avatarUrl}${separator}avatarVersion=${Date.now()}`
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    isLoggedIn: !!localStorage.getItem('token'),
    loginTime: localStorage.getItem('loginTime') || null,
    tokenExpireTime: localStorage.getItem('tokenExpireTime') || null,
    myBuckets: [],
    // 计算得出的存储空间
    calculatedTotalStorage: 0,
    calculatedUsedStorage: 0
  }),

  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
    currentBucketId: (state) => state.userInfo?.currentBucketId || null,
    userRoles: (state) => state.userInfo?.roles || [],
    userPermissions: (state) => state.userInfo?.permissions || [],
    // 用户存储信息 - 优先使用计算值，其次使用API返回值
    totalStorage: (state) => {
      if (state.calculatedTotalStorage > 0) {
        return Number(state.calculatedTotalStorage) || 0
      }
      return state.userInfo?.totalStorage ? Number(state.userInfo.totalStorage) : 0
    },
    usedStorage: (state) => {
      if (state.calculatedTotalStorage > 0) {
        // 如果有计算的总存储，使用计算的已使用存储
        return Number(state.calculatedUsedStorage) || 0
      }
      return state.userInfo?.usedStorage ? Number(state.userInfo.usedStorage) : 0
    },
    storagePercentage: (state) => {
      let total = 0
      let used = 0
      if (state.calculatedTotalStorage > 0) {
        total = Number(state.calculatedTotalStorage) || 0
        used = Number(state.calculatedUsedStorage) || 0
      } else {
        total = state.userInfo?.totalStorage ? Number(state.userInfo.totalStorage) : 0
        used = state.userInfo?.usedStorage ? Number(state.userInfo.usedStorage) : 0
      }
      if (!total || total <= 0 || isNaN(total)) return 0
      const percentage = Math.round((used / total) * 100)
      return isNaN(percentage) ? 0 : Math.min(Math.max(percentage, 0), 100)
    },
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
      this.userInfo = addAvatarVersion(userInfo)
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    updateCurrentBucket(bucketId) {
      if (this.userInfo) {
        this.userInfo.currentBucketId = bucketId
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },

    // 设置我的存储桶并计算存储空间
    setMyBuckets(buckets) {
      this.myBuckets = buckets
      this.calculateStorageSpace(buckets)
    },

    // 计算总存储空间和已使用空间
    calculateStorageSpace(buckets) {
      if (!Array.isArray(buckets) || buckets.length === 0) {
        this.calculatedTotalStorage = 0
        this.calculatedUsedStorage = 0
        return
      }

      // 过滤出自己创建的存储桶（不是共享的）- 只计算自己的
      const ownBuckets = buckets.filter(bucket => !bucket.bucketType || bucket.bucketType === 0)

      let totalStorage = 0
      let usedStorage = 0

      ownBuckets.forEach(bucket => {
        if (bucket.totalStorage) {
          totalStorage += Number(bucket.totalStorage)
        }
        if (bucket.usedStorage) {
          usedStorage += Number(bucket.usedStorage)
        }
      })

      this.calculatedTotalStorage = totalStorage
      this.calculatedUsedStorage = usedStorage
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
        const result = await refreshToken(this.refreshToken)
        this.setToken(result.accessToken, result.expiresIn)
        this.setRefreshToken(result.refreshToken)
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
        await logoutApi(this.refreshToken)
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

          // Each protected-page entry synchronizes profile data from the server.
          // This makes avatar, nickname, and account changes visible immediately.
          await this.refreshUserInfo()

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
