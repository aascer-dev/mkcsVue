<template>
  <section class="shared-file">
    <div v-if="loading" class="shared-file__state"><el-icon class="is-loading" size="32"><Loading /></el-icon></div>
    <div v-else-if="!share" class="shared-file__state">
      <el-icon size="36"><Lock /></el-icon>
      <p>{{ error || '输入提取码以访问分享内容' }}</p>
      <el-form class="access-form" @submit.prevent="accessShare">
        <el-input v-model="password" maxlength="4" autocomplete="off" autocapitalize="off" placeholder="输入4位提取码" @input="sanitizeShareCode" @keyup.enter="accessShare" />
        <el-button type="primary" :loading="submitting" @click="accessShare">访问</el-button>
      </el-form>
      <p class="shared-file__hint">提取码区分大小写</p>
    </div>
    <div v-else-if="share" class="shared-file__content">
      <header class="shared-file__header">
        <el-icon size="30" class="shared-file__icon"><Folder v-if="share.file.isFolder" /><Document v-else /></el-icon>
        <div>
          <h1>{{ share.file.filename }}</h1>
          <p>{{ share.file.isFolder ? '共享文件夹' : formatFileSize(share.file.size) }}</p>
        </div>
      </header>
      <dl class="shared-file__details">
        <div><dt>创建时间</dt><dd>{{ formatDate(share.file.createdAt) }}</dd></div>
        <div><dt>有效期</dt><dd>{{ share.expiresAt ? formatDate(share.expiresAt) : '永久有效' }}</dd></div>
      </dl>
      <el-alert v-if="share.file.isFolder" class="shared-file__notice" type="info" :closable="false" show-icon title="文件夹公开下载暂不支持" />
      <el-button v-else class="shared-file__download" type="primary" size="large" :loading="downloading" @click="downloadFile">
        <el-icon><Download /></el-icon>下载文件
      </el-button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Download, Folder, Loading, Lock } from '@element-plus/icons-vue'
import { accessPublicShare } from '@/api/file.js'
import { formatFileSize } from '@/utils/fileUtils.js'

const route = useRoute()
const share = ref(null)
const password = ref('')
const loading = ref(true)
const submitting = ref(false)
const downloading = ref(false)
const error = ref('')

const accessShare = async () => {
  if (!/^[A-Za-z0-9]{4}$/.test(password.value)) {
    error.value = '请输入 4 位大小写字母或数字提取码'
    return
  }
  loading.value = false
  submitting.value = true
  error.value = ''
  try {
    share.value = await accessPublicShare(route.params.shareCode, password.value)
  } catch (requestError) {
    share.value = null
    error.value = requestError.code === 403 ? '该分享需要正确的提取码' : (requestError.message || '分享链接不可用')
  } finally {
    loading.value = false
    submitting.value = false
  }
}

const sanitizeShareCode = value => {
  password.value = String(value).replace(/[^A-Za-z0-9]/g, '').slice(0, 4)
}

const downloadFile = async () => {
  if (!share.value?.downloadUrl) return
  downloading.value = true
  window.location.assign(share.value.downloadUrl)
  window.setTimeout(() => { downloading.value = false }, 300)
}

const formatDate = value => value ? new Date(value).toLocaleString('zh-CN') : '-'

onMounted(() => { loading.value = false })
</script>

<style scoped>
.shared-file { display: grid; min-height: 100%; place-items: center; padding: 32px 16px; }
.shared-file__content { width: min(620px, 100%); }
.shared-file__header { display: flex; align-items: center; gap: 14px; padding-bottom: 24px; border-bottom: 1px solid var(--el-border-color-lighter); }
.shared-file__icon { color: var(--el-color-primary); flex: 0 0 auto; }
.shared-file__header h1 { margin: 0; overflow-wrap: anywhere; font-size: 24px; font-weight: 650; }
.shared-file__header p { margin: 4px 0 0; color: var(--el-text-color-secondary); }
.shared-file__details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 24px 0 0; }
.shared-file__details div { display: grid; gap: 4px; }
.shared-file__details dt { color: var(--el-text-color-secondary); font-size: 13px; }
.shared-file__details dd { margin: 0; overflow-wrap: anywhere; }
.shared-file__state { display: grid; width: min(360px, 100%); justify-items: center; gap: 14px; color: var(--el-text-color-secondary); text-align: center; }
.shared-file__state p { margin: 0; }
.shared-file__hint { color: var(--el-text-color-secondary); font-size: 13px; }
.access-form { display: grid; width: 100%; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.shared-file__download { margin-top: 28px; }
.shared-file__notice { margin-top: 28px; }
@media (max-width: 480px) { .shared-file__details { grid-template-columns: 1fr; } .access-form { grid-template-columns: 1fr; } }
</style>
