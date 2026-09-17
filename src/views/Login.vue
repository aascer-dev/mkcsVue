<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-blob bg-blob-1"></div>
      <div class="bg-blob bg-blob-2"></div>
      <div class="bg-blob bg-blob-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-header">
        <div class="logo-mini">
          <el-icon size="32" class="logo-icon"><Upload /></el-icon>
        </div>
        <h2>{{ isRegisterMode ? '创建账户' : '欢迎回来' }}</h2>
        <p>{{ isRegisterMode ? '开始您的云端之旅' : '登录到您的账户' }}</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        v-if="!isRegisterMode"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名或邮箱"
            size="large"
            :prefix-icon="User"
            class="glass-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="glass-input"
          />
        </el-form-item>
        
        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
        </div>
        
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
          class="submit-btn"
        >
          登录
        </el-button>
        
        <!-- OAuth登录 -->
        <OAuthLogin ref="oauthRef" />
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-else
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="login-form"
        @submit.prevent="handleNextStep"
      >
        <!-- 第一步：填写基本信息 -->
        <template v-if="registerStep === 1">
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
              class="glass-input"
              @blur="checkUsernameAvailability"
            />
            <div v-if="usernameStatus.checking" class="field-status checking">
              <el-icon class="is-loading"><Loading /></el-icon>
              检查中...
            </div>
            <div v-else-if="usernameStatus.available === true" class="field-status available">
              <el-icon><CircleCheck /></el-icon>
              用户名可用
            </div>
            <div v-else-if="usernameStatus.available === false" class="field-status unavailable">
              <el-icon><CircleClose /></el-icon>
              {{ usernameStatus.message }}
            </div>
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="邮箱地址"
              size="large"
              :prefix-icon="Message"
              class="glass-input"
              @blur="checkEmailAvailability"
            />
            <div v-if="emailStatus.checking" class="field-status checking">
              <el-icon class="is-loading"><Loading /></el-icon>
              检查中...
            </div>
            <div v-else-if="emailStatus.available === true" class="field-status available">
              <el-icon><CircleCheck /></el-icon>
              邮箱可用
            </div>
            <div v-else-if="emailStatus.available === false" class="field-status unavailable">
              <el-icon><CircleClose /></el-icon>
              {{ emailStatus.message }}
            </div>
          </el-form-item>
          
          <el-form-item prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              placeholder="显示昵称（可选）"
              size="large"
              :prefix-icon="User"
              class="glass-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="glass-input"
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="glass-input"
            />
          </el-form-item>
          
          <el-button
            type="primary"
            size="large"
            :loading="registerLoading"
            :disabled="!canProceedToStep2"
            @click="handleNextStep"
            class="submit-btn"
          >
            下一步
          </el-button>
        </template>

        <!-- 第二步：邮箱验证 -->
        <template v-else-if="registerStep === 2">
          <div class="verification-info">
            <el-icon size="40" class="mail-icon"><Message /></el-icon>
            <h3>验证您的邮箱</h3>
            <p>我们将向 <strong>{{ registerForm.email }}</strong> 发送验证码</p>
          </div>

          <div class="code-input-group">
            <el-input
              v-model="verificationCode"
              placeholder="请输入6位验证码"
              size="large"
              maxlength="6"
              class="glass-input code-input"
            />
            <el-button
              type="primary"
              size="large"
              :loading="sendingCode"
              :disabled="codeCooldown > 0"
              @click="handleSendCode"
              class="send-code-btn"
            >
              {{ codeCooldown > 0 ? `${codeCooldown}s` : '发送' }}
            </el-button>
          </div>

          <div class="step2-actions">
            <el-button
              type="primary"
              size="large"
              :loading="registerLoading"
              :disabled="verificationCode.length !== 6"
              @click="handleVerifyAndRegister"
              class="submit-btn"
            >
              验证并注册
            </el-button>

            <el-button
              size="large"
              @click="registerStep = 1"
              class="back-btn"
            >
              返回上一步
            </el-button>
          </div>
        </template>
      </el-form>

      <!-- 切换模式 -->
      <div class="form-footer">
        <p v-if="!isRegisterMode">
          还没有账户？
          <router-link to="/register" class="switch-link">立即注册</router-link>
        </p>
        <p v-else>
          已有账户？
          <router-link to="/login" class="switch-link" @click="resetRegisterState">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Lock, 
  Message,
  Upload,
  CircleCheck,
  CircleClose,
  Loading
} from '@element-plus/icons-vue'
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { 
  login, 
  register, 
  checkUsernameAvailability as checkUsernameApi, 
  checkEmailAvailability as checkEmailApi, 
  sendVerificationCode, 
  verifyCode,
  getVerificationCooldown
} from '@/api/auth.js'
import OAuthLogin from '@/components/OAuthLogin.vue'

const router = useRouter()
const route = useRoute()
const loginFormRef = ref()
const registerFormRef = ref()
const oauthRef = ref()
const loading = ref(false)
const registerLoading = ref(false)
const rememberMe = ref(false)
const registerStep = ref(1)
const verificationCode = ref('')
const sendingCode = ref(false)
const codeCooldown = ref(0)

// 注意：OAuth回调已由专门的 OAuthCallback.vue 页面处理
// 前端路由：/oauth/callback
// 后端直接重定向时使用后端回调路由，会重定向到前端回调页面

// 根据路由决定是登录还是注册模式
const isRegisterMode = computed(() => {
  return route.meta?.isRegister === true || route.path === '/register'
})

// 用户名和邮箱可用性状态
const usernameStatus = reactive({
  checking: false,
  available: null,
  message: ''
})

const emailStatus = reactive({
  checking: false,
  available: null,
  message: ''
})

// 防抖定时器
let usernameCheckTimer = null
let emailCheckTimer = null

const loginForm = reactive({
  username: '',
  password: ''
})

const applyPrefillEmail = () => {
  const emailFromQuery = typeof route.query.email === 'string' ? route.query.email.trim() : ''
  if (emailFromQuery) {
    loginForm.username = emailFromQuery
  }
}

applyPrefillEmail()

const registerForm = reactive({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const startCooldown = (cooldownRef, seconds = 60) => {
  cooldownRef.value = seconds
  const timer = setInterval(() => {
    cooldownRef.value--
    if (cooldownRef.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 检查是否可以进入第二步
const canProceedToStep2 = computed(() => {
  return registerForm.username.length >= 3 &&
         registerForm.email &&
         registerForm.password.length >= 6 &&
         registerForm.password === registerForm.confirmPassword &&
         usernameStatus.available === true &&
         emailStatus.available === true
})

// 检查用户名可用性（防抖）
const checkUsernameAvailability = () => {
  const username = registerForm.username.trim()
  
  // 清除之前的定时器
  if (usernameCheckTimer) {
    clearTimeout(usernameCheckTimer)
  }
  
  // 重置状态
  if (username.length < 3) {
    usernameStatus.available = null
    usernameStatus.message = ''
    return
  }
  
  // 防抖：500ms 后执行
  usernameCheckTimer = setTimeout(async () => {
    usernameStatus.checking = true
    try {
      const result = await checkUsernameApi(username)
      usernameStatus.available = result.available
      usernameStatus.message = result.available ? '' : (result.message || '用户名已被使用')
    } catch (error) {
      usernameStatus.available = null
      usernameStatus.message = ''
      console.error('检查用户名失败:', error)
    } finally {
      usernameStatus.checking = false
    }
  }, 500)
}

// 检查邮箱可用性（防抖）
const checkEmailAvailability = () => {
  const email = registerForm.email.trim()
  
  // 清除之前的定时器
  if (emailCheckTimer) {
    clearTimeout(emailCheckTimer)
  }
  
  // 简单邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailStatus.available = null
    emailStatus.message = ''
    return
  }
  
  // 防抖：500ms 后执行
  emailCheckTimer = setTimeout(async () => {
    emailStatus.checking = true
    try {
      const result = await checkEmailApi(email)
      emailStatus.available = result.available
      emailStatus.message = result.available ? '' : (result.message || '邮箱已被注册')
    } catch (error) {
      emailStatus.available = null
      emailStatus.message = ''
      console.error('检查邮箱失败:', error)
    } finally {
      emailStatus.checking = false
    }
  }, 500)
}

// 进入下一步
const handleNextStep = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate((valid) => {
    if (valid && canProceedToStep2.value) {
      registerStep.value = 2
    }
  })
}

// 发送验证码
const handleSendCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  
  sendingCode.value = true
  try {
    // 检查冷却状态
    const cooldownResult = await getVerificationCooldown(registerForm.email, 'REGISTER')
    if (!cooldownResult.canSend) {
      codeCooldown.value = cooldownResult.remainingSeconds || 60
      const timer = setInterval(() => {
        codeCooldown.value--
        if (codeCooldown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      ElMessage.warning(`验证码发送过于频繁，请${codeCooldown.value}秒后再试`)
      return
    }
    
    // 【重点】这里是“发送验证码”的实际调用（注册场景）
    await sendVerificationCode(registerForm.email, 'REGISTER')
    ElMessage.success('验证码已发送到您的邮箱')
    
    // 开始倒计时
    startCooldown(codeCooldown, 60)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '发送验证码失败，请重试')
  } finally {
    sendingCode.value = false
  }
}

// 验证并注册
const handleVerifyAndRegister = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    ElMessage.warning('请输入正确的6位验证码')
    return
  }
  
  registerLoading.value = true
  try {
    // 验证验证码
    await verifyCode(registerForm.email, verificationCode.value, 'REGISTER')
    
    // 注册用户
    const registerData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      nickname: registerForm.nickname || registerForm.username, // 如果没有填写昵称，使用用户名
      rememberMe: false
    }
    
    const data = await register(registerData)
    
    // 注册成功后自动登录
    if (data.accessToken && data.refreshToken) {
      const { initUserInfoAfterLogin } = useAuthRefresh()
      await initUserInfoAfterLogin(data)
      ElMessage.success('注册成功，已自动登录')
      router.push('/home')
    } else {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    registerLoading.value = false
  }
}

const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 32, message: '用户名长度为3-32个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和短横线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  nickname: [
    { max: 32, message: '昵称长度不能超过32个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码长度为6-64个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = await login({
          ...loginForm,
          rememberMe: rememberMe.value
        })
        
        // 设置token并获取完整用户信息
        const { initUserInfoAfterLogin } = useAuthRefresh()
        await initUserInfoAfterLogin(data)
        
        ElMessage.success('登录成功')
        
        // 检查是否有跳转目标
        const redirect = route.query.redirect || '/home'
        router.push(redirect)
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置注册状态
const resetRegisterState = () => {
  registerStep.value = 1
  verificationCode.value = ''
  codeCooldown.value = 0
  usernameStatus.available = null
  usernameStatus.message = ''
  emailStatus.available = null
  emailStatus.message = ''
  Object.assign(registerForm, {
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: ''
  })
}

// 监听路由变化，切换到登录页时重置注册状态
watch(() => route.path, (newPath) => {
  if (newPath === '/login') {
    resetRegisterState()
    applyPrefillEmail()
  }
})
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #f0fdfa 0%, #ecfeff 40%, #f0f9ff 100%);
}

/* 背景装饰动画 */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 8s ease-in-out infinite;
}

.bg-blob-1 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #5eead4, #22d3ee);
  top: -120px;
  right: -80px;
  animation-delay: 0s;
}

.bg-blob-2 {
  width: 280px;
  height: 280px;
  background: linear-gradient(135deg, #67e8f9, #a5f3fc);
  bottom: -100px;
  left: -80px;
  animation-delay: -3s;
}

.bg-blob-3 {
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, #99f6e4, #5eead4);
  top: 40%;
  left: 20%;
  transform: translate(-50%, -50%);
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* 毛玻璃登录卡片 */
.login-card {
  width: 100%;
  max-width: 400px;
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
  position: relative;
  z-index: 10;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
}

.logo-mini .logo-icon {
  color: white;
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

.login-form {
  margin-bottom: 20px;
}

/* 毛玻璃输入框 */
.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: none;
  transition: all 0.2s ease;
  padding: 4px 12px;
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

.glass-input :deep(.el-input__prefix) {
  color: #9ca3af;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.form-options :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #6b7280;
}

.forgot-link {
  color: #0d9488;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #0f766e;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
  border: none;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.back-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  margin-top: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #d1d5db;
}

.step2-actions {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.form-footer p {
  margin: 0;
}

.switch-link {
  color: #0d9488;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.switch-link:hover {
  color: #0f766e;
  text-decoration: underline;
}

/* 字段状态提示 */
.field-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 6px;
  padding-left: 4px;
}

.field-status.checking {
  color: #9ca3af;
}

.field-status.available {
  color: #14b8a6;
}

.field-status.unavailable {
  color: #ef4444;
}

.field-status .el-icon {
  font-size: 14px;
}

/* 邮箱验证步骤样式 */
.verification-info {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(20, 184, 166, 0.06);
  border-radius: 12px;
}

.verification-info .mail-icon {
  color: #14b8a6;
  margin-bottom: 12px;
}

.verification-info h3 {
  font-size: 18px;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.verification-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.verification-info strong {
  color: #0d9488;
  font-weight: 600;
}

.code-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
}

.code-input-group .code-input {
  flex: 1;
}

.code-input-group .code-input :deep(.el-input__inner) {
  text-align: center;
  font-size: 18px;
  letter-spacing: 6px;
  font-weight: 600;
}

.send-code-btn {
  flex-shrink: 0;
  min-width: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
  border: none;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 28px 24px;
    border-radius: 20px;
  }
  
  .card-header h2 {
    font-size: 22px;
  }
  
  .bg-blob-1 {
    width: 200px;
    height: 200px;
  }
  
  .bg-blob-2 {
    width: 180px;
    height: 180px;
  }
  
  .bg-blob-3 {
    width: 150px;
    height: 150px;
  }
}
</style>
