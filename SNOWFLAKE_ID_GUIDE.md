# 雪花 ID 使用指南

## 快速参考

### ✅ 正确做法

```javascript
// 1. ID 比较
import { compareIds } from '@/utils/index.js'
if (compareIds(id1, id2)) { ... }

// 或直接使用 String()
if (String(id1) === String(id2)) { ... }

// 2. 数组操作
import { findById, removeById } from '@/utils/index.js'
const item = findById(array, id)
const newArray = removeById(array, id)

// 3. Vue 组件 Props
props: {
  fileId: {
    type: String,  // ✅ 使用 String
    required: true
  }
}

// 4. 模板中的比较
<el-tag v-if="String(bucket.id) === String(currentBucketId)">
```

### ❌ 错误做法

```javascript
// ❌ 不要直接比较
if (id1 === id2) { ... }

// ❌ 不要使用 Number 类型
props: {
  fileId: {
    type: Number,  // ❌ 错误
    required: true
  }
}

// ❌ 不要转换为数字
const numId = parseInt(id)  // ❌ 会丢失精度
```

## 为什么需要这样做？

雪花 ID 是 64 位长整型：
- 最大值：`9223372036854775807` (2^63 - 1)
- JavaScript 安全整数范围：`9007199254740991` (2^53 - 1)

超过安全范围的数字会丢失精度！

### 示例问题

```javascript
const snowflakeId = 1234567890123456789  // 雪花 ID
console.log(snowflakeId)                  // 1234567890123456800 (精度丢失！)

// 正确做法
const snowflakeId = "1234567890123456789" // 字符串形式
console.log(snowflakeId)                  // "1234567890123456789" (正确！)
```

## 工具函数说明

| 函数 | 用途 | 示例 |
|------|------|------|
| `toIdString(id)` | 转换为字符串 | `toIdString(123)` → `"123"` |
| `compareIds(id1, id2)` | 比较两个 ID | `compareIds("123", 123)` → `true` |
| `idInArray(id, arr)` | 检查是否在数组中 | `idInArray("123", ["123", "456"])` → `true` |
| `findById(arr, id)` | 查找对象 | `findById(users, "123")` → `{...}` |
| `removeById(arr, id)` | 移除对象 | `removeById(users, "123")` → `[...]` |

## 常见场景

### 场景 1：文件操作
```javascript
// 下载文件
const downloadFile = async (file) => {
  const blob = await downloadFileApi(file.id)  // file.id 是字符串
  // ...
}

// 删除文件
const deleteFile = async (fileId) => {
  await deleteFileApi(fileId)  // fileId 作为字符串传递
  fileList.value = removeById(fileList.value, fileId)
}
```

### 场景 2：存储桶管理
```javascript
// 检查是否是默认存储桶
const isDefault = computed(() => 
  compareIds(bucket.id, userStore.userInfo?.currentBucketId)
)

// 设置默认存储桶
const setDefault = async (bucketId) => {
  await setDefaultBucket(bucketId)  // bucketId 作为字符串
}
```

### 场景 3：路由参数
```javascript
// 路由定义
{
  path: '/file/:id',
  component: FileDetail
}

// 获取参数（已经是字符串）
const fileId = route.params.id  // 直接使用，无需转换
```

## 检查清单

在编写涉及 ID 的代码时，请检查：

- [ ] ID 比较是否使用字符串比较？
- [ ] Props 中的 ID 是否定义为 String 类型？
- [ ] 是否避免使用 `parseInt()` 或 `Number()` 转换 ID？
- [ ] 数组过滤/查找是否正确处理 ID？
- [ ] API 调用是否以字符串形式传递 ID？

## 需要帮助？

查看完整文档：[SNOWFLAKE_ID_MIGRATION.md](./SNOWFLAKE_ID_MIGRATION.md)
