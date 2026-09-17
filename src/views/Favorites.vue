<template>
  <section class="file-collection">
    <header class="file-collection__header">
      <div>
        <h1>收藏夹</h1>
        <p>快速访问重要文件和文件夹</p>
      </div>
      <el-tooltip content="刷新">
        <el-button circle aria-label="刷新收藏夹" @click="loadFavorites">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>
    </header>

    <el-table v-loading="loading" :data="favorites" row-key="id" style="width: 100%">
      <el-table-column label="名称" min-width="300">
        <template #default="{ row }">
          <div class="file-name">
            <el-icon size="20" class="file-name__icon"><Folder v-if="row.file.isFolder" /><Document v-else /></el-icon>
            <span>{{ row.file.filename }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="128">
        <template #default="{ row }">{{ row.file.isFolder ? '-' : formatFileSize(row.file.size) }}</template>
      </el-table-column>
      <el-table-column label="备注" min-width="180">
        <template #default="{ row }"><span>{{ row.notes || '-' }}</span></template>
      </el-table-column>
      <el-table-column label="收藏时间" width="184">
        <template #default="{ row }">{{ formatDate(row.updatedAt || row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="112" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="取消收藏">
            <el-button circle size="small" type="danger" :aria-label="`取消收藏 ${row.file.filename}`" @click="unfavorite(row)">
              <el-icon><StarFilled /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && favorites.length === 0" description="收藏夹为空" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Folder, Refresh, StarFilled } from '@element-plus/icons-vue'
import { getFavorites, unfavoriteFile } from '@/api/file.js'
import { formatFileSize } from '@/utils/fileUtils.js'

const favorites = ref([])
const loading = ref(false)

const loadFavorites = async () => {
  loading.value = true
  try {
    favorites.value = await getFavorites()
  } catch (error) {
    console.error('加载收藏夹失败:', error)
  } finally {
    loading.value = false
  }
}

const unfavorite = async favorite => {
  try {
    await ElMessageBox.confirm(`确定取消收藏“${favorite.file.filename}”吗？`, '取消收藏', {
      confirmButtonText: '取消收藏',
      cancelButtonText: '返回',
      type: 'warning'
    })
    await unfavoriteFile(favorite.file.id)
    ElMessage.success('已取消收藏')
    await loadFavorites()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('取消收藏失败:', error)
  }
}

const formatDate = value => value ? new Date(value).toLocaleString('zh-CN') : '-'

onMounted(loadFavorites)
</script>

<style scoped>
.file-collection { min-height: 100%; }
.file-collection__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.file-collection__header h1 { margin: 0; font-size: 22px; font-weight: 650; }
.file-collection__header p { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 14px; }
.file-name { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.file-name__icon { color: var(--el-color-primary); flex: 0 0 auto; }
.file-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 720px) { .file-collection__header { align-items: flex-start; } }
</style>
