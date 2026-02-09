<template>
  <div class="oauth-callback">
    <div class="callback-container">
      <div class="loading-content" v-if="processing">
        <el-icon class="loading-icon" :size="48">
          <Loading />
        </el-icon>
        <h2>处理登录中...</h2>
        <p>请稍等，我们正在完成您的登录</p>
      </div>
      
      <div class="error-content" v-else-if="error">
        <el-icon class="error-icon" :size="48">
          <CircleClose />
        </el-icon>
        <h2>登录失败</h2>
        <p>{{ error }}</p>
        <el-button type="primary" @click="goToLogin">
          返回登录页
        </el-button>
      </div>
      
      <div class="success-content" v-else-if="success">
        <el-icon class="success-icon" :size="48">
          <CircleCheck />
        </el-icon>
        <h2>登录成功</h2>
        <p>即将跳转到主页...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { githubOAuthCallback } from '@/api/auth.js'
import { useUserStore } from '@/stores/user.js'
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const processing = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const params = route.query
    
    // ========== 模式B优先：后端 GET 回调处理后重定向到前端，携带结果参数 ==========
    // 后端已处理 code 交换，前端只需读取结果即可
    
    // 情况1: 登录失败
    if (params.error) {
      error.value = decodeURIComponent(params.error)
      processing.value = false
      return
    }

    // 情况2: 登录成功（现有用户，后端已处理）
    if (params.success === 'true' && params.token) {
      handleLoginSuccess(params)
      return
    }
    
    // 情况3: 需要注册（新用户，后端已处理）
    if (params.requiresRegistration === 'true') {
      router.push({
        path: '/oauth2/email-binding',
        query: {
          tempUserId: params.tempUserId,
          suggestedEmail: params.suggestedEmail || '',
          suggestedUsername: params.suggestedUsername || '',
          hasGitHubEmail: params.hasGitHubEmail
        }
      })
      return
    }
    
    // ========== 模式A兜底：GitHub 直接重定向到前端，携带 code ==========
    // 只有在后端没有处理结果的情况下，前端才用 code 调 POST API
    if (params.code) {
      await handleCodeExchange(params.code, params.state)
      return
    }

    // 如果没有任何有效参数，显示错误
    error.value = '缺少必要的回调参数'
    processing.value = false
    
  } catch (err) {
    console.error('OAuth回调处理失败:', err)
    error.value = err.message || '登录失败，请重试'
    processing.value = false
  }
})

/**
 * 模式A：前端拿 code + state 调用后端 POST API
 * state 由后端生成并存储在 Redis 中，前端只负责透传
 */
const handleCodeExchange = async (code, state) => {
  try {
    
    // 调用后端 POST 回调接口
    const result = await githubOAuthCallback(code, state, false)
    
    // 判断返回结果类型
    if (result.requiresRegistration) {
      // 新用户，需要注册
      router.push({
        path: '/oauth2/email-binding',
        query: {
          tempUserId: result.tempUserId,
          suggestedEmail: result.suggestedEmail || '',
          suggestedUsername: result.suggestedUsername || '',
          hasGitHubEmail: String(result.hasGitHubEmail || false)
        }
      })
    } else if (result.token) {
      // 现有用户，直接登录
      handleLoginSuccess(result)
    } else {
      error.value = '未知的回调响应'
      processing.value = false
    }
  } catch (err) {
    console.error('OAuth code 交换失败:', err)
    error.value = err.message || '登录失败，请重试'
    processing.value = false
  }
}

/**
 * 处理登录成功（保存用户信息并跳转）
 */
const handleLoginSuccess = async (data) => {
  try {
    // 使用新的初始化方法获取完整用户信息
    const { initUserInfoAfterLogin } = useAuthRefresh()
    await initUserInfoAfterLogin(data.token, data.expiresIn)
    
    success.value = true
    processing.value = false
    
    ElMessage.success('GitHub 登录成功！')
    
    setTimeout(() => {
      router.push(data.redirect || '/home')
    }, 1500)
  } catch (error) {
    console.error('初始化用户信息失败:', error)
    error.value = '登录成功，但获取用户信息失败'
    processing.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.callback-container {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.loading-content,
.error-content,
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  color: #14b8a6;
  animation: spin 1s linear infinite;
}

.error-icon {
  color: #f87171;
}

.success-icon {
  color: #14b8a6;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.el-button {
  margin-top: 16px;
}
</style>