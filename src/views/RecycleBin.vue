<template>
  <section class="recycle-bin">
    <header class="recycle-bin__header">
      <div>
        <h1>回收站</h1>
        <p>恢复仍需保留的项目，永久删除后不可恢复</p>
      </div>
      <div class="recycle-bin__toolbar">
        <el-button v-if="selectedFiles.length" @click="restoreSelected">
          <el-icon><RefreshLeft /></el-icon>
          还原所选
        </el-button>
        <el-button v-if="selectedFiles.length" type="danger" plain @click="permanentlyDeleteSelected">
          <el-icon><Delete /></el-icon>
          永久删除
        </el-button>
        <el-tooltip content="刷新">
          <el-button circle aria-label="刷新回收站" @click="loadRecycleBin">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </header>

    <el-table v-loading="loading" :data="files" row-key="id" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="52" />
      <el-table-column label="名称" min-width="300">
        <template #default="{ row }">
          <div class="file-name">
            <el-icon size="20" class="file-name__icon"><Folder v-if="row.isFolder" /><Document v-else /></el-icon>
            <span>{{ row.filename }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="128">
        <template #default="{ row }">{{ row.isFolder ? '-' : formatFileSize(row.size) }}</template>
      </el-table-column>
      <el-table-column label="删除时间" width="184">
        <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="112" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="还原">
            <el-button circle size="small" :aria-label="`还原 ${row.filename}`" @click="restore([row.id])">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="永久删除">
            <el-button circle size="small" type="danger" :aria-label="`永久删除 ${row.filename}`" @click="permanentlyDelete([row.id], [row])">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && files.length === 0" description="回收站为空" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Document, Folder, Refresh, RefreshLeft } from '@element-plus/icons-vue'
import { getRecycleBinFiles, permanentlyDeleteRecycleBinFiles, restoreRecycleBinFiles } from '@/api/file.js'
import { formatFileSize } from '@/utils/fileUtils.js'

const files = ref([])
const selectedFiles = ref([])
const loading = ref(false)

const loadRecycleBin = async () => {
  loading.value = true
  selectedFiles.value = []
  try {
    files.value = await getRecycleBinFiles()
  } catch (error) {
    console.error('加载回收站失败:', error)
  } finally {
    loading.value = false
  }
}

const restore = async fileIds => {
  try {
    await restoreRecycleBinFiles(fileIds)
    ElMessage.success('已还原所选项目')
    await loadRecycleBin()
  } catch (error) {
    console.error('还原文件失败:', error)
  }
}

const restoreSelected = () => restore(selectedFiles.value.map(file => file.id))

const handleSelectionChange = selection => {
  selectedFiles.value = selection
}

const permanentlyDelete = async (fileIds, selected = []) => {
  const description = selected.length === 1
    ? `确定永久删除“${selected[0].filename}”吗？此操作无法恢复。`
    : `确定永久删除选中的 ${fileIds.length} 个项目吗？此操作无法恢复。`
  try {
    await ElMessageBox.confirm(description, '永久删除确认', {
      confirmButtonText: '永久删除',
      cancelButtonText: '取消',
      type: 'error'
    })
    await permanentlyDeleteRecycleBinFiles(fileIds)
    ElMessage.success('项目已永久删除')
    await loadRecycleBin()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('永久删除文件失败:', error)
  }
}

const permanentlyDeleteSelected = () => permanentlyDelete(selectedFiles.value.map(file => file.id), selectedFiles.value)
const formatDate = value => value ? new Date(value).toLocaleString('zh-CN') : '-'

onMounted(loadRecycleBin)
</script>

<style scoped>
.recycle-bin { min-height: 100%; }
.recycle-bin__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.recycle-bin__header h1 { margin: 0; font-size: 22px; font-weight: 650; }
.recycle-bin__header p { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 14px; }
.recycle-bin__toolbar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.file-name { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.file-name__icon { color: var(--el-color-primary); flex: 0 0 auto; }
.file-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 720px) { .recycle-bin__header { align-items: flex-start; flex-direction: column; } .recycle-bin__toolbar { justify-content: flex-start; } }
</style>
