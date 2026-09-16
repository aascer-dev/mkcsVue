<template>
  <div class="verification-page">
    <div class="verification-container">
      <div class="verification-header">
        <el-icon class="header-icon"><Message /></el-icon>
        <h1>邮箱变更验证</h1>
        <p>请输入发送到您新邮箱的验证码</p>
      </div>

      <div class="verification-card">
        <div class="email-display">
          <el-icon><User /></el-icon>
          <span>{{ email }}</span>
        </div>

        <div class="verification-form">
          <div class="form-group">
            <label>验证码</label>
            <el-input
              v-model="verificationCode"
              placeholder="请输入6位验证码"
              maxlength="6"
              size="large"
              @keyup.enter="handleVerify"
              :disabled="verifying"
            >
              <template #prepend>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <div class="code-hint">
              <div class="countdown-info">
                <span v-if="resendCountdown > 0" class="countdown-text">
                  倒计时: <strong>{{ resendCountdown }}</strong> 秒
                </span>
                <span v-else class="countdown-ready">验证码可重新发送</span>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="handleResendCode"
                :loading="resending"
                :disabled="resending || resendCountdown > 0"
              >
                {{ resendCountdown > 0 ? '请等待' : '重新发送验证码' }}
              </el-button>
            </div>
          </div>

          <div class="button-group">
            <el-button @click="handleCancel">取消</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="verifying"
              :disabled="!verificationCode || verificationCode.length < 6"
              @click="handleVerify"
            >
              确认变更
            </el-button>
          </div>
        </div>

        <div class="verification-tips">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            description="验证码有效期为10分钟，请及时完成验证。完成验证后，您的邮箱将更新为新邮箱地址。"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Message, Key } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import {
  sendVerificationCode,
  verifyCode,
  updateUserProfile
} from '@/api/auth.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const email = ref(route.query.email || sessionStorage.getItem('pendingEmail') || '')
const verificationCode = ref('')
const verifying = ref(false)
const resending = ref(false)
const resendCountdown = ref(0)
const verificationTTL = ref(0)  // 验证码有效期
const countdownInterval = ref(null)

onMounted(async () => {
  if (!email.value) {
    ElMessage.error('邮箱参数缺失')
    router.push('/files')
    return
  }

  // 进入页面时立即发送验证码
  await sendInitialVerificationCode()
})

onBeforeUnmount(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})

// 页面进入时发送初始验证码
const sendInitialVerificationCode = async () => {
  try {
    const response = await sendVerificationCode(email.value, 'CHANGE_EMAIL')
    if (response && response.cooldown > 0) {
      resendCountdown.value = response.cooldown
      verificationTTL.value = response.ttl || 300
      startCountdown()
      ElMessage.success('验证码已发送，请查收')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '发送验证码失败')
  }
}

const startCountdown = () => {
  // 如果已有倒计时进行，先清除
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  // 每秒递减倒计时
  countdownInterval.value = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      resendCountdown.value = 0
      clearInterval(countdownInterval.value)
      countdownInterval.value = null
    }
  }, 1000)
}

const handleVerify = async () => {
  if (!verificationCode.value || verificationCode.value.length < 6) {
    ElMessage.warning('请输入6位验证码')
    return
  }

  verifying.value = true
  try {
    // 验证码
    await verifyCode(email.value, verificationCode.value, 'CHANGE_EMAIL')

    // 更新邮箱信息
    await updateUserProfile({ email: email.value })

    // 更新用户状态
    userStore.setUserInfo({
      ...userStore.userInfo,
      email: email.value
    })

    ElMessage.success('邮箱修改成功！')

    // 清除临时存储
    sessionStorage.removeItem('pendingEmail')

    // 返回设置页面
    setTimeout(() => {
      router.push('/settings')
    }, 1500)
  } catch (error) {
    console.error('邮箱验证失败:', error)
    ElMessage.error(error.message || '验证失败，请检查验证码是否正确')
  } finally {
    verifying.value = false
  }
}

const handleResendCode = async () => {
  resending.value = true
  try {
    const response = await sendVerificationCode(email.value, 'CHANGE_EMAIL')
    ElMessage.success('验证码已重新发送')
    verificationCode.value = ''

    // 使用API返回的cooldown和ttl字段
    if (response && response.cooldown > 0) {
      resendCountdown.value = response.cooldown
      verificationTTL.value = response.ttl || 300
      startCountdown()
    }
  } catch (error) {
    console.error('重新发送验证码失败:', error)
    ElMessage.error(error.message || '重新发送失败')
    resendCountdown.value = 0
  } finally {
    resending.value = false
  }
}

const handleCancel = () => {
  sessionStorage.removeItem('pendingEmail')
  router.push('/settings')
}


</script>

<style scoped>
.verification-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f0fdfa 0%, #ecfeff 40%, #f0f9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.verification-container {
  width: 100%;
  max-width: 500px;
}

.verification-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon {
  font-size: 48px;
  color: #0d9488;
  margin-bottom: 16px;
}

.verification-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.verification-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.verification-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

.email-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(20, 184, 166, 0.08);
  border-radius: 12px;
  margin-bottom: 24px;
  font-weight: 600;
  color: #0d9488;
}

.email-display .el-icon {
  font-size: 18px;
}

.verification-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.form-group :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: none;
  transition: all 0.2s ease;
}

.form-group :deep(.el-input__wrapper:hover) {
  border-color: #2dd4bf;
  background: rgba(255, 255, 255, 0.8);
}

.form-group :deep(.el-input__wrapper.is-focus) {
  border-color: #14b8a6;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
}

.form-group :deep(.el-input-group__prepend) {
  background: rgba(20, 184, 166, 0.1);
  border: none;
  color: #14b8a6;
}

.code-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.countdown-info {
  flex: 1;
  min-width: 120px;
}

.countdown-text {
  color: #ef4444;
  font-weight: 600;
  display: inline-block;
}

.countdown-text strong {
  font-size: 16px;
  margin: 0 4px;
}

.countdown-ready {
  color: #10b981;
  font-weight: 600;
}

.code-hint .el-button {
  flex-shrink: 0;
  min-width: 120px;
}

.countdown {
  color: #ef4444;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.button-group .el-button {
  flex: 1;
  font-weight: 600;
}

.button-group .el-button--primary {
  background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
  border: none;
  color: #ffffff !important;
}

.button-group .el-button--primary:hover {
  background: linear-gradient(135deg, #0f766e 0%, #0369a1 100%);
}

.verification-tips :deep(.el-alert) {
  border-radius: 8px;
  background: rgba(240, 253, 250, 0.6);
  border-color: rgba(20, 184, 166, 0.2);
}

.verification-tips :deep(.el-alert__title) {
  font-weight: 600;
  color: #0d9488;
}

.verification-tips :deep(.el-alert__description) {
  color: #4b5563;
  font-size: 13px;
}
</style>
