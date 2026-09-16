<template>
  <div class="login-page">
    <div class="bg-decoration">
      <div class="bg-blob bg-blob-1"></div>
      <div class="bg-blob bg-blob-2"></div>
      <div class="bg-blob bg-blob-3"></div>
    </div>

    <div class="login-card">
      <!-- <div class="card-header">
        <div class="logo-mini">
          <el-icon size="32" class="logo-icon"><Upload /></el-icon>
        </div>
        <h2>重置密码</h2>
        <p>通过邮箱验证码找回您的账户</p>
      </div> -->

      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        class="login-form"
        @submit.prevent="handleResetPassword"
      >
        <div class="verification-info">
          <el-icon size="40" class="mail-icon"><Message /></el-icon>
          <h3>找回账号</h3>
          <p>输入邮箱、验证码和新密码完成重置</p>
        </div>

        <el-form-item prop="email">
          <el-input
            v-model="forgotForm.email"
            placeholder="邮箱地址"
            size="large"
            :prefix-icon="Message"
            class="glass-input"
          />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-input-group">
            <el-input
              v-model="forgotForm.code"
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
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input
            v-model="forgotForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="glass-input"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="forgotForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="glass-input"
          />
        </el-form-item>

        <div class="step-actions">
          <el-button
            type="primary"
            size="large"
            :loading="resetLoading"
            @click="handleResetPassword"
            class="submit-btn"
          >
            修改密码
          </el-button>

          <el-button
            size="large"
            @click="router.push('/login')"
            class="back-btn"
          >
            返回登录
          </el-button>
        </div>
      </el-form>

      <div class="form-footer">
        <p>
          还没有账户？
          <router-link to="/register" class="switch-link">立即注册</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message, Upload } from '@element-plus/icons-vue'
import { sendVerificationCode, getVerificationCooldown, resetPassword } from '@/api/auth.js'

const router = useRouter()
const forgotFormRef = ref()
const sendingCode = ref(false)
const resetLoading = ref(false)
const codeCooldown = ref(0)

const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码长度为6-64个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== forgotForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const startCooldown = (seconds = 60) => {
  codeCooldown.value = seconds
  const timer = setInterval(() => {
    codeCooldown.value--
    if (codeCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!forgotForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  sendingCode.value = true
  try {
    const cooldownResult = await getVerificationCooldown(forgotForm.email, 'RESET_PASSWORD')
    if (!cooldownResult.canSend) {
      const leftSeconds = cooldownResult.remainingSeconds || 60
      startCooldown(leftSeconds)
      ElMessage.warning(`验证码发送过于频繁，请${leftSeconds}秒后再试`)
      return
    }

    // 【重点】这里是“发送验证码”的实际调用（忘记密码页面）
    await sendVerificationCode(forgotForm.email, 'RESET_PASSWORD')
    ElMessage.success('验证码已发送到您的邮箱')
    startCooldown(60)
  } catch (error) {
    console.error('发送重置验证码失败:', error)
    ElMessage.error(error.message || '发送验证码失败，请重试')
  } finally {
    sendingCode.value = false
  }
}

const handleResetPassword = async () => {
  if (!forgotFormRef.value) return

  await forgotFormRef.value.validate(async (valid) => {
    if (!valid) return

    resetLoading.value = true
    try {
      await resetPassword({
        email: forgotForm.email,
        code: forgotForm.code,
        password: forgotForm.newPassword,
        verificationCodeType: 'RESET_PASSWORD'
      })
      ElMessage.success('密码重置成功，请使用新密码登录')
      router.push({
        path: '/login',
        query: { email: forgotForm.email }
      })
    } catch (error) {
      console.error('重置密码失败:', error)
      ElMessage.error(error.message || '重置密码失败，请稍后重试')
    } finally {
      resetLoading.value = false
    }
  })
}
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
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.login-card {
  width: 100%;
  max-width: 420px;
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
  margin-bottom: 28px;
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

.code-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
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

.step-actions {
  display: flex;
  flex-direction: column;
  width: 100%;
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

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 20px;
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
