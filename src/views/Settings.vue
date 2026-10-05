<template>
  <div class="settings-page">
    <div class="settings-container">
      <div class="settings-header">
        <h1>账号设置</h1>
        <p>管理您的个人信息、存储空间和账号关联</p>
        <el-button class="close-btn" circle @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 主题切换卡片
      <div class="settings-card">
        <div class="card-title">
          <el-icon><Sunny /></el-icon>
          <span>主题设置</span>
        </div>

        <div class="setting-item">
          <div class="item-label">暗黑模式</div>
          <div class="item-content theme-switch">
            <div class="theme-switch-info">
              <el-icon :size="24" class="theme-icon">
                <Moon v-if="themeStore.isDark" />
                <Sunny v-else />
              </el-icon>
              <div>
                <div class="theme-title">{{ themeStore.isDark ? '暗黑模式' : '明亮模式' }}</div>
                <div class="theme-desc">{{ themeStore.isDark ? '减少眼睛疲劳，适合暗光环境' : '明亮清晰，适合日常使用' }}</div>
              </div>
            </div>
            <el-switch
              v-model="themeStore.isDark"
              size="large"
              inline-promp
              :active-icon="Moon"
              :inactive-icon="Sunny"
            />
          </div>
        </div>
      </div> -->

      <!-- 基本信息卡片 -->
      <div class="settings-card">
        <div class="card-title">
          <el-icon><User /></el-icon>
          <span>基本信息</span>
        </div>

        <!-- 头像设置 -->
        <div class="setting-item">
          <div class="item-label">头像</div>
          <div class="item-content avatar-section">
            <el-avatar :size="80" :src="previewAvatarUrl || form.avatarUrl" :key="previewAvatarUrl || form.avatarUrl">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="avatar-actions">
              <el-upload
                ref="avatarUploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarChange"
              >
                <el-button type="primary" plain>
                  <el-icon><Upload /></el-icon>
                  选择图片
                </el-button>
              </el-upload>
              <div v-if="avatarFile" class="avatar-file-info">
                <span class="avatar-filename">{{ avatarFile.name }}</span>
                <span v-if="compressing" class="compressing-hint">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  压缩中...
                </span>
                <span v-if="updatingAvatar" class="compressing-hint">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  上传中...
                </span>
              </div>
              <div v-if="avatarFile" class="button-group">
                <el-button
                  @click="resetAvatar"
                  :disabled="updatingAvatar"
                >
                  重置
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 昵称设置 -->
        <div class="setting-item">
          <div class="item-label">昵称</div>
          <div class="item-content">
            <el-input
              v-model="form.nickname"
              placeholder="输入昵称"
              maxlength="50"
              show-word-limit
              class="glass-input"
              style="max-width: 400px;"
            >
              <template #prepend>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
            <div class="button-group" style="margin-top: 12px;">
              <el-button
                type="primary"
                :loading="updatingNickname"
                :disabled="!form.nickname || form.nickname === (userStore.userInfo?.nickname || '')"
                @click="updateNickname"
              >
                更新昵称
              </el-button>
              <el-button
                v-if="form.nickname !== (userStore.userInfo?.nickname || '')"
                @click="form.nickname = userStore.userInfo?.nickname || ''"
              >
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 邮箱设置 -->
        <div class="setting-item">
          <div class="item-label">邮箱</div>
          <div class="item-content">
            <el-input
              v-model="form.email"
              placeholder="输入邮箱"
              maxlength="100"
              class="glass-input"
              style="max-width: 400px;"
            >
              <template #prepend>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
            <div class="button-group" style="margin-top: 12px;">
              <el-button
                type="primary"
                :loading="updatingEmail"
                :disabled="!form.email || form.email === (userStore.userInfo?.email || '')"
                @click="updateEmail"
              >
                更新邮箱
              </el-button>
              <el-button
                v-if="form.email !== (userStore.userInfo?.email || '')"
                @click="form.email = userStore.userInfo?.email || ''"
              >
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 用户名显示 -->
        <div class="setting-item">
          <div class="item-label">用户名</div>
          <div class="item-content">
            <el-input
              :model-value="userStore.userInfo?.username"
              disabled
              class="glass-input"
              style="max-width: 400px;"
            >
              <template #prepend>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
            <div class="hint-text">用户名不可修改</div>
          </div>
        </div>

        <!-- 存储使用情况 -->
        <div class="setting-item">
          <div class="item-label">存储空间</div>
          <div class="item-content">
            <div class="storage-info">
              <el-progress
                :percentage="userStore.storagePercentage"
                :stroke-width="12"
                :color="getStorageColor(userStore.storagePercentage)"
              >
                <span class="storage-percentage">{{ userStore.storagePercentage }}%</span>
              </el-progress>
              <div class="storage-details">
                <span class="storage-used">已使用 {{ formatFileSize(userStore.usedStorage) }}</span>
                <span class="storage-divider">/</span>
                <span class="storage-total">总容量 {{ formatFileSize(userStore.totalStorage) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全设置卡片 -->
      <div class="settings-card">
        <div class="card-title">
          <el-icon><Edit /></el-icon>
          <span>安全设置</span>
        </div>

        <!-- 修改密码按钮 -->
        <div class="setting-item">
          <div class="item-label">修改密码</div>
          <div class="item-content">
            <p class="security-tip">定期修改密码可以提高账户安全性</p>
            <el-button type="primary" @click="showChangePasswordDialog = true">
              <el-icon><Edit /></el-icon>
              修改密码
            </el-button>
          </div>
        </div>
      </div>

      <!-- 存储空间管理卡片 -->
      <div class="settings-card">
        <div class="card-title">
          <el-icon><Box /></el-icon>
          <span>存储空间管理</span>
        </div>

        <div v-if="loadingBuckets" class="setting-item">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else>
          <!-- 自己的存储空间 -->
          <div v-if="myOwnBuckets.length > 0" style="margin-bottom: 24px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 600;">
              <el-icon size="16" style="margin-right: 6px; vertical-align: -2px;"><Box /></el-icon>
              我的存储空间
            </div>
            <div
              v-for="bucket in myOwnBuckets"
              :key="bucket.id"
              class="bucket-item"
              :class="{ 'is-default': String(bucket.id) === String(userStore.userInfo?.currentBucketId) }"
            >
              <div class="bucket-info">
                <div class="bucket-icon">
                  <el-icon size="24"><Box /></el-icon>
                </div>
                <div class="bucket-details">
                  <div class="bucket-name">
                    {{ bucket.description || bucket.name }}
                    <el-tag v-if="String(bucket.id) === String(userStore.userInfo?.currentBucketId)" size="small" type="success">默认</el-tag>
                    <el-tag v-if="bucket.status === 0" size="small" type="danger">禁用</el-tag>
                    <el-tag v-if="bucket.status === 2" size="small" type="warning">只读</el-tag>
                  </div>
                  <div class="bucket-storage">
                    <el-progress
                      :percentage="getStoragePercentage(bucket)"
                      :stroke-width="6"
                      class="bucket-progress"
                    />
                    <span class="storage-text">
                      {{ formatFileSize(bucket.usedStorage || 0) }} / {{ formatFileSize(bucket.totalStorage || 0) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="bucket-actions">
                <el-button
                  v-if="String(bucket.id) !== String(userStore.userInfo?.currentBucketId)"
                  type="primary"
                  plain
                  size="small"
                  :loading="String(settingDefault) === String(bucket.id)"
                  @click="handleSetDefault(bucket.id)"
                >
                  设为默认
                </el-button>
                <el-button
                  size="small"
                  plain
                  @click="handleEditBucket(bucket)"
                >
                  编辑
                </el-button>
              </div>
            </div>
          </div>

          <!-- 共享的存储空间 -->
          <div v-if="mySharedBuckets.length > 0">
            <div style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 600;">
              <el-icon size="16" style="margin-right: 6px; vertical-align: -2px;"><Link /></el-icon>
              他人共享的存储空间
            </div>
            <div
              v-for="bucket in mySharedBuckets"
              :key="bucket.id"
              class="bucket-item"
              :class="{ 'is-default': String(bucket.id) === String(userStore.userInfo?.currentBucketId) }"
            >
              <div class="bucket-info">
                <div class="bucket-icon">
                  <el-icon size="24"><Box /></el-icon>
                </div>
                <div class="bucket-details">
                  <div class="bucket-name">
                    {{ bucket.description || bucket.name }}
                    <el-tag v-if="String(bucket.id) === String(userStore.userInfo?.currentBucketId)" size="small" type="success">默认</el-tag>
                    <el-tag size="small" type="info">共享</el-tag>
                    <el-tag v-if="bucket.status === 0" size="small" type="danger">禁用</el-tag>
                    <el-tag v-if="bucket.status === 2" size="small" type="warning">只读</el-tag>
                  </div>
                  <div class="bucket-storage">
                    <el-progress
                      :percentage="getStoragePercentage(bucket)"
                      :stroke-width="6"
                      class="bucket-progress"
                    />
                    <span class="storage-text">
                      {{ formatFileSize(bucket.usedStorage || 0) }} / {{ formatFileSize(bucket.totalStorage || 0) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="bucket-actions">
                <el-button
                  v-if="String(bucket.id) !== String(userStore.userInfo?.currentBucketId)"
                  type="primary"
                  plain
                  size="small"
                  :loading="String(settingDefault) === String(bucket.id)"
                  @click="handleSetDefault(bucket.id)"
                >
                  设为默认
                </el-button>
              </div>
            </div>
          </div>

          <el-empty
            v-if="myBuckets.length === 0"
            description="暂无存储空间"
            :image-size="80"
          >
            <template #default>
              <div>
                <p>暂无存储空间</p>
                <p style="font-size: 12px; color: #999; margin: 8px 0 0 0;">
                  <span v-if="userStore.hasRole('ROLE_VIP')">点击下方创建新的存储空间</span>
                  <span v-else>升级至VIP可创建存储空间</span>
                </p>
                <el-button
                  v-if="userStore.hasRole('ROLE_VIP')"
                  key="empty-btn-vip"
                  type="primary"
                  :loading="creatingBucket"
                  @click="showCreateBucket = true"
                  style="margin-top: 16px;"
                >
                  <el-icon><Plus /></el-icon>
                  创建存储空间
                </el-button>
                <el-button
                  v-else
                  key="empty-btn-non-vip"
                  type="primary"
                  disabled
                  style="margin-top: 16px;"
                >
                  <el-icon><Plus /></el-icon>
                  创建存储空间 (VIP专享)
                </el-button>
              </div>
            </template>
          </el-empty>

          <div v-else style="margin-top: 16px;">
            <el-button
              v-if="userStore.hasRole('ROLE_VIP')"
              key="btn-vip"
              type="primary"
              :loading="creatingBucket"
              @click="showCreateBucket = true"
            >
              <el-icon><Plus /></el-icon>
              创建存储空间
            </el-button>
            <el-tooltip
              v-else
              key="btn-non-vip"
              content="仅VIP用户可创建存储空间"
              placement="top"
            >
              <el-button
                type="primary"
                disabled
              >
                <el-icon><Plus /></el-icon>
                创建存储空间
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- OAuth 账号关联卡片 -->
      <div v-if="oauthEnabled" class="settings-card">
        <div class="card-title">
          <el-icon><Link /></el-icon>
          <span>账号关联</span>
        </div>

        <div class="setting-item" v-if="loadingOAuthBindings">
          <el-skeleton :rows="2" animated />
        </div>

        <div v-else>
          <div
            v-for="binding in oauthBindings"
            :key="binding.provider"
            class="oauth-identity-item"
          >
            <div class="identity-info">
              <div class="provider-icon">
                <svg v-if="binding.provider === 'github'" viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
                </svg>
                <el-icon v-else size="32"><Platform /></el-icon>
              </div>
              <div class="identity-details">
                <div class="provider-name">
                  {{ getProviderDisplayName(binding.provider) }}
                </div>
                <div class="identity-meta">
                  绑定于 {{ formatDate(binding.createdAt) }}
                </div>
              </div>
            </div>
            <el-button
              type="danger"
              plain
              :loading="unbindingProvider === binding.provider"
              @click="handleUnbind(binding.provider)"
            >
              解除绑定
            </el-button>
          </div>

          <el-empty
            v-if="oauthBindings.length === 0"
            description="暂无关联的第三方账号"
            :image-size="80"
          />
        </div>
      </div>
    </div>

    <!-- 新建存储空间对话框 -->
    <el-dialog v-model="showCreateBucket" title="创建存储空间" width="450px" :close-on-click-modal="false">
      <el-form :model="bucketForm" :rules="bucketRules" ref="bucketFormRef" label-width="80px">
        <el-form-item label="空间名称" prop="bucketName">
          <el-input v-model="bucketForm.bucketName" placeholder="请输入存储空间名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="bucketForm.description" type="textarea" :rows="3" placeholder="请输入描述（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateBucket = false">取消</el-button>
        <el-button type="primary" :loading="creatingBucket" @click="handleCreateBucket">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑存储空间对话框 -->
    <el-dialog v-model="showEditBucket" title="编辑存储空间" width="450px" :close-on-click-modal="false">
      <el-form :model="editBucketForm" label-width="80px">
        <el-form-item label="空间名称">
          <el-input :model-value="editBucketForm.name" disabled />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editBucketForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditBucket = false">取消</el-button>
        <el-button type="primary" :loading="editingBucket" @click="handleUpdateBucket">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showChangePasswordDialog" title="修改密码" width="500px" :close-on-click-modal="false" @close="resetPasswordForm">
      <!-- 第一步：输入新密码 -->
      <div v-if="passwordStep === 1">
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRulesInDialog"
          label-width="100px"
          label-position="left"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-64位）"
              show-password
              class="glass-input"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              class="glass-input"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 第二步：输入验证码 -->
      <div v-else-if="passwordStep === 2">
        <div class="step-info">
          <el-icon><Message /></el-icon>
          <div class="step-info-text">
            <p>验证码已发送至您的邮箱</p>
            <p class="email-display">{{ userStore.userInfo?.email }}</p>
          </div>
        </div>

        <el-form
          ref="verificationFormRef"
          :model="verificationForm"
          :rules="verificationRules"
          label-width="100px"
          label-position="left"
          style="margin-top: 16px;"
        >
          <el-form-item label="验证码" prop="code">
            <div class="code-input-group">
              <el-input
                v-model="verificationForm.code"
                placeholder="请输入6位验证码"
                maxlength="6"
                class="glass-input code-input"
              />
              <el-button
                type="primary"
                :loading="sendingCode"
                :disabled="codeCooldown > 0 || sendingCode"
                @click="handleSendVerificationCode"
                class="send-code-btn"
              >
                {{ codeCooldown > 0 ? `${codeCooldown}s` : '发送' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClosePasswordDialog">取消</el-button>
          <template v-if="passwordStep === 1">
            <el-button type="primary" :loading="changingPassword" @click="handleNextStep">下一步</el-button>
          </template>
          <template v-else-if="passwordStep === 2">
            <el-button @click="handleBackToStep1">上一步</el-button>
            <el-button type="primary" :loading="confirmingPassword" @click="handleConfirmChangePassword">确认修改</el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Picture, Edit, Link, Platform, Box, Plus, Upload, Message, Refresh, Loading, Close, Sunny, Moon, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'
import { useThemeStore } from '@/stores/theme.js'
import { useRouter } from 'vue-router'
import {
  uploadUserAvatar,
  updateUserProfile,
  checkEmailAvailability,
  getOAuthBindings,
  unbindOAuthProvider,
  resetPassword,
  sendVerificationCode,
  getVerificationCooldown
} from '@/api/auth.js'
import {
  getMyBuckets,
  createBucket,
  updateBucket,
  deleteBucket,
  setDefaultBucket,
  syncBuckets
} from '@/api/user.js'
import { formatFileSize } from '@/utils/index.js'
import { compressImage, validateImageFile, needsCompression } from '@/utils/imageCompression.js'
import { API_CONFIG } from '@/config/api.js'

const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()

// 关闭设置页面
const handleClose = () => {
  router.push('/files')
}

// ====== 基本信息 ======
const form = reactive({
  avatarUrl: '',
  nickname: '',
  email: ''
})

const avatarFile = ref(null)
const previewAvatarUrl = ref('')
const avatarUploadRef = ref()
const updatingAvatar = ref(false)
const updatingNickname = ref(false)
const updatingEmail = ref(false)
const compressing = ref(false)

// ====== 修改密码 ======
const passwordStep = ref(1) // 1: 输入密码, 2: 输入验证码
const showChangePasswordDialog = ref(false)
const changingPassword = ref(false)
const confirmingPassword = ref(false)
const sendingCode = ref(false)
const codeCooldown = ref(0)
const passwordFormRef = ref()
const verificationFormRef = ref()

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const verificationForm = reactive({
  code: ''
})

const passwordRulesInDialog = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码长度为6-64个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const verificationRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ]
}

// ====== 存储空间 ======
const loadingBuckets = ref(true)
const myBuckets = ref([])
const showCreateBucket = ref(false)
const showEditBucket = ref(false)
const creatingBucket = ref(false)
const editingBucket = ref(false)
const settingDefault = ref(null)
const deletingBucket = ref(null)
const syncingBuckets = ref(false)
const bucketFormRef = ref()

const bucketForm = reactive({
  bucketName: '',
  description: ''
})

const editBucketForm = reactive({
  id: null,
  name: '',
  description: ''
})

const bucketRules = {
  bucketName: [
    { required: true, message: '请输入存储空间名称', trigger: 'blur' }
  ]
}

// ====== OAuth ======
const loadingOAuthBindings = ref(true)
const unbindingProvider = ref('')
const oauthBindings = ref([])
const oauthEnabled = import.meta.env.VITE_ENABLE_OAUTH === 'true'

// 计算属性：分组存储桶
const myOwnBuckets = computed(() => {
  return myBuckets.value.filter(bucket => !bucket.bucketType || bucket.bucketType === 0)
})

const mySharedBuckets = computed(() => {
  return myBuckets.value.filter(bucket => bucket.bucketType === 1)
})

// 初始化表单数据的函数
const initFormData = () => {
  if (userStore.userInfo) {
    form.avatarUrl = userStore.userInfo.avatarUrl || ''
    form.nickname = userStore.userInfo.nickname || ''
    form.email = userStore.userInfo.email || ''
    previewAvatarUrl.value = form.avatarUrl
  }
}

// 监听用户信息变化，自动更新表单
watch(
  () => userStore.userInfo,
  (newUserInfo) => {
    if (newUserInfo) {
      initFormData()
    }
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  initFormData()
  loadMyBuckets()
  if (oauthEnabled) {
    loadOAuthBindings()
  } else {
    loadingOAuthBindings.value = false
  }
})

// ====== 头像 ======
const beforeAvatarUpload = (file) => {
  // 验证文件
  const validation = validateImageFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return false
  }
  return true
}

const handleAvatarChange = async (uploadFile) => {
  const file = uploadFile.raw

  // 验证文件
  const validation = validateImageFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    avatarUploadRef.value?.clearFiles()
    return
  }

  try {
    // 检查是否需要压缩
    if (needsCompression(file)) {
      compressing.value = true
      ElMessage.info(`图片较大 (${formatFileSize(file.size)})，正在自动压缩...`)

      // 压缩图片
      const compressedFile = await compressImage(file)
      avatarFile.value = compressedFile
      previewAvatarUrl.value = URL.createObjectURL(compressedFile)

      ElMessage.success(`压缩完成！${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`)
    } else {
      avatarFile.value = file
      previewAvatarUrl.value = URL.createObjectURL(file)
    }

    // 文件处理完成后自动上传
    await performAvatarUpload()
  } catch (error) {
    console.error('图片处理失败:', error)
    ElMessage.error('图片处理失败: ' + error.message)
    avatarFile.value = null
    avatarUploadRef.value?.clearFiles()
  } finally {
    compressing.value = false
  }
}

const performAvatarUpload = async () => {
  updatingAvatar.value = true
  try {
    if (!avatarFile.value) {
      return
    }

    const userId = userStore.userInfo?.id
    if (!userId) {
      ElMessage.error('获取用户信息失败')
      return
    }

    await uploadUserAvatar(userId, avatarFile.value)
    const updatedUser = await userStore.refreshUserInfo()
    form.avatarUrl = updatedUser.avatarUrl || ''
    previewAvatarUrl.value = form.avatarUrl
    ElMessage.success('头像上传成功')
    avatarFile.value = null
    avatarUploadRef.value?.clearFiles()
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error(error.message || '上传失败')
  } finally {
    updatingAvatar.value = false
  }
}

const updateAvatar = async () => {
  await performAvatarUpload()
}

const resetAvatar = () => {
  avatarFile.value = null
  form.avatarUrl = userStore.userInfo?.avatarUrl || ''
  previewAvatarUrl.value = ''
  // 强制使用原始头像
  setTimeout(() => {
    previewAvatarUrl.value = form.avatarUrl
  }, 0)
}

// ====== 昵称 ======
const updateNickname = async () => {
  if (!form.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }

  updatingNickname.value = true
  try {
    await updateUserProfile({ nickname: form.nickname })
    userStore.setUserInfo({
      ...userStore.userInfo,
      nickname: form.nickname
    })
    ElMessage.success('昵称更新成功')
  } catch (error) {
    console.error('更新昵称失败:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    updatingNickname.value = false
  }
}

// ====== 邮箱 ======
const updateEmail = async () => {
  if (!form.email.trim()) {
    ElMessage.warning('请输入邮箱')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }

  updatingEmail.value = true
  try {
    // 先检查邮箱是否可用，排除当前用户ID
    const availabilityResult = await checkEmailAvailability(form.email, userStore.userInfo?.id)

    // 检查是否可用，通常返回结果会包含available字段
    const isAvailable = availabilityResult?.available !== false && availabilityResult !== false

    if (!isAvailable) {
      ElMessage.error('该邮箱已被其他用户使用，请使用其他邮箱')
      return
    }

    // 邮箱可用，保存待变更的邮箱到临时存储
    sessionStorage.setItem('pendingEmail', form.email)

    ElMessage.success('跳转到验证页面')

    // 跳转到邮箱变更验证页面，页面进入时会自动发送验证码
    router.push({
      name: 'ChangeEmailVerification',
      query: { email: form.email }
    })
  } catch (error) {
    console.error('邮箱更新失败:', error)
    ElMessage.error(error.message || '操作失败，请稍后重试')
  } finally {
    updatingEmail.value = false
  }
}

// ====== 修改密码 ======
const startCooldown = (seconds = 60) => {
  codeCooldown.value = seconds
  const timer = setInterval(() => {
    codeCooldown.value--
    if (codeCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleClosePasswordDialog = () => {
  showChangePasswordDialog.value = false
  // 重置状态
  passwordStep.value = 1
  resetPasswordForm()
}

const handleNextStep = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    // 切换到验证码步骤
    passwordStep.value = 2

    // 自动发送验证码
    handleSendVerificationCode()
  })
}

const handleSendVerificationCode = async () => {
  const email = userStore.userInfo?.email
  if (!email) {
    ElMessage.error('无法获取邮箱地址')
    return
  }

  sendingCode.value = true
  try {
    const cooldownResult = await getVerificationCooldown(email, 'CHANGE_PASSWORD')
    if (!cooldownResult.canSend) {
      const leftSeconds = cooldownResult.remainingSeconds || 60
      startCooldown(leftSeconds)
      ElMessage.warning(`验证码发送过于频繁，请${leftSeconds}秒后再试`)
      return
    }

    // 发送验证码
    await sendVerificationCode(email, 'CHANGE_PASSWORD')
    ElMessage.success('验证码已发送到您的邮箱')
    startCooldown(60)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '发送验证码失败，请重试')
  } finally {
    sendingCode.value = false
  }
}

const handleConfirmChangePassword = async () => {
  if (!verificationFormRef.value) return

  await verificationFormRef.value.validate(async (valid) => {
    if (!valid) return

    confirmingPassword.value = true
    try {
      const email = userStore.userInfo?.email
      if (!email) {
        ElMessage.error('无法获取邮箱地址')
        return
      }

      // 调用重置密码接口（和忘记密码使用同一个接口）
      await resetPassword({
        email: email,
        code: verificationForm.code,
        password: passwordForm.newPassword,
        verificationCodeType: 'CHANGE_PASSWORD'
      })

      ElMessage.success('密码修改成功，请重新登录')

      // 清除本地状态，强制用户重新登录
      await userStore.logout()

      // 跳转到登录页面
      router.push({
        path: '/login',
        query: { message: '密码已修改，请使用新密码登录' }
      })
    } catch (error) {
      console.error('修改密码失败:', error)
      ElMessage.error(error.message || '修改密码失败，请稍后重试')
    } finally {
      confirmingPassword.value = false
    }
  })
}

const handleBackToStep1 = () => {
  passwordStep.value = 1
  verificationForm.code = ''
  codeCooldown.value = 0
}

const resetPasswordForm = () => {
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  verificationForm.code = ''
}

// ====== 存储空间管理 ======
const loadMyBuckets = async () => {
  loadingBuckets.value = true
  try {
    const result = await getMyBuckets()
    const bucketsList = Array.isArray(result) ? result : []
    myBuckets.value = bucketsLis
    // 调用store方法来计算存储空间
    userStore.setMyBuckets(bucketsList)
  } catch (error) {
    console.error('加载存储空间失败:', error)
  } finally {
    loadingBuckets.value = false
  }
}

const getStoragePercentage = (bucket) => {
  const total = Number(bucket.totalStorage) || 0
  const used = Number(bucket.usedStorage) || 0
  if (total <= 0) return 0
  const percentage = Math.round((used / total) * 100)
  return isNaN(percentage) ? 0 : Math.min(Math.max(percentage, 0), 100)
}

// 根据存储使用百分比返回颜色
const getStorageColor = (percentage) => {
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

const handleCreateBucket = async () => {
  // 检查VIP权限
  if (!userStore.hasRole('ROLE_VIP')) {
    ElMessage.error('仅VIP用户可创建存储空间')
    return
  }

  if (!bucketFormRef.value) return
  await bucketFormRef.value.validate(async (valid) => {
    if (!valid) return
    creatingBucket.value = true
    try {
      await createBucket({
        bucketName: bucketForm.bucketName,
        description: bucketForm.description
      })
      ElMessage.success('存储空间创建成功')
      showCreateBucket.value = false
      bucketForm.bucketName = ''
      bucketForm.description = ''
      await loadMyBuckets()
    } catch (error) {
      console.error('创建存储空间失败:', error)
      ElMessage.error(error.message || '创建失败')
    } finally {
      creatingBucket.value = false
    }
  })
}

const handleEditBucket = (bucket) => {
  editBucketForm.id = bucket.id
  editBucketForm.name = bucket.name
  editBucketForm.description = bucket.description || ''
  showEditBucket.value = true
}

const handleUpdateBucket = async () => {
  editingBucket.value = true
  try {
    await updateBucket(editBucketForm.id, {
      description: editBucketForm.description
    })
    ElMessage.success('存储空间更新成功')
    showEditBucket.value = false
    await loadMyBuckets()
  } catch (error) {
    console.error('更新存储空间失败:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    editingBucket.value = false
  }
}

const handleSetDefault = async (bucketId) => {
  settingDefault.value = bucketId
  try {
    await setDefaultBucket(bucketId)
    userStore.updateCurrentBucket(bucketId)
    ElMessage.success('默认存储空间设置成功')
    await loadMyBuckets()
  } catch (error) {
    console.error('设置默认存储空间失败:', error)
    ElMessage.error(error.message || '设置失败')
  } finally {
    settingDefault.value = null
  }
}

const handleDeleteBucket = async (bucket) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除存储桶"${bucket.name}"吗？该操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    deletingBucket.value = bucket.id
    try {
      await deleteBucket(bucket.id)
      ElMessage.success('存储桶删除成功')
      await loadMyBuckets()
    } catch (error) {
      console.error('删除存储桶失败:', error)
      ElMessage.error(error.message || '删除失败')
    } finally {
      deletingBucket.value = null
    }
  } catch {
    // 用户取消
  }
}

const handleSyncBuckets = async () => {
  syncingBuckets.value = true
  try {
    await syncBuckets()
    ElMessage.success('同步成功')
    await loadMyBuckets()
  } catch (error) {
    console.error('同步存储桶失败:', error)
    ElMessage.error(error.message || '同步失败')
  } finally {
    syncingBuckets.value = false
  }
}

// ====== OAuth ======
const loadOAuthBindings = async () => {
  loadingOAuthBindings.value = true
  try {
    const result = await getOAuthBindings()
    oauthBindings.value = Array.isArray(result?.bindings) ? result.bindings : []
  } catch (error) {
    console.error('加载OAuth绑定失败:', error)
  } finally {
    loadingOAuthBindings.value = false
  }
}

const handleUnbind = async (provider) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除与 ${getProviderDisplayName(provider)} 的绑定吗？`,
      '解除绑定',
      {
        confirmButtonText: '确定解除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    unbindingProvider.value = provider
    try {
      await unbindOAuthProvider(provider)
      ElMessage.success('解除绑定成功')
      await loadOAuthBindings()
    } catch (error) {
      console.error('解除绑定失败:', error)
      ElMessage.error(error.message || '解除绑定失败')
    } finally {
      unbindingProvider.value = ''
    }
  } catch {
    // 用户取消
  }
}

// ====== 工具函数 ======
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  })
}

const getProviderDisplayName = (provider) => {
  const names = { github: 'GitHub', google: 'Google', wechat: '微信', weibo: '微博' }
  return names[provider] || provider
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 64px);
  background: linear-gradient(160deg, #f0fdfa 0%, #ecfeff 40%, #f0f9ff 100%);
  padding: 40px 20px;
}

.settings-container {
  max-width: 900px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 32px;
  position: relative;
}

.settings-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.settings-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(209, 213, 219, 1);
  color: #4b5563;
  transition: all 0.2s ease;
  font-weight: 600;
}

.close-btn:hover {
  background: rgba(254, 226, 226, 0.9);
  border-color: #dc2626;
  color: #dc2626;
  transform: rotate(90deg);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.settings-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(13, 148, 136, 0.25);
}

.card-title .el-icon {
  font-size: 24px;
  color: #0d9488;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 主题切换 */
.theme-switch {
  flex-direction: row !important;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.theme-switch-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-icon {
  color: #14b8a6;
}

.theme-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.theme-desc {
  font-size: 13px;
  color: #6b7280;
}

.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-filename {
  font-size: 13px;
  color: #6b7280;
}

.compressing-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #14b8a6;
}

.compressing-hint .el-icon {
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 修改密码步骤 */
.step-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 8px;
  border-left: 3px solid #0ea5e9;
  margin-bottom: 16px;
}

.step-info .el-icon {
  font-size: 20px;
  color: #0ea5e9;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-info-text {
  flex: 1;
}

.step-info-text p {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
}

.step-info-text p:first-child {
  font-weight: 500;
  margin-bottom: 4px;
}

.email-display {
  font-weight: 600;
  color: #0d9488;
}

.code-input-group {
  display: flex;
  gap: 8px;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  white-space: nowrap;
  min-width: 100px;
}

.hint-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 安全提示 */
.security-tip {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

/* 存储信息 */
.storage-info {
  width: 100%;
  max-width: 500px;
}

.storage-percentage {
  font-weight: 600;
  font-size: 14px;
}

.storage-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 14px;
}

.storage-used {
  color: #111827;
  font-weight: 500;
}

.storage-divider {
  color: #9ca3af;
}

.storage-total {
  color: #6b7280;
}

.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 8px;
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

.glass-input :deep(.el-input-group__prepend) {
  background: rgba(20, 184, 166, 0.1);
  border: none;
  color: #14b8a6;
}

/* 存储桶 */
.bucket-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.bucket-item:hover {
  background: rgba(20, 184, 166, 0.05);
  border-color: rgba(20, 184, 166, 0.15);
}

.bucket-item.is-default {
  background: rgba(20, 184, 166, 0.08);
  border-color: rgba(20, 184, 166, 0.2);
}

.bucket-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.bucket-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 148, 136, 0.15);
  border-radius: 12px;
  color: #0d9488;
  flex-shrink: 0;
}

.bucket-details {
  flex: 1;
  min-width: 0;
}

.bucket-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bucket-meta {
  font-size: 13px;
  color: #4b5563;
  margin-top: 4px;
  font-weight: 500;
}

.bucket-storage {
  margin-top: 8px;
  max-width: 300px;
}

.bucket-progress {
  margin-bottom: 4px;
}

.bucket-progress :deep(.el-progress-bar__outer) {
  background: #e5e7eb;
}

.bucket-progress :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #14b8a6, #0ea5e9);
}

.storage-text {
  font-size: 12px;
  color: #6b7280;
}

.bucket-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* OAuth */
.oauth-identity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(20, 184, 166, 0.05);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.oauth-identity-item:hover {
  background: rgba(20, 184, 166, 0.1);
}

.identity-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.provider-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  color: #24292e;
}

.identity-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.provider-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.identity-meta {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.el-button--primary {
  background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
  border: none;
  color: #ffffff !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.el-button--primary .el-icon {
  color: #ffffff;
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.5);
  background: linear-gradient(135deg, #0f766e 0%, #0369a1 100%);
  color: #ffffff !important;
}

.el-button--primary:hover .el-icon {
  color: #ffffff;
}

.el-button--primary:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #115e59 0%, #075985 100%);
}

.el-button--primary:active .el-icon {
  color: #ffffff;
}

.el-button--primary.is-disabled {
  opacity: 0.5;
}

.el-button--primary.is-plain {
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #0d9488;
  color: #0d9488 !important;
  font-weight: 700;
}

.el-button--primary.is-plain:hover {
  background: rgba(13, 148, 136, 0.15);
  border-color: #0d9488;
  color: #0d9488 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

.el-button--primary.is-plain .el-icon {
  color: #0d9488;
  font-weight: bold;
}

.el-button {
  font-weight: 600;
  transition: all 0.2s ease;
}

.el-button.is-plain {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(209, 213, 219, 1);
  color: #374151;
  font-weight: 600;
}

.el-button.is-plain:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #0d9488;
  color: #0d9488;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.2);
}

.el-button--danger.is-plain {
  color: #dc2626;
  border-color: #fca5a5;
  background: rgba(255, 255, 255, 0.95);
  font-weight: 600;
}

.el-button--danger.is-plain:hover {
  background: rgba(254, 226, 226, 0.8);
  border-color: #dc2626;
  color: #dc2626;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

/* 增强标签对比度 */
:deep(.el-tag) {
  font-weight: 600;
  border: 1px solid currentColor;
}

:deep(.el-tag--success) {
  background-color: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

:deep(.el-tag--info) {
  background-color: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

:deep(.el-tag--danger) {
  background-color: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

:deep(.el-tag--warning) {
  background-color: #f59e0b;
  color: #ffffff;
  border-color: #f59e0b;
}

@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
  }

  .bucket-item {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .bucket-actions {
    justify-content: flex-end;
  }

  .oauth-identity-item {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

/* 对话框页脚 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
