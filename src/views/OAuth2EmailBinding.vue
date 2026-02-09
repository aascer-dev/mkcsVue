<template>
  <div class="email-binding-page">
    <div class="binding-card">
      <div class="card-header">
        <el-icon size="40" class="icon-badge"><Message /></el-icon>
        <h2>绑定邮箱</h2>
        <p>完成邮箱绑定以继续注册</p>
      </div>

      <!-- GitHub邮箱确认区域 -->
      <div v-if="hasGitHubEmail && !showCustomEmail" class="github-email-section">
        <div class="email-info">
          <div class="label">GitHub已验证邮箱</div>
          <div class="email-value">
            <el-icon><CircleCheck /></el-icon>
            {{ suggestedEmail }}
          </div>
          <div class="hint">此邮箱已通过GitHub验证，可直接使用</div>
        </div>

        <div class="button-group">
          <el-button 
            type="primary" 
            size="large"
            :loading="confirming"
            @click="confirmGitHubEmail"
            class="confirm-btn"
          >
            确认使用此邮箱
          </el-button>
          <el-button 
            size="large"
            @click="showCustomEmail = true"
            class="other-btn"
          >
            使用其他邮箱
          </el-button>
        </div>
      </div>

      <!-- 自定义邮箱输入区域 -->
      <div v-if="!hasGitHubEmail || showCustomEmail" class="custom-email-section">
        <el-form :model="form" :rules="rules" ref="formRef" class="email-form">
          <el-form-item prop="email" label="邮箱地址">
            <el-input
              v-model="form.email"
              size="large"
              placeholder="请输入您的邮箱地址"
              :prefix-icon="Message"
              class="glass-input"
            />
          </el-form-item>

          <el-form-item prop="code" label="验证码" v-if="codeSent">
            <div class="code-input-group">
              <el-input
                v-model="form.code"
                size="large"
                placeholder="请输入6位验证码"
                maxlength="6"
                class="glass-input code-input"
              />
              <el-button
                size="large"
                :loading="sendingCode"
                :disabled="cooldown > 0"
                @click="sendCode"
                class="send-code-btn"
              >
                {{ cooldown > 0 ? `${cooldown}s` : codeSent ? '重新发送' : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <div class="button-group">
            <el-button
              v-if="!codeSent"
              type="primary"
              size="large"
              :loading="sendingCode"
              @click="sendCode"
              class="send-btn"
            >
              发送验证码
            </el-button>
            <el-button
              v-else
              type="primary"
              size="large"
              :loading="verifying"
              :disabled="form.code.length !== 6"
              @click="verifyEmail"
              class="verify-btn"
            >
              验证并继续
            </el-button>
            <el-button
              v-if="showCustomEmail && hasGitHubEmail"
              size="large"
              @click="showCustomEmail = false"
            >
              返回
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Message, CircleCheck } from '@element-plus/icons-vue'
import { 
  sendOAuth2VerificationCode, 
  verifyOAuth2Email,
  initiateOAuth2Merge
} from '@/api/auth.js'

const router = useRouter()
const route = useRoute()

const formRef = ref()
const tempUserId = ref('')
const suggestedEmail = ref('')
const suggestedUsername = ref('')
const hasGitHubEmail = ref(false)
const showCustomEmail = ref(false)

const confirming = ref(false)
const sendingCode = ref(false)
const verifying = ref(false)
const codeSent = ref(false)
const cooldown = ref(0)

const form = reactive({
  email: '',
  code: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

onMounted(() => {
  // 获取URL参数
  tempUserId.value = route.query.tempUserId || ''
  suggestedEmail.value = route.query.suggestedEmail || ''
  suggestedUsername.value = route.query.suggestedUsername || ''
  hasGitHubEmail.value = route.query.hasGitHubEmail === 'true'

  if (!tempUserId.value) {
    ElMessage.error('缺少必要的参数')
    router.push('/login')
    return
  }

  // 如果没有GitHub邮箱，设置建议邮箱为输入值
  if (!hasGitHubEmail.value && suggestedEmail.value) {
    form.email = suggestedEmail.value
  }
})

// 确认GitHub邮箱
const confirmGitHubEmail = async () => {
  confirming.value = true
  try {
    await verifyOAuth2Email(tempUserId.value, suggestedEmail.value, null, true)
    ElMessage.success('邮箱确认成功')
    // 跳转到用户名选择页面
    router.push({
      path: '/oauth2/username-selection',
      query: {
        tempUserId: tempUserId.value,
        suggestedUsername: suggestedUsername.value
      }
    })
  } catch (error) {
    console.error('确认邮箱失败:', error)
    if (error.code === 1106) {
      // 邮箱冲突，提示合并
      await handleEmailConflict(suggestedEmail.value)
    } else {
      ElMessage.error(error.message || '确认失败，请重试')
    }
  } finally {
    confirming.value = false
  }
}

// 发送验证码
const sendCode = async () => {
  if (!formRef.value) return

  // 验证邮箱格式
  try {
    await formRef.value.validateField('email')
  } catch {
    return
  }

  sendingCode.value = true
  try {
    await sendOAuth2VerificationCode(tempUserId.value, form.email)
    ElMessage.success('验证码已发送到您的邮箱')
    codeSent.value = true

    // 开始倒计时
    cooldown.value = 60
    const timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    sendingCode.value = false
  }
}

// 验证邮箱
const verifyEmail = async () => {
  if (!formRef.value) return

  // 验证表单
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  verifying.value = true
  try {
    await verifyOAuth2Email(tempUserId.value, form.email, form.code, false)
    ElMessage.success('邮箱验证成功')
    // 跳转到用户名选择页面
    router.push({
      path: '/oauth2/username-selection',
      query: {
        tempUserId: tempUserId.value,
        suggestedUsername: suggestedUsername.value
      }
    })
  } catch (error) {
    console.error('验证邮箱失败:', error)
    if (error.code === 1106) {
      // 邮箱冲突，提示合并
      await handleEmailConflict(form.email)
    } else if (error.code === 2107) {
      ElMessage.error('验证码已过期，请重新发送')
    } else if (error.code === 2108) {
      ElMessage.error('验证码不正确，请检查后重试')
    } else {
      ElMessage.error(error.message || '验证失败，请重试')
    }
  } finally {
    verifying.value = false
  }
}

// 处理邮箱冲突
const handleEmailConflict = async (email) => {
  try {
    const result = await ElMessageBox.confirm(
      '该邮箱已被其他账号使用。这是您的现有账号吗？点击"确定"将验证身份后合并账号。',
      '邮箱冲突',
      {
        confirmButtonText: '合并账号',
        cancelButtonText: '使用其他邮箱',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      // 发起合并流程（interceptor已解包data）
      const mergeResult = await initiateOAuth2Merge(tempUserId.value, email)
      if (mergeResult && mergeResult.requiresMerge) {
        ElMessage.info(`检测到已有账号 ${mergeResult.existingUsername}，请通过账号恢复流程验证身份`)
        // TODO: 实现账号恢复流程
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('请使用其他邮箱地址')
      form.email = ''
      form.code = ''
      codeSent.value = false
    }
  }
}
</script>

<style scoped>
.email-binding-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(160deg, #f0fdfa 0%, #ecfeff 40%, #f0f9ff 100%);
}

.binding-card {
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

.github-email-section,
.custom-email-section {
  margin-top: 24px;
}

.email-info {
  background: rgba(20, 184, 166, 0.08);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.email-info .label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.email-info .email-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0d9488;
  margin-bottom: 8px;
}

.email-info .email-value .el-icon {
  color: #14b8a6;
}

.email-info .hint {
  font-size: 12px;
  color: #6b7280;
}

.email-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
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

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input {
  flex: 1;
}

.code-input :deep(.el-input__inner) {
  text-align: center;
  font-size: 18px;
  letter-spacing: 6px;
  font-weight: 600;
}

.send-code-btn {
  flex-shrink: 0;
  min-width: 110px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
  border: none;
  color: white;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.confirm-btn,
.send-btn,
.verify-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
  border: none;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.confirm-btn:hover,
.send-btn:hover,
.verify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4);
}

.other-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.other-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #d1d5db;
}
</style>
