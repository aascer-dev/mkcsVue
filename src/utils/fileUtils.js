/**
 * 文件工具函数
 */

// 文件类型映射
export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  PDF: 'pdf',
  DOCUMENT: 'document',
  CODE: 'code',
  TEXT: 'text',
  ARCHIVE: 'archive',
  UNKNOWN: 'unknown'
}

// 图片格式
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff']
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff']

// 视频格式
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'm4v']
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime', 'video/x-msvideo']

// 音频格式
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']
const AUDIO_MIMES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/x-m4a']

// PDF格式
const PDF_EXTENSIONS = ['pdf']
const PDF_MIMES = ['application/pdf']

// 文档格式
const DOCUMENT_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp']
const DOCUMENT_MIMES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/rtf'
]

// 代码格式
const CODE_EXTENSIONS = [
  'js', 'jsx', 'ts', 'tsx', 'vue', 'html', 'css', 'scss', 'sass', 'less',
  'json', 'xml', 'yaml', 'yml', 'md', 'markdown',
  'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'rb', 'php',
  'sh', 'bash', 'sql', 'swift', 'kt', 'dart', 'r', 'scala', 'pl', 'lua'
]

// 文本格式
const TEXT_EXTENSIONS = ['txt', 'log', 'cfg', 'conf', 'ini', 'env', 'properties']

// 压缩格式
const ARCHIVE_EXTENSIONS = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso']

/**
 * 从文件名获取扩展名
 */
export const getFileExtension = (fileName) => {
  if (!fileName) return ''
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return ''
  return fileName.slice(lastDot + 1).toLowerCase()
}

/**
 * 判断文件类型
 */
export const getFileType = (fileName, mimeType = '') => {
  const ext = getFileExtension(fileName)
  const mime = mimeType.toLowerCase()

  // 优先根据MIME类型判断
  if (IMAGE_MIMES.some(m => mime.includes(m)) || IMAGE_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.IMAGE
  }
  if (VIDEO_MIMES.some(m => mime.includes(m)) || VIDEO_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.VIDEO
  }
  if (AUDIO_MIMES.some(m => mime.includes(m)) || AUDIO_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.AUDIO
  }
  if (PDF_MIMES.some(m => mime.includes(m)) || PDF_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.PDF
  }
  if (DOCUMENT_MIMES.some(m => mime.includes(m)) || DOCUMENT_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.DOCUMENT
  }
  if (CODE_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.CODE
  }
  if (TEXT_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.TEXT
  }
  if (ARCHIVE_EXTENSIONS.includes(ext)) {
    return FILE_TYPES.ARCHIVE
  }

  return FILE_TYPES.UNKNOWN
}

/**
 * 判断文件是否支持预览
 */
export const isPreviewSupported = (fileName, mimeType = '') => {
  const fileType = getFileType(fileName, mimeType)
  return [
    FILE_TYPES.IMAGE,
    FILE_TYPES.VIDEO,
    FILE_TYPES.AUDIO,
    FILE_TYPES.PDF,
    FILE_TYPES.CODE,
    FILE_TYPES.TEXT
  ].includes(fileType)
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  }
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
  // 其他
  return date.toLocaleDateString('zh-CN')
}

/**
 * 获取文件图标类名
 */
export const getFileIconClass = (fileName, mimeType = '') => {
  const fileType = getFileType(fileName, mimeType)
  const iconMap = {
    [FILE_TYPES.IMAGE]: 'Picture',
    [FILE_TYPES.VIDEO]: 'VideoPlay',
    [FILE_TYPES.AUDIO]: 'Headset',
    [FILE_TYPES.PDF]: 'Document',
    [FILE_TYPES.DOCUMENT]: 'Document',
    [FILE_TYPES.CODE]: 'Memo',
    [FILE_TYPES.TEXT]: 'Document',
    [FILE_TYPES.ARCHIVE]: 'FolderOpened',
    [FILE_TYPES.UNKNOWN]: 'Document'
  }
  return iconMap[fileType] || 'Document'
}

/**
 * 获取代码语言
 */
export const getCodeLanguage = (fileName) => {
  const ext = getFileExtension(fileName)
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'vue': 'vue',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'markdown': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'sh': 'bash',
    'bash': 'bash',
    'sql': 'sql',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'r': 'r',
    'scala': 'scala',
    'pl': 'perl',
    'lua': 'lua'
  }
  return languageMap[ext] || 'plaintext'
}

/**
 * 生成文件预览配置
 */
export const getPreviewConfig = (fileInfo) => {
  const { fileName, mimeType, fileSize } = fileInfo
  const fileType = getFileType(fileName, mimeType)
  
  return {
    type: fileType,
    supported: isPreviewSupported(fileName, mimeType),
    language: fileType === FILE_TYPES.CODE ? getCodeLanguage(fileName) : null,
    icon: getFileIconClass(fileName, mimeType),
    formattedSize: formatFileSize(fileSize),
    maxPreviewSize: 10 * 1024 * 1024, // 10MB
    canPreview: fileSize < 10 * 1024 * 1024 && isPreviewSupported(fileName, mimeType)
  }
}

/**
 * 验证文件URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 获取文件名（不含扩展名）
 */
export const getFileNameWithoutExt = (fileName) => {
  if (!fileName) return ''
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return fileName
  return fileName.slice(0, lastDot)
}

/**
 * 转义HTML
 */
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
