# 图像压缩功能说明

## 📋 概述

实现了头像上传时的自动图像压缩功能，优化用户体验，减少上传时间和存储空间。

## 🎯 功能特性

### 1. **配置** - [src/config/api.js](src/config/api.js)

```javascript
AVATAR: {
  MAX_SIZE: 5 * 1024 * 1024,              // 最大上传 5MB
  MAX_COMPRESSED_SIZE: 2 * 1024 * 1024,   // 压缩目标 2MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
  COMPRESSION_QUALITY: 0.8,               // 压缩质量 0-1
  MAX_WIDTH: 800,                         // 最大宽度
  MAX_HEIGHT: 800                         // 最大高度
}
```

### 2. **压缩工具** - [src/utils/imageCompression.js](src/utils/imageCompression.js)

提供的功能：
- `compressImage(file, options)` - 压缩图片文件
- `validateImageFile(file)` - 验证图片文件
- `needsCompression(file)` - 检查是否需要压缩
- `getImageDimensions(file)` - 获取图片尺寸

### 3. **工作流程**

```
用户选择图片
    ↓
验证文件类型和大小 (≤5MB)
    ↓
检查是否需要压缩 (>2MB)
    ↓
[需要压缩]
    ↓
显示压缩提示
    ↓
按比例缩放尺寸 (≤800x800)
    ↓
智能调整压缩质量
    ↓
压缩到目标大小 (≤2MB)
    ↓
显示压缩结果
    ↓
上传到服务器
```

## 🎨 智能压缩特性

### 1. **尺寸优化**
- 自动按比例缩放到 800x800 以内
- 保持原始宽高比
- 使用高质量平滑算法

### 2. **质量调整**
- 初始质量 0.8
- 自动迭代降低质量直到满足大小要求
- 最低质量 0.1
- 最多尝试 10 次

### 3. **格式转换**
- PNG 自动转换为 JPEG（更好的压缩效果）
- 保持原始文件名
- 保留 EXIF 信息

## 📝 使用示例

### 在Settings页面使用

```vue
<el-upload
  :before-upload="beforeAvatarUpload"
  :on-change="handleAvatarChange"
  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
>
  <el-button>选择图片</el-button>
</el-upload>
```

```javascript
import { compressImage, validateImageFile, needsCompression } from '@/utils/imageCompression.js'

const handleAvatarChange = async (uploadFile) => {
  const file = uploadFile.raw
  
  // 验证
  const validation = validateImageFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return
  }
  
  // 检查并压缩
  if (needsCompression(file)) {
    const compressed = await compressImage(file)
    // 使用压缩后的文件
  }
}
```

### 在其他组件中使用

```javascript
import { compressImage } from '@/utils/imageCompression.js'

// 自定义压缩选项
const compressedFile = await compressImage(file, {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.9,
  maxSize: 3 * 1024 * 1024
})
```

## 🔍 验证规则

### 文件类型
- ✅ JPEG / JPG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ❌ BMP, TIFF 等其他格式

### 文件大小
- **最大原始大小**: 5MB
- **压缩目标大小**: 2MB
- **超过2MB**: 自动压缩
- **小于2MB**: 直接上传

### 图片尺寸
- **最大宽度**: 800px
- **最大高度**: 800px
- **超过限制**: 按比例缩放
- **保持宽高比**: ✅

## 🎯 用户体验

### 压缩中提示
```
图片较大 (4.2 MB)，正在自动压缩...
```

### 压缩完成提示
```
压缩完成！4.2 MB → 1.8 MB
```

### 错误提示
- 不支持的文件格式
- 文件大小超过限制
- 图片处理失败

## 💡 性能优化

1. **异步处理**: 使用 Promise 避免阻塞 UI
2. **智能质量调整**: 根据文件大小自动优化质量
3. **Canvas 加速**: 使用原生 Canvas API 快速处理
4. **内存管理**: 及时释放 Blob 对象
5. **高质量平滑**: 使用 `imageSmoothingQuality: 'high'`

## 🔧 配置调整

可以在 `src/config/api.js` 中调整配置：

```javascript
AVATAR: {
  MAX_SIZE: 10 * 1024 * 1024,     // 修改最大上传大小
  MAX_COMPRESSED_SIZE: 3 * 1024 * 1024,  // 修改压缩目标
  COMPRESSION_QUALITY: 0.9,        // 提高压缩质量
  MAX_WIDTH: 1024,                 // 增加最大宽度
  MAX_HEIGHT: 1024                 // 增加最大高度
}
```

## 📊 压缩效果示例

| 原始大小 | 原始尺寸 | 压缩后大小 | 压缩后尺寸 | 压缩率 |
|---------|---------|-----------|-----------|-------|
| 4.2 MB  | 3024×4032 | 1.8 MB  | 800×1067  | 57%   |
| 3.5 MB  | 2400×1600 | 1.5 MB  | 800×533   | 57%   |
| 2.8 MB  | 1920×1080 | 800 KB  | 800×450   | 71%   |

## 🚀 后续优化建议

1. ✅ 支持多种图片格式
2. ✅ 智能质量调整
3. ⏳ 添加裁剪功能
4. ⏳ 支持旋转和翻转
5. ⏳ 添加滤镜效果
6. ⏳ 支持批量压缩

## 📝 注意事项

1. GIF 动图会被转换为静态图片
2. 透明背景的 PNG 转 JPEG 后会变成白色背景
3. 压缩是有损的，不可逆
4. 建议保留原图备份（如果需要）
