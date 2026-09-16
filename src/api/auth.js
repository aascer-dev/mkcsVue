import request from '@/utils/request.js'

// 用户登录
export const login = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

// 用户注册
export const register = (data) => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

// 检查用户名可用性
export const checkUsernameAvailability = (username, excludeUserId = null) => {
  return request({
    url: `/api/auth/usernames/${encodeURIComponent(username)}/availability`,
    method: 'get',
    params: excludeUserId ? { excludeUserId } : {}
  })
}

// 检查邮箱可用性
export const checkEmailAvailability = (email, excludeUserId = null) => {
  return request({
    url: `/api/auth/emails/${encodeURIComponent(email)}/availability`,
    method: 'get',
    params: excludeUserId ? { excludeUserId } : {}
  })
}

// 批量检查用户名或邮箱可用性
export const checkAvailability = (params) => {
  return request({
    url: '/api/auth/check-availability',
    method: 'get',
    params
  })
}

// 发送邮箱验证码
export const sendVerificationCode = (email, type = 'REGISTER') => {
  return request({
    url: '/api/auth/verification-code/send',
    method: 'post',
    data: { email, type }
  })
}

// 忘记密码：重置密码（兼容@RequestBody与表单/参数绑定）
export const resetPassword = (data = {}) => {
  const payload = {
    email: data.email,
    code: data.code,
    password: data.password ?? data.newPassword,
    verificationCodeType: data.verificationCodeType
  }

  return request({
    url: '/api/auth/reset-password',
    method: 'post',
    data: payload,
    params: payload
  })
}

// 验证邮箱验证码
export const verifyCode = (email, code, type = 'REGISTER') => {
  return request({
    url: '/api/auth/verification-code/verify',
    method: 'post',
    data: { email, code, type }
  })
}

// 检查验证码冷却状态
export const getVerificationCooldown = (email, type) => {
  return request({
    url: '/api/auth/verification-code/cooldown',
    method: 'get',
    params: { email, type }
  })
}

// 检查登录状态
export const checkLoginStatus = () => {
  return request({
    url: '/api/auth/check',
    method: 'get'
  })
}

// 刷新Token
export const refreshToken = () => {
  return request({
    url: '/api/auth/refresh',
    method: 'post'
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

// ====== OAuth2 相关接口 ======

// 获取GitHub OAuth2授权URL
export const getGithubOAuthUrl = (state) => {
  return request({
    url: '/api/auth/oauth2/github/authorize',
    method: 'get',
    params: state ? { state } : {}
  })
}

// GitHub OAuth2回调处理（登录或注册）
export const githubOAuthCallback = (code, state, rememberMe = false) => {
  return request({
    url: '/api/auth/oauth2/github/callback',
    method: 'post',
    data: { code, state, rememberMe }
  })
}

// 兼容旧API名称
export const githubOAuthLogin = githubOAuthCallback

// ====== OAuth2 增强功能接口 ======

/**
 * 发送OAuth2邮箱验证码
 * @param {string} tempUserId - 临时用户ID
 * @param {string} email - 邮箱地址
 */
export const sendOAuth2VerificationCode = (tempUserId, email) => {
  return request({
    url: '/api/auth/oauth2/send-verification-code',
    method: 'post',
    params: { tempUserId, email }
  })
}

/**
 * 验证OAuth2邮箱
 * @param {string} tempUserId - 临时用户ID
 * @param {string} email - 邮箱地址
 * @param {string} code - 验证码（GitHub邮箱可选）
 * @param {boolean} isGitHubEmail - 是否为GitHub邮箱
 */
export const verifyOAuth2Email = (tempUserId, email, code = null, isGitHubEmail = false) => {
  const queryParams = { tempUserId, email }
  if (code) queryParams.code = code
  if (isGitHubEmail) queryParams.isGitHubEmail = true
  return request({
    url: '/api/auth/oauth2/verify-email',
    method: 'post',
    params: queryParams
  })
}

/**
 * 完成OAuth2注册
 * @param {string} tempUserId - 临时用户ID
 * @param {string} username - 用户名
 * @param {boolean} rememberMe - 是否记住登录
 */
export const completeOAuth2Registration = (tempUserId, username, rememberMe = false) => {
  return request({
    url: '/api/auth/oauth2/complete-registration',
    method: 'post',
    params: { tempUserId, username, rememberMe }
  })
}

/**
 * 发起OAuth2账号合并
 * @param {string} tempUserId - 临时用户ID  
 * @param {string} email - 冲突的邮箱地址
 */
export const initiateOAuth2Merge = (tempUserId, email) => {
  return request({
    url: '/api/auth/oauth2/initiate-merge',
    method: 'post',
    params: { tempUserId, email }
  })
}

/**
 * 完成OAuth2账号合并
 * @param {string} tempUserId - 临时用户ID
 * @param {string} existingUserId - 现有用户ID
 * @param {boolean} rememberMe - 是否记住登录
 */
export const completeOAuth2Merge = (tempUserId, existingUserId, rememberMe = false) => {
  return request({
    url: '/api/auth/oauth2/complete-merge',
    method: 'post',
    params: { tempUserId, existingUserId, rememberMe }
  })
}

/**
 * 检查OAuth2用户名可用性
 * @param {string} username - 用户名
 */
export const checkOAuth2UsernameAvailability = (username) => {
  return checkUsernameAvailability(username)
}

// ====== 用户设置相关接口 ======

/**
 * 上传用户头像（文件上传）
 * @param {string} userId - 用户ID（雪花ID，必须为字符串）
 * @param {File} file - 头像文件
 * @returns {Promise} - 上传结果，包含头像URL
 */
export const uploadUserAvatar = (userId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: `/api/users/${userId}/avatar`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 更新当前用户信息（昵称、邮箱、头像URL等）
 * @param {Object} data - 用户信息更新数据
 * @param {string} [data.nickname] - 昵称
 * @param {string} [data.email] - 邮箱
 * @param {string} [data.avatarUrl] - 头像URL
 * @param {string} [data.currentBucketId] - 当前存储桶ID（雪花ID，必须为字符串）
 * @returns {Promise} - 更新结果
 */
export const updateUserProfile = (data) => {
  return request({
    url: '/api/users/profile',
    method: 'put',
    data
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码修改数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 */
export const changePassword = (data) => {
  return request({
    url: '/api/auth/change-password',
    method: 'post',
    data
  })
}

/**
 * 获取OAuth2绑定列表
 */
export const getOAuthBindings = () => {
  return request({
    url: '/api/auth/oauth2/bindings',
    method: 'get'
  })
}

/**
 * 解除OAuth2绑定
 * @param {string} provider - 平台标识（github、google等）
 */
export const unbindOAuthProvider = (provider) => {
  return request({
    url: `/api/auth/oauth2/bindings/${provider}`,
    method: 'delete'
  })
}

