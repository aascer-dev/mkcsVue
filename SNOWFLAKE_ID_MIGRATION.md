# 雪花 ID 迁移总结

## 背景
由于使用雪花 ID（Snowflake ID），ID 值是 64 位长整型，超过了 JavaScript 的 Number.MAX_SAFE_INTEGER（2^53-1），会导致精度丢失和截断问题。因此需要将前端所有与 ID 相关的处理从数字类型改为字符串类型。

## 修改内容

### 1. API 文件修改

#### `src/api/auth.js`
- 修改 JSDoc 注释：
  - `uploadUserAvatar` 的 `userId` 参数从 `{number}` 改为 `{string}`
  - `completeOAuth2Merge` 的 `existingUserId` 参数从 `{number}` 改为 `{string}`

### 2. Store 文件修改

#### `src/stores/file.js`
- `removeFile` 方法：使用 `String()` 进行比较
  ```javascript
  // 修改前
  this.fileList = this.fileList.filter(file => file.id !== fileId)
  
  // 修改后
  this.fileList = this.fileList.filter(file => String(file.id) !== String(fileId))
  ```

#### `src/stores/filePreview.js`
- `addToHistory` 方法：使用 `findIndex` 和 `String()` 进行比较
- `previewPrevious` 方法：使用 `findIndex` 和 `String()` 进行比较
- `previewNext` 方法：使用 `findIndex` 和 `String()` 进行比较

### 3. 组件文件修改

#### `src/components/FileOperationsExample.vue`
- 修改文件列表过滤逻辑，使用 `String()` 进行比较

#### `src/components/FilePreview/FilePreview.vue`
- `fileId` prop 已经是 `String` 类型 ✓（无需修改）

### 4. 视图文件修改

#### `src/views/Settings.vue`
- 所有 `bucket.id` 与 `currentBucketId` 的比较都使用 `String()` 转换
- `settingDefault` 和 `deletingBucket` 的比较也使用 `String()` 转换

#### `src/views/Home.vue`
- `bucket.id` 与 `currentBucketId` 的比较使用 `String()` 转换

#### `src/views/FileManager.vue`
- 文件下载、重命名、删除操作中的 `file.id` 传递保持字符串格式 ✓

## 关键修改模式

### ID 比较操作

#### 方式 1：使用 String() 直接转换（已在代码中使用）
```javascript
// ❌ 错误的做法（可能导致精度问题）
if (id1 === id2) { }
if (bucket.id !== currentBucketId) { }

// ✅ 正确的做法（字符串比较）
if (String(id1) === String(id2)) { }
if (String(bucket.id) !== String(currentBucketId)) { }
```

#### 方式 2：使用工具函数（推荐用于新代码）
```javascript
import { compareIds, toIdString, findById, removeById } from '@/utils/index.js'

// 比较两个 ID
if (compareIds(id1, id2)) { }

// 转换为字符串（处理 null/undefined）
const idStr = toIdString(userId)

// 在数组中查找对象
const user = findById(users, userId)
const file = findById(files, fileId, 'id')

// 从数组中移除对象
const newUsers = removeById(users, userId)
const newFiles = removeById(files, fileId, 'id')
```

### 数组操作
```javascript
// ❌ 错误的做法
array.filter(item => item.id !== targetId)
array.indexOf(id)

// ✅ 正确的做法方式 1：直接使用 String()
array.filter(item => String(item.id) !== String(targetId))
array.findIndex(id => String(id) === String(targetId))

// ✅ 正确的做法方式 2：使用工具函数
import { findById, removeById } from '@/utils/index.js'
const item = findById(array, targetId)
const newArray = removeById(array, targetId)
```

## 新增工具函数（src/utils/index.js）

为了标准化雪花 ID 的处理，新增了以下工具函数：

### `toIdString(id)`
将 ID 转换为字符串，安全处理 null/undefined
```javascript
toIdString(12345)          // "12345"
toIdString("12345")        // "12345"
toIdString(null)           // null
toIdString(undefined)      // null
```

### `compareIds(id1, id2)`
比较两个 ID 是否相等（处理类型转换）
```javascript
compareIds(12345, "12345")           // true
compareIds("12345", "12345")         // true
compareIds(null, null)               // true
compareIds(null, "12345")            // false
```

### `idInArray(id, idArray)`
检查 ID 是否在数组中
```javascript
idInArray("123", ["123", "456"])     // true
idInArray(123, ["123", "456"])       // true
```

### `findById(array, id, idKey = 'id')`
从对象数组中查找匹配 ID 的对象
```javascript
const users = [
  { id: "123", name: "Alice" },
  { id: "456", name: "Bob" }
]
findById(users, "123")               // { id: "123", name: "Alice" }
findById(users, 123)                 // { id: "123", name: "Alice" }
```

### `removeById(array, id, idKey = 'id')`
从对象数组中移除匹配 ID 的对象
```javascript
const users = [
  { id: "123", name: "Alice" },
  { id: "456", name: "Bob" }
]
removeById(users, "123")             // [{ id: "456", name: "Bob" }]
```

## 注意事项

1. **后端 API 响应**：确保后端将 ID 作为字符串返回，在 Java 中使用 `@JsonSerialize(using = ToStringSerializer.class)` 注解

2. **Vue 组件 Props**：所有接收 ID 的 props 应该定义为 `String` 类型：
   ```javascript
   props: {
     fileId: {
       type: String,
       required: true
     }
   }
   ```

3. **URL 参数**：路由参数天然是字符串，无需特殊处理

4. **LocalStorage**：存储和读取时 ID 会自动转换为字符串

5. **比较操作**：所有 ID 的相等性比较都应该使用 `String()` 转换后再比较

## 验证方法

1. 检查浏览器控制台是否有 ID 精度丢失的警告
2. 验证所有涉及 ID 的功能是否正常工作：
   - 文件操作（上传、下载、删除、重命名）
   - 存储桶管理（创建、编辑、删除、设置默认）
   - 文件预览
   - OAuth 绑定
3. 使用大数值的雪花 ID 进行测试

## 未修改的内容

以下内容不涉及 ID，无需修改：
- `parseInt()` 用于时间戳解析
- `parseFloat()` 用于文件大小格式化
- 非 ID 相关的数字比较操作

## 修改文件清单

- ✅ `src/api/auth.js` - 修改 JSDoc 注释，ID 参数从 number 改为 string
- ✅ `src/stores/file.js` - removeFile 方法使用字符串比较
- ✅ `src/stores/filePreview.js` - 历史记录操作使用字符串比较
- ✅ `src/components/FileOperationsExample.vue` - 文件列表过滤使用字符串比较
- ✅ `src/views/Settings.vue` - bucket.id 比较使用字符串比较
- ✅ `src/views/Home.vue` - bucket.id 比较使用字符串比较
- ✅ `src/utils/index.js` - 新增雪花 ID 工具函数

## 新增文件

- ✅ `SNOWFLAKE_ID_MIGRATION.md` - 雪花 ID 迁移总结文档

## 后续建议

1. 在项目中添加 ESLint 规则，禁止直接比较可能是雪花 ID 的变量
2. 创建一个工具函数 `compareIds(id1, id2)` 统一处理 ID 比较
3. 在代码审查时重点关注 ID 相关的操作

## 相关资源

- [JavaScript Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)
- [Snowflake ID 介绍](https://en.wikipedia.org/wiki/Snowflake_ID)
