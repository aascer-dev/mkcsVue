/**
 * 工具函数集合
 */

// 格式化文件大小
export const formatFileSize = (bytes) => {
  // 处理 null, undefined, 非数字类型
  const num = Number(bytes)
  if (!Number.isFinite(num) || num < 0) return '0 B'
  if (num === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(num) / Math.log(k))
  
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 雪花 ID 工具函数
 * 由于雪花 ID 是 64 位长整型，超过 JavaScript 的 Number.MAX_SAFE_INTEGER
 * 必须使用字符串类型进行处理和比较
 */

/**
 * 将 ID 转换为字符串，处理 null/undefined
 * @param {string|number|null|undefined} id - ID 值
 * @returns {string|null} - 字符串形式的 ID 或 null
 */
export const toIdString = (id) => {
  if (id === null || id === undefined || id === '') {
    return null
  }
  return String(id)
}

/**
 * 比较两个 ID 是否相等
 * @param {string|number|null|undefined} id1 - 第一个 ID
 * @param {string|number|null|undefined} id2 - 第二个 ID
 * @returns {boolean} - 是否相等
 */
export const compareIds = (id1, id2) => {
  // 处理 null/undefined 情况
  if ((id1 === null || id1 === undefined) && (id2 === null || id2 === undefined)) {
    return true
  }
  if (id1 === null || id1 === undefined || id2 === null || id2 === undefined) {
    return false
  }
  return String(id1) === String(id2)
}

/**
 * 检查 ID 是否在数组中
 * @param {string|number} id - 要检查的 ID
 * @param {Array} idArray - ID 数组
 * @returns {boolean} - 是否存在
 */
export const idInArray = (id, idArray) => {
  if (!Array.isArray(idArray)) return false
  const idStr = toIdString(id)
  if (idStr === null) return false
  return idArray.some(item => compareIds(item, idStr))
}

/**
 * 从数组中查找对象（根据 ID）
 * @param {Array} array - 对象数组
 * @param {string|number} id - 要查找的 ID
 * @param {string} idKey - ID 字段名，默认为 'id'
 * @returns {object|undefined} - 找到的对象或 undefined
 */
export const findById = (array, id, idKey = 'id') => {
  if (!Array.isArray(array)) return undefined
  const idStr = toIdString(id)
  if (idStr === null) return undefined
  return array.find(item => compareIds(item[idKey], idStr))
}

/**
 * 从数组中移除对象（根据 ID）
 * @param {Array} array - 对象数组
 * @param {string|number} id - 要移除的 ID
 * @param {string} idKey - ID 字段名，默认为 'id'
 * @returns {Array} - 新数组
 */
export const removeById = (array, id, idKey = 'id') => {
  if (!Array.isArray(array)) return []
  const idStr = toIdString(id)
  if (idStr === null) return array
  return array.filter(item => !compareIds(item[idKey], idStr))
}

// 格式化时间
export const formatTime = (dateString, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// 相对时间格式化（几分钟前、几小时前等）
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-'
  
  const now = new Date()
  const date = new Date(dateString)
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes}分钟前`
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours}小时前`
  } else if (diff < week) {
    const days = Math.floor(diff / day)
    return `${days}天前`
  } else if (diff < month) {
    const weeks = Math.floor(diff / week)
    return `${weeks}周前`
  } else if (diff < year) {
    const months = Math.floor(diff / month)
    return `${months}个月前`
  } else {
    const years = Math.floor(diff / year)
    return `${years}年前`
  }
}

// 获取文件扩展名
export const getFileExtension = (filename) => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// 根据文件扩展名获取文件类型
export const getFileType = (filename) => {
  const ext = getFileExtension(filename)
  
  const typeMap = {
    // 图片
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    svg: 'image',
    webp: 'image',
    
    // 文档
    pdf: 'document',
    doc: 'document',
    docx: 'document',
    xls: 'document',
    xlsx: 'document',
    ppt: 'document',
    pptx: 'document',
    txt: 'document',
    
    // 压缩文件
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    tar: 'archive',
    gz: 'archive',
    
    // 音频
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio',
    m4a: 'audio',
    
    // 视频
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    mkv: 'video',
    
    // 代码
    js: 'code',
    ts: 'code',
    vue: 'code',
    html: 'code',
    css: 'code',
    json: 'code',
    md: 'code',
    py: 'code',
    java: 'code',
    cpp: 'code',
    c: 'code'
  }
  
  return typeMap[ext] || 'unknown'
}

// 防抖函数
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function (...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

// 节流函数
export const throttle = (func, wait, options = {}) => {
  let timeout, context, args, result
  let previous = 0
  if (!options) options = {}
  
  const later = () => {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  
  return function (...argumentsArray) {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = argumentsArray
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const cloned = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
}

// 生成随机字符串
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 验证邮箱格式
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证用户名格式
export const isValidUsername = (username) => {
  // 3-32个字符，只能包含字母、数字、下划线和短横线
  const usernameRegex = /^[a-zA-Z0-9_-]{3,32}$/
  return usernameRegex.test(username)
}

// 验证密码强度
export const validatePasswordStrength = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  let score = 0
  let feedback = []
  
  if (password.length < minLength) {
    feedback.push(`密码至少需要${minLength}个字符`)
  } else {
    score += 1
  }
  
  if (hasUpperCase) score += 1
  else feedback.push('建议包含大写字母')
  
  if (hasLowerCase) score += 1
  else feedback.push('建议包含小写字母')
  
  if (hasNumbers) score += 1
  else feedback.push('建议包含数字')
  
  if (hasSpecialChar) score += 1
  else feedback.push('建议包含特殊字符')
  
  let strength = 'weak'
  if (score >= 4) strength = 'strong'
  else if (score >= 2) strength = 'medium'
  
  return {
    score,
    strength,
    feedback,
    isValid: password.length >= minLength
  }
}

// 本地存储工具
export const storage = {
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('Failed to get from localStorage:', error)
      return defaultValue
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Failed to set to localStorage:', error)
      return false
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
      return false
    }
  },
  
  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }
}