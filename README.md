# CloudDrive - 云端存储管理系统

一个基于Vue 3 + Element Plus的现代化云端存储管理系统，支持用户注册登录、文件管理、存储桶管理等功能。

## ✨ 功能特性

### 🔐 认证系统
- **用户注册** - 支持邮箱验证注册
- **用户登录** - 支持用户名/邮箱登录，记住我功能
- **OAuth登录** - 支持GitHub OAuth授权登录
- **密码安全** - 密码强度验证，安全存储
- **Token管理** - JWT token自动刷新，登录状态维护

### 👤 用户管理
- **用户信息** - 完整的用户资料管理
- **权限控制** - 基于角色的权限管理
- **头像支持** - 用户头像上传和显示
- **账户设置** - 用户偏好设置

### 🗂️ 存储桶管理
- **创建存储桶** - 支持创建私有/共享存储桶
- **存储桶列表** - 分页查询，搜索过滤
- **容量管理** - 存储配额监控和管理
- **权限设置** - 存储桶访问权限控制

### 📁 文件管理
- **文件上传** - 拖拽上传，进度显示
- **文件预览** - 支持图片、文档预览
- **文件组织** - 文件夹管理，路径导航
- **批量操作** - 批量删除、移动、复制

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - Vue 3组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP客户端
- **Vite** - 构建工具

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **unplugin-auto-import** - 自动导入
- **unplugin-vue-components** - 组件自动注册

## 📦 项目结构

```
src/
├── api/                    # API接口
│   ├── auth.js            # 认证相关API
│   ├── file.js            # 文件管理API
│   └── user.js            # 用户管理API
├── assets/                # 静态资源
├── components/            # 通用组件
│   ├── HelloWorld.vue     # 示例组件
│   └── OAuthLogin.vue     # OAuth登录组件
├── config/                # 配置文件
│   └── api.js            # API配置
├── layouts/              # 布局组件
│   └── MainLayout.vue    # 主布局
├── router/               # 路由配置
│   └── index.js         # 路由定义
├── stores/               # Pinia状态管理
│   ├── file.js          # 文件状态
│   └── user.js          # 用户状态
├── utils/                # 工具函数
│   ├── index.js         # 通用工具
│   └── request.js       # HTTP请求封装
├── views/                # 页面组件
│   ├── FileManager.vue   # 文件管理页面
│   ├── Home.vue         # 首页
│   ├── Landing.vue      # 着陆页
│   ├── Login.vue        # 登录注册页面
│   └── OAuthCallback.vue # OAuth回调页面
├── App.vue              # 根组件
├── main.js             # 应用入口
└── style.css           # 全局样式
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发运行
```bash
npm run dev
# 或
yarn dev
```

### 生产构建
```bash
npm run build
# 或
yarn build
```

## 🔧 配置说明

### API配置
在 `src/config/api.js` 中配置API相关设置：
- BASE_URL：后端API地址
- 文件上传限制
- 支持的文件类型
- 错误码映射

### 开发代理
在 `vite.config.js` 中配置开发环境代理：
```javascript
server: {
  proxy: {
    '/api': {
      target: env.API_PROXY_TARGET || 'http://127.0.0.1:8080',
      changeOrigin: true
    },
    '/avatar': {
      target: env.MINIO_PROXY_TARGET || 'http://127.0.0.1:9000',
      changeOrigin: true
    }
  }
}
```

### 环境变量
创建 `.env.local` 文件配置本地环境变量：
```
VITE_API_BASE_URL=
API_PROXY_TARGET=http://127.0.0.1:8080
MINIO_PROXY_TARGET=http://127.0.0.1:9000
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

生产环境 API 使用相对路径。外层网关及 `deploy/nginx.conf` 提供 `/api/` 和 `/avatar/` 代理，容器内目标分别为 `backend:8080` 与 `minio:9000`。后端 `MKCS_MINIO_PUBLIC_ENDPOINT` 填写浏览器可访问的 origin，不能填写 `http://minio:9000`。头像 URL 的 `avatarVersion` 会替换已有值，S3 签名 URL 保持原样。

## 📝 API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/userinfo` - 获取用户信息
- `POST /api/auth/refresh` - 刷新Token

### 验证码接口
- `POST /api/auth/verification-code/send` - 发送验证码
- `POST /api/auth/verification-code/verify` - 验证验证码
- `GET /api/auth/verification-code/cooldown` - 检查冷却状态

### OAuth接口
- `GET /api/auth/oauth/github/url` - 获取GitHub授权URL
- `POST /api/auth/oauth/github/login` - GitHub登录

### 存储桶接口
- `POST /api/storage-buckets` - 创建存储桶
- `GET /api/storage-buckets` - 获取存储桶列表
- `GET /api/storage-buckets/my` - 获取我的存储桶
- `GET /api/storage-buckets/default` - 获取默认存储桶

## 🎨 UI设计

### 设计原则
- **现代化** - 采用现代设计语言，简洁美观
- **响应式** - 适配各种设备屏幕
- **一致性** - 保持整体设计风格统一
- **易用性** - 注重用户体验，操作直观

### 色彩方案
- **主色调** - 渐变绿色系 (#4ade80 - #06b6d4)
- **辅助色** - 中性色系配色
- **状态色** - 成功/警告/错误状态色

### 组件样式
- **卡片** - 圆角设计，阴影效果
- **按钮** - 悬停效果，渐变背景
- **表单** - 圆角输入框，清晰标识

## 🔒 安全特性

### 认证安全
- JWT Token认证
- 刷新Token机制
- OAuth授权登录
- CSRF防护

### 数据安全
- 密码强度验证
- 敏感数据加密
- XSS防护
- HTTPS传输

## 🚧 开发指南

### 代码规范
- 使用ESLint和Prettier保证代码质量
- 遵循Vue 3 Composition API规范
- 组件命名采用PascalCase
- 文件命名采用kebab-case

### 提交规范
- feat: 新功能
- fix: 错误修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试相关

### 组件开发
- 使用`<script setup>`语法
- 合理使用响应式API
- 注意性能优化
- 编写清晰的注释

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📧 联系

如有问题，请通过Issue联系我们。
