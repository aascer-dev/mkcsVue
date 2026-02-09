# 文件预览系统使用指南

## 功能特性

### 支持的文件类型

1. **图片预览** - jpg, jpeg, png, gif, webp, svg等
   - 缩放、旋转
   - 拖拽移动
   - 鼠标滚轮缩放

2. **视频预览** - mp4, webm, ogg, avi等
   - HTML5原生播放器
   - 播放控制

3. **音频预览** - mp3, wav, ogg, aac等
   - 音频播放控件
   - 精美UI设计

4. **PDF预览** - pdf文件
   - 内嵌iframe预览

5. **代码预览** - js, ts, vue, py, java等
   - 语法高亮（可扩展）
   - 代码复制功能
   - 支持40+语言

6. **文本预览** - txt, log, md等
   - 纯文本显示
   - 内容复制

## 快速开始

### 1. 在组件中使用

```vue
<template>
  <div>
    <!-- 文件列表 -->
    <div v-for="file in files" :key="file.id">
      <span>{{ file.name }}</span>
      <el-button @click="handlePreview(file.id)">预览</el-button>
    </div>

    <!-- 预览组件 -->
    <FilePreview
      v-model="previewVisible"
      :file-id="currentFileId"
      @closed="handlePreviewClosed"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FilePreview } from '@/components/FilePreview'

const files = ref([])
const previewVisible = ref(false)
const currentFileId = ref(null)

const handlePreview = (fileId) => {
  currentFileId.value = fileId
  previewVisible.value = true
}

const handlePreviewClosed = () => {
  console.log('预览已关闭')
}
</script>
```

### 2. 使用Store管理预览状态

```vue
<template>
  <div>
    <el-button @click="openPreview('file_123')">预览文件</el-button>

    <FilePreview
      v-model="previewStore.isPreviewVisible"
      :file-id="previewStore.currentFileId"
    />
  </div>
</template>

<script setup>
import { FilePreview } from '@/components/FilePreview'
import { useFilePreviewStore } from '@/stores/filePreview'

const previewStore = useFilePreviewStore()

const openPreview = (fileId) => {
  previewStore.openPreview(fileId)
}
</script>
```

## API接口

### 文件预览API

所有API都在 `@/api/file.js` 中定义：

```javascript
// 获取预览URL
import { getPreviewUrl } from '@/api/file.js'

const result = await getPreviewUrl('file_id', {
  expireMinutes: 30,      // URL有效期（分钟）
  operation: 'preview',   // 操作类型
  watermark: false,       // 是否添加水印
  quality: 'medium'       // 预览质量
})
```

```javascript
// 批量获取预览URL
import { getBatchPreviewUrls } from '@/api/file.js'

const result = await getBatchPreviewUrls(['file1', 'file2'], {
  expireMinutes: 30
})
```

```javascript
// 检查文件权限
import { checkFilePermission } from '@/api/file.js'

const result = await checkFilePermission('file_id', 'preview')
```

```javascript
// 获取文件信息
import { getFileInfo } from '@/api/file.js'

const fileInfo = await getFileInfo('file_id')
```

## 工具函数

所有工具函数都在 `@/utils/fileUtils.js` 中：

```javascript
import {
  getFileType,
  isPreviewSupported,
  formatFileSize,
  getFileExtension,
  getCodeLanguage
} from '@/utils/fileUtils'

// 判断文件类型
const fileType = getFileType('document.pdf', 'application/pdf')
// 返回: 'pdf'

// 判断是否支持预览
const canPreview = isPreviewSupported('image.jpg', 'image/jpeg')
// 返回: true

// 格式化文件大小
const size = formatFileSize(1024000)
// 返回: '1000 KB'

// 获取代码语言
const lang = getCodeLanguage('script.js')
// 返回: 'javascript'
```

## Store API

```javascript
import { useFilePreviewStore } from '@/stores/filePreview'

const previewStore = useFilePreviewStore()

// 打开预览
previewStore.openPreview('file_id')

// 关闭预览
previewStore.closePreview()

// 上一个文件
previewStore.previewPrevious()

// 下一个文件
previewStore.previewNext()

// 清空历史
previewStore.clearHistory()

// 访问状态
console.log(previewStore.isPreviewVisible)
console.log(previewStore.currentFileId)
console.log(previewStore.previewHistory)
```

## 组件Props

### FilePreview

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| modelValue | Boolean | 是 | 控制预览弹窗显示/隐藏 |
| fileId | String | 是 | 要预览的文件ID |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | Boolean | 弹窗状态变化 |
| closed | - | 预览关闭时触发 |

## 自定义配置

### 修改预览URL过期时间

在 `FilePreview.vue` 中修改：

```javascript
const urlRes = await getPreviewUrl(props.fileId, {
  expireMinutes: 60, // 改为60分钟
  operation: 'preview'
})
```

### 添加新的文件类型支持

1. 在 `fileUtils.js` 中添加文件类型定义
2. 创建对应的预览组件
3. 在 `FilePreview.vue` 的 `componentMap` 中注册

### 启用语法高亮

安装 highlight.js 或 prism.js：

```bash
npm install highlight.js
```

在 `CodePreview.vue` 中集成：

```javascript
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const highlightedCode = computed(() => {
  return hljs.highlight(props.fileContent, {
    language: language.value
  }).value
})
```

## 安全注意事项

1. **URL过期时间**: 默认30分钟，可根据需求调整
2. **权限验证**: 每次预览前都会调用权限检查API
3. **访问日志**: 自动记录所有预览操作
4. **敏感文件**: 可添加额外的验证步骤

## 性能优化

1. **预签名URL缓存**: URL在有效期内可复用
2. **文件大小限制**: 默认10MB，超过则不支持预览
3. **懒加载**: 预览组件使用动态导入
4. **内存管理**: 预览关闭后自动清理资源

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要的API:
- Fetch API
- Promise
- ES6语法
- CSS3特性（backdrop-filter等）

## 后续改进建议

1. 添加Office文档预览支持（doc, xls, ppt）
2. 集成PDF.js实现更强大的PDF预览
3. 添加文件对比功能
4. 支持多文件预览（画廊模式）
5. 添加预览水印功能
6. 实现在线编辑功能
