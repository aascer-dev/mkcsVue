<template>
  <div class="username-selection-page">
    <div class="selection-card">
      <div class="card-header">
        <el-icon size="40" class="icon-badge"><User /></el-icon>
        <h2>选择用户名</h2>
        <p>最后一步，为您的账号选择一个独特的用户名</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" class="username-form">
        <el-form-item prop="username">
          <div class="username-input-wrapper">
            <el-input
              v-model="form.username"
              size="large"
              placeholder="请输入用户名"
              :prefix-icon="User"
              class="glass-input"
              @input="handleUsernameInput"
              @blur="checkUsernameAvailability"
            />
            <div v-if="checkingUsername" class="status-hint checking">
              <el-icon class="is-loading"><Loading /></el-icon>
              检查中...
            </div>
            <div v-else-if="usernameAvailable === true" class="status-hint available">
              <el-icon><CircleCheck /></el-icon>
              用户名可用
            </div>
            <div v-else-if="usernameAvailable === false" class="status-hint unavailable">
              <el-icon><CircleClose /></el-icon>
              用户名已被使用
            </div>
          </div>

          <div class="username-tips">
            <div class="tip-title">用户名规则：</div>
            <ul class="tip-list">
              <li>长度3-32个字符</li>
              <li>只能包含字母、数字、下划线(_)和连字符(-)</li>
              <li>不能包含空格和特殊符号</li>
            </ul>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="remember-me">
            <el-checkbox v-model="form.rememberMe" size="large">
              记住我的登录状态
            </el-checkbox>
          </div>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="completing"
          :disabled="!canComplete"
          @click="completeRegistration"
          class="complete-btn"
        >
          完成注册
        </el-button>
      </el-form>

      <div class="suggestions" v-if="suggestedUsername && !form.username">
        <div class="suggestions-title">建议用户名：</div>
        <el-button plain @click="useSuggestedUsername" class="suggestion-btn">
          {{ suggestedUsername }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { 
  checkOAuth2UsernameAvailability,
  completeOAuth2Registration
} from '@/api/auth.js'
import { useUserStore } from '@/stores/user.js'
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref()
const tempUserId = ref('')
const suggestedUsername = ref('')

const checkingUsername = ref(false)
const usernameAvailable = ref(null)
const completing = ref(false)

const form = reactive({
  username: '',
  rememberMe: true
})

// 用户名格式验证规则
const usernamePattern = /^[a-zA-Z0-9_-]{3,32}$/

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { 
      pattern: usernamePattern, 
      message: '用户名格式不正确', 
      trigger: 'blur' 
    }
  ]
}

const canComplete = computed(() => {
  return form.username && 
         usernamePattern.test(form.username) && 
         usernameAvailable.value === true
})

onMounted(() => {
  // 获取URL参数
  tempUserId.value = route.query.tempUserId || ''
  suggestedUsername.value = route.query.suggestedUsername || ''

  if (!tempUserId.value) {
    ElMessage.error('缺少必要的参数')
    router.push('/login')
    return
  }
})

// 防抖检查用户名
let checkTimer = null
const handleUsernameInput = () => {
  usernameAvailable.value = null
  
  // 清除之前的定时器
  if (checkTimer) {
    clearTimeout(checkTimer)
  }
  
  // 基本格式检查
  if (!form.username || form.username.length < 3) {
    return
  }
  
  if (!usernamePattern.test(form.username)) {
    return
  }
  
  // 500ms后检查可用性
  checkTimer = setTimeout(() => {
    checkUsernameAvailability()
  }, 500)
}

// 检查用户名可用性
const checkUsernameAvailability = async () => {
  const username = form.username.trim()
  
  if (!username || username.length < 3 || !usernamePattern.test(username)) {
    usernameAvailable.value = null
    return
  }
  
  checkingUsername.value = true
  try {
    const result = await checkOAuth2UsernameAvailability(username)
    usernameAvailable.value = result.available
  } catch (error) {
    console.error('检查用户名失败:', error)
    usernameAvailable.value = null
  } finally {
    checkingUsername.value = false
  }
}

// 使用建议的用户名
const useSuggestedUsername = () => {
  form.username = suggestedUsername.value
  handleUsernameInput()
}

// 完成注册
const completeRegistration = async () => {
  if (!formRef.value) return

  // 验证表单
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  completing.value = true
  try {
    const result = await completeOAuth2Registration(
      tempUserId.value,
      form.username,
      form.rememberMe
    )

    // 使用新的初始化方法获取完整用户信息
    const { initUserInfoAfterLogin } = useAuthRefresh()
    await initUserInfoAfterLogin(result.token, result.expiresIn)

    ElMessage.success('注册成功！欢迎加入CloudDrive')
    
    // 跳转到主页
    setTimeout(() => {
      router.push('/home')
    }, 1000)
  } catch (error) {
    console.error('注册失败:', error)
    if (error.code === 1105) {
      ElMessage.error('用户名已存在，请选择其他用户名')
      usernameAvailable.value = false
    } else if (error.code === 1106) {
      ElMessage.error('邮箱已被使用')
    } else if (error.code === 2102) {
      ElMessage.error('注册会话已过期，请重新开始')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      ElMessage.error(error.message || '注册失败，请重试')
    }
  } finally {
    completing.value = false
  }
}
</script>

<style scoped>
.username-selection-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(160deg, #f0fdfa 0%, #ecfeff 40%, #f0f9ff 100%);
}

.selection-card {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 20px 25px -5px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon-badge {
  color: #14b8a6;
  margin-bottom: 16px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.username-form {
  margin-top: 24px;
}

.username-input-wrapper {
  position: relative;
}

.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: none;
  transition: all 0.2s ease;
}

.glass-input :deep(.el-input__wrapper:hover) {
  border-color: #2dd4bf;
  background: rgba(255, 255, 255, 0.8);
}

.glass-input :deep(.el-input__wrapper.is-focus) {
  border-color: #14b8a6;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
}

.status-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-top: 8px;
  padding-left: 4px;
}

.status-hint.checking {
  color: #9ca3af;
}

.status-hint.available {
  color: #14b8a6;
}

.status-hint.unavailable {
  color: #ef4444;
}

.username-tips {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(20, 184, 166, 0.06);
  border-radius: 8px;
}

.tip-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.tip-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.8;
}

.remember-me {
  margin-left: 4px;
}

.remember-me :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #6b7280;
}

.complete-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
  border: none;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  margin-top: 8px;
}

.complete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4);
}

.complete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.suggestions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(229, 231, 235, 0.6);
  text-align: center;
}

.suggestions-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.suggestion-btn {
  border-color: #14b8a6;
  color: #14b8a6;
  border-radius: 8px;
}

.suggestion-btn:hover {
  background: rgba(20, 184, 166, 0.1);
  border-color: #0d9488;
  color: #0d9488;
}
</style>
