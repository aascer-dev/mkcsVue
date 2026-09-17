<template>
  <section class="shares-page">
    <header class="shares-page__header">
      <div>
        <h1>我的分享</h1>
        <p>管理已创建的只读链接</p>
      </div>
      <el-tooltip content="刷新">
        <el-button circle aria-label="刷新我的分享" @click="loadShares">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>
    </header>

    <el-table v-loading="loading" :data="shares" row-key="id" style="width: 100%">
      <el-table-column label="文件" min-width="250">
        <template #default="{ row }">
          <div v-if="row.file" class="file-name">
            <el-icon size="20" class="file-name__icon"><Folder v-if="row.file.isFolder" /><Document v-else /></el-icon>
            <span>{{ row.file.filename }}</span>
          </div>
          <span v-else class="muted">原文件已不可用</span>
        </template>
      </el-table-column>
      <el-table-column label="访问" width="120">
        <template #default="{ row }"><el-tag :type="shareStatus(row).type" effect="plain">{{ shareStatus(row).label }}</el-tag></template>
      </el-table-column>
      <el-table-column label="保护" width="100">
        <template #default="{ row }"><el-tag :type="row.passwordProtected ? 'warning' : 'info'" effect="plain">{{ row.passwordProtected ? '提取码' : '无密码' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="有效期" width="184">
        <template #default="{ row }">{{ row.expiresAt ? formatDate(row.expiresAt) : '永久有效' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="184">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="112" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="复制链接">
            <el-button circle size="small" :disabled="row.status !== 1" :aria-label="`复制 ${row.file?.filename || '分享'} 链接`" @click="copyShareLink(row)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="撤销分享">
            <el-button circle size="small" type="danger" :disabled="row.status !== 1" :aria-label="`撤销 ${row.file?.filename || '分享'}`" @click="revoke(row)">
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && shares.length === 0" description="还没有创建分享链接" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Document, Folder, Link, Refresh } from '@element-plus/icons-vue'
import { getMyShares, revokeShare } from '@/api/file.js'

const shares = ref([])
const loading = ref(false)

const loadShares = async () => {
  loading.value = true
  try {
    shares.value = await getMyShares()
  } catch (error) {
    console.error('加载我的分享失败:', error)
  } finally {
    loading.value = false
  }
}

const shareStatus = share => {
  if (share.status === 1) return { label: '有效', type: 'success' }
  if (share.status === 2) return { label: '已过期', type: 'warning' }
  return { label: '已撤销', type: 'info' }
}

const copyShareLink = async share => {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/s/${share.shareCode}`)
    ElMessage.success('分享链接已复制')
  } catch (error) {
    console.error('复制分享链接失败:', error)
    ElMessage.error('无法复制分享链接')
  }
}

const revoke = async share => {
  try {
    await ElMessageBox.confirm(`确定撤销“${share.file?.filename || '该文件'}”的分享吗？`, '撤销分享', {
      confirmButtonText: '撤销分享',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await revokeShare(share.id)
    ElMessage.success('分享已撤销')
    await loadShares()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('撤销分享失败:', error)
  }
}

const formatDate = value => value ? new Date(value).toLocaleString('zh-CN') : '-'

onMounted(loadShares)
</script>

<style scoped>
.shares-page { min-height: 100%; }
.shares-page__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.shares-page__header h1 { margin: 0; font-size: 22px; font-weight: 650; }
.shares-page__header p { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 14px; }
.file-name { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.file-name__icon { color: var(--el-color-primary); flex: 0 0 auto; }
.file-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.muted { color: var(--el-text-color-secondary); }
</style>
