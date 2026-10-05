// API配置
export const API_CONFIG = {
  // 基础URL配置
  // Keep the default relative so the production Nginx reverse proxy owns the API origin.
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "",

  // API前缀
  API_PREFIX: "/api",

  // 超时时间
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT || 10000),

  // 上传文件大小限制 (100MB)
  MAX_UPLOAD_SIZE: 100 * 1024 * 1024,

  // 头像上传配置
  AVATAR: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_COMPRESSED_SIZE: 2 * 1024 * 1024, // 压缩后目标大小 2MB
    ALLOWED_TYPES: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ],
    COMPRESSION_QUALITY: 0.8, // 压缩质量 0-1
    MAX_WIDTH: 800, // 最大宽度
    MAX_HEIGHT: 800, // 最大高度
  },

  // 支持的文件类型
  SUPPORTED_FILE_TYPES: [
    // 图片
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // 文档
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // 压缩文件
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    // 文本
    "text/plain",
    "text/csv",
    "application/json",
    // 音频
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // 视频
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
  ],
};

// 错误码映射
export const ERROR_CODES = {
  // 认证相关
  401: "未授权，请重新登录",
  403: "拒绝访问，权限不足",

  // 客户端错误
  400: "请求参数错误",
  404: "请求的资源不存在",
  409: "资源冲突",
  422: "请求参数验证失败",

  // 服务器错误
  500: "服务器内部错误",
  502: "网关错误",
  503: "服务不可用",
  504: "网关超时",

  // 业务错误码（根据后端定义）
  2001: "用户名已存在",
  2002: "邮箱已被注册",
  2003: "验证码错误或已过期",
  2004: "用户名或密码错误",
  2005: "用户未登录",
  2006: "账户已被禁用",

  3001: "存储桶名称已存在",
  3002: "存储容量不足",
  3003: "文件不存在",
  3004: "文件已存在",
  3005: "文件大小超出限制",
};

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// 存储桶类型
export const BUCKET_TYPES = {
  PRIVATE: 0, // 个人私有
  SHARED: 1, // 团队/共享
};

// 用户状态
export const USER_STATUS = {
  DISABLED: 0, // 禁用
  NORMAL: 1, // 正常
};

// 存储桶状态
export const BUCKET_STATUS = {
  DISABLED: 0, // 禁用
  NORMAL: 1, // 正常
  READONLY: 2, // 只读
};

// OAuth提供商
export const OAUTH_PROVIDERS = {
  GITHUB: "github",
  GOOGLE: "google", // 预留
};

// 验证码类型
export const VERIFICATION_TYPES = {
  REGISTER: "REGISTER",
  RESET_PASSWORD: "RESET_PASSWORD",
  LOGIN: "LOGIN",
};
