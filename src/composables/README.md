# Composables 使用说明

## useAuthRefresh - 用户状态刷新钩子

在更新操作后自动刷新用户登录状态和信息的钩子。

### 基本使用

```javascript
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'

const { refreshAuth } = useAuthRefresh()

// 在任何更新操作后调用
async function updateUserProfile() {
  try {
    await updateUserProfileApi(data)
    // 更新成功后刷新用户状态
    await refreshAuth()
  } catch (error) {
    console.error(error)
  }
}
```

### 方法说明

#### 1. refreshAuth(options)

手动刷新用户状态

```javascript
const { refreshAuth } = useAuthRefresh()

// 静默刷新（默认）
await refreshAuth()

// 显示成功消息
await refreshAuth({ showSuccess: true })

// 显示错误消息
await refreshAuth({ silent: false })
```

#### 2. withAuthRefresh(operation, options)

包装操作函数，自动在操作成功或失败后刷新用户状态

```javascript
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { uploadFile } from '@/api/file.js'

const { withAuthRefresh } = useAuthRefresh()

// 包装文件上传函数（默认成功和失败都会刷新）
const uploadFileWithRefresh = withAuthRefresh(uploadFile)

// 使用包装后的函数
async function handleUpload(file) {
  try {
    const result = await uploadFileWithRefresh(file)
    // 上传成功后会自动刷新用户状态
    console.log('上传成功:', result)
  } catch (error) {
    // 上传失败后也会自动刷新用户状态
    console.error('上传失败:', error)
  }
}

// 只在成功时刷新（不推荐）
const uploadFileSuccessOnly = withAuthRefresh(uploadFile, { refreshOnError: false })
```

#### 3. checkAndRefreshAuth()

检查并刷新登录状态，验证token是否有效

```javascript
const { checkAndRefreshAuth } = useAuthRefresh()

async function initApp() {
  const isValid = await checkAndRefreshAuth()
  if (!isValid) {
    // token无效，跳转到登录页
    router.push('/login')
  }
}
```

#### 4. initUserInfoAfterLogin(loginResponse)

登录后初始化用户信息，调用 `/api/auth/userinfo` 获取完整用户数据

```javascript
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'

const { initUserInfoAfterLogin } = useAuthRefresh()

// 登录成功后调用
async function handleLogin() {
  const loginResponse = await loginApi(credentials)
  
  // 保存 accessToken、refreshToken 后初始化完整用户信息
  await initUserInfoAfterLogin(loginResponse)
  
  router.push('/home')
}
```

### 实际应用场景

#### 场景1：登录后初始化用户信息

```vue
<script setup>
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { login } from '@/api/auth.js'

const { initUserInfoAfterLogin } = useAuthRefresh()

const handleLogin = async (formData) => {
  try {
    const response = await login(formData)
    
    // 自动保存令牌并调用 /api/auth/userinfo 获取完整信息
    await initUserInfoAfterLogin(response)
    
    ElMessage.success('登录成功')
    router.push('/home')
  } catch (error) {
    ElMessage.error('登录失败')
  }
}
</script>
```

#### 场景2：文件上传后刷新

```vue
<script setup>
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { uploadFile } from '@/api/file.js'

const { refreshAuth } = useAuthRefresh()

const handleFileUpload = async (file) => {
  try {
    await uploadFile(file)
    ElMessage.success('上传成功')
    // 刷新用户状态（可能存储空间已变化）
    await refreshAuth()
  } catch (error) {
    ElMessage.error('上传失败')
  }
}
</script>
```

#### 场景3：用户设置更新后刷新

```vue
<script setup>
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { updateUserProfile } from '@/api/auth.js'

const { refreshAuth } = useAuthRefresh()

const handleUpdateProfile = async (formData) => {
  try {
    await updateUserProfile(formData)
    ElMessage.success('更新成功')
    // 刷新用户信息
    await refreshAuth({ showSuccess: true })
  } catch (error) {
    ElMessage.error('更新失败')
  }
}
</script>
```

#### 场景4：批量操作后刷新（优化）

```vue
<script setup>
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { deleteFiles } from '@/api/file.js'

const { withAuthRefresh } = useAuthRefresh()

// 使用 withAuthRefresh 包装删除函数
const deleteFilesWithRefresh = withAuthRefresh(deleteFiles)

const handleBatchDelete = async (fileIds) => {
  try {
    // 删除成功后自动刷新用户状态
    await deleteFilesWithRefresh(fileIds)
    ElMessage.success('删除成功')
  } catch (error) {
    // 删除失败后也会自动刷新用户状态（可能配额已变化）
    ElMessage.error('删除失败')
  }
}
</script>
```

#### 场景5：在 Pinia Store 中使用

```javascript
import { defineStore } from 'pinia'
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { updateSettings } from '@/api/user.js'

export const useSettingsStore = defineStore('settings', {
  actions: {
    async updateUserSettings(settings) {
      const { refreshAuth } = useAuthRefresh()
      
      try {
        await updateSettings(settings)
        // 更新后刷新用户状态
        await refreshAuth()
        return true
      } catch (error) {
        console.error('更新设置失败:', error)
        return false
      }
    }
  }
})
```

#### 场景6：全局请求拦截器集成

如果想在所有请求后自动刷新，可以在响应拦截器中集成：

```javascript
// src/utils/request.js
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'

const { refreshAuth } = useAuthRefresh()

// 响应拦截器
request.interceptors.response.use(
  async (response) => {
    // 判断是否需要刷新用户状态的请求
    const needsRefresh = [
      '/api/files/upload',
      '/api/files/delete',
      '/api/users/profile'
    ]
    
    const url = response.config.url
    if (needsRefresh.some(path => url.includes(path))) {
      // 静默刷新用户状态
      await refreshAuth()
    }
    
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| silent | boolean | true | 是否静默刷新（不显示错误消息） |
| showSuccess | boolean | false | 是否显示成功消息 |
| refreshOnError | boolean | true | 操作失败时是否也刷新用户状态（仅用于withAuthRefresh） |

### 注意事项

1. 钩子会调用 `userStore.refreshUserInfo()` 来刷新用户信息
2. 刷新操作是静默的，不会影响用户体验
3. 如果刷新失败，会在控制台输出错误信息
4. `withAuthRefresh` 默认在操作成功或失败后都会刷新用户状态，确保数据同步
5. 建议在需要同步用户状态的操作后使用，如：
   - 文件上传/删除
   - 用户信息更新
   - 权限变更
   - 存储空间变化
