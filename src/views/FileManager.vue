<template>
  <section class="file-manager">
    <header class="file-manager__header">
      <el-breadcrumb separator="/" class="file-manager__breadcrumb">
        <el-breadcrumb-item
          v-for="(folder, index) in folderTrail"
          :key="folder.id"
          @click="navigateTo(index)"
        >
          {{ folder.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>

      <div class="file-manager__toolbar">
        <el-button v-if="isSearchMode" @click="clearSearch">返回文件夹</el-button>
        <el-button v-if="selectedFiles.length" type="danger" plain @click="deleteSelectedFiles">
          删除已选
        </el-button>
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
        <el-button @click="showCreateFolderDialog = true">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-tooltip content="刷新">
          <el-button circle aria-label="刷新文件列表" @click="loadFiles">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </header>

    <el-alert
      v-if="isSearchMode"
      class="file-manager__search-result"
      type="info"
      :closable="false"
      show-icon
      :title="`“${searchKeyword}” 的搜索结果`"
    />

    <el-table
      v-loading="fileStore.loading"
      :data="fileStore.fileList"
      row-key="id"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="52" />
      <el-table-column label="名称" min-width="300">
        <template #default="{ row }">
          <button class="file-row__name" type="button" @dblclick="openFile(row)">
            <el-icon size="20" class="file-row__icon">
              <Folder v-if="row.isFolder" />
              <Document v-else />
            </el-icon>
            <span>{{ row.filename }}</span>
          </button>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="120">
        <template #default="{ row }">
          {{ row.isFolder ? '-' : formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt || row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="164" fixed="right">
        <template #default="{ row }">
          <el-tooltip v-if="!row.isFolder" content="预览">
            <el-button circle size="small" :aria-label="`预览 ${row.filename}`" @click="previewFile(row)">
              <el-icon><View /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip v-if="!row.isFolder" content="下载">
            <el-button circle size="small" :aria-label="`下载 ${row.filename}`" @click="downloadFile(row)">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重命名">
            <el-button circle size="small" :aria-label="`重命名 ${row.filename}`" @click="renameFile(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除">
            <el-button circle size="small" type="danger" :aria-label="`删除 ${row.filename}`" @click="deleteFile(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-empty
      v-if="!fileStore.loading && fileStore.fileList.length === 0"
      :description="isSearchMode ? '没有匹配的文件或文件夹' : '当前文件夹为空'"
    />

    <el-dialog v-model="showUploadDialog" title="上传文件" width="min(560px, calc(100vw - 32px))" @closed="resetUploadDialog">
      <el-upload
        :auto-upload="false"
        :file-list="uploadFileList"
        :disabled="uploading"
        multiple
        drag
        @change="handleFileChange"
        @remove="handleFileRemove"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>选择文件</em></div>
      </el-upload>
      <div v-if="uploading" class="upload-progress">
        <span>{{ uploadProgress.name }}</span>
        <el-progress :percentage="uploadProgress.value" :stroke-width="8" />
      </div>
      <template #footer>
        <el-button v-if="uploading" type="danger" plain @click="interruptUpload">中断上传</el-button>
        <el-button v-else @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCreateFolderDialog" title="新建文件夹" width="min(420px, calc(100vw - 32px))" @closed="folderForm.name = ''">
      <el-form :model="folderForm" label-width="76px" @submit.prevent="handleCreateFolder">
        <el-form-item label="文件夹名">
          <el-input v-model="folderForm.name" maxlength="255" show-word-limit autofocus @keyup.enter="handleCreateFolder" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateFolderDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateFolder">创建</el-button>
      </template>
    </el-dialog>

    <FilePreview v-if="activePreviewFile" v-model="showPreview" :file-id="activePreviewFile.id" :file="activePreviewFile" @closed="activePreviewFile = null" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Document, Download, Edit, Folder, FolderAdd, Refresh, Upload, UploadFilled, View } from '@element-plus/icons-vue'
import { FilePreview } from '@/components/FilePreview'
import { batchDeleteFiles, createFolder, deleteFile as deleteFileApi, downloadFile as downloadFileApi, getFolderContents, renameFile as renameFileApi, searchFiles, uploadFile } from '@/api/file.js'
import { useFileStore } from '@/stores/file.js'
import { useUserStore } from '@/stores/user.js'
import { formatFileSize } from '@/utils/fileUtils.js'

const route = useRoute()
const router = useRouter()
const fileStore = useFileStore()
const userStore = useUserStore()

const folderTrail = ref([{ id: 0, name: '根目录' }])
const selectedFiles = ref([])
const showUploadDialog = ref(false)
const showCreateFolderDialog = ref(false)
const showPreview = ref(false)
const activePreviewFile = ref(null)
const uploading = ref(false)
const uploadAbortController = ref(null)
const uploadFileList = ref([])
const uploadProgress = reactive({ name: '', value: 0 })
const folderForm = reactive({ name: '' })

const searchKeyword = computed(() => String(route.query.keyword || '').trim())
const isSearchMode = computed(() => Boolean(searchKeyword.value))
const currentFolderId = computed(() => folderTrail.value.at(-1).id)
const currentBucketId = computed(() => userStore.currentBucketId)

const loadFiles = async () => {
  fileStore.setLoading(true)
  fileStore.setSelectedFiles([])
  selectedFiles.value = []
  try {
    const files = isSearchMode.value
      ? await searchFiles(searchKeyword.value)
      : await getFolderContents(currentFolderId.value)
    fileStore.setFileList(files)
  } catch (error) {
    console.error('加载文件列表失败:', error)
  } finally {
    fileStore.setLoading(false)
  }
}

const navigateTo = async index => {
  if (isSearchMode.value) await clearSearch()
  folderTrail.value = folderTrail.value.slice(0, index + 1)
  fileStore.setCurrentFolderId(currentFolderId.value)
  fileStore.setCurrentPath(index === 0 ? '/' : `/${folderTrail.value.slice(1).map(folder => folder.name).join('/')}`)
  await loadFiles()
}

const openFile = async file => {
  if (file.isFolder) {
    folderTrail.value.push({ id: file.id, name: file.filename })
    fileStore.setCurrentFolderId(file.id)
    fileStore.setCurrentPath(`/${folderTrail.value.slice(1).map(folder => folder.name).join('/')}`)
    await loadFiles()
    return
  }
  previewFile(file)
}

const handleSelectionChange = selection => {
  selectedFiles.value = selection
  fileStore.setSelectedFiles(selection)
}

const handleFileChange = (_file, files) => { uploadFileList.value = files }
const handleFileRemove = (_file, files) => { uploadFileList.value = files }

const appendLocation = formData => {
  if (currentFolderId.value > 0) formData.append('parentId', String(currentFolderId.value))
  if (currentBucketId.value) formData.append('bucketId', String(currentBucketId.value))
}

const handleUpload = async () => {
  if (!uploadFileList.value.length) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  uploading.value = true
  uploadAbortController.value = new AbortController()
  try {
    const queuedFiles = [...uploadFileList.value]
    for (const uploadItem of queuedFiles) {
      const formData = new FormData()
      formData.append('file', uploadItem.raw)
      appendLocation(formData)
      uploadProgress.name = uploadItem.name
      uploadProgress.value = 0
      await uploadFile(formData, event => {
        if (event.total) uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }, uploadAbortController.value.signal)
      uploadFileList.value = uploadFileList.value.filter(file => file.uid !== uploadItem.uid)
    }
    ElMessage.success('文件上传完成')
    showUploadDialog.value = false
    await loadFiles()
  } catch (error) {
    if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      ElMessage.info('上传已中断，未上传的文件仍保留在列表中')
    } else {
      console.error('文件上传失败:', error)
    }
  } finally {
    uploading.value = false
    uploadAbortController.value = null
  }
}

const interruptUpload = () => {
  uploadAbortController.value?.abort()
}

const resetUploadDialog = () => {
  uploadFileList.value = []
  uploadProgress.name = ''
  uploadProgress.value = 0
}

const handleCreateFolder = async () => {
  const folderName = folderForm.name.trim()
  if (!folderName) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  try {
    await createFolder({ folderName, parentId: currentFolderId.value || null, bucketId: currentBucketId.value || null })
    ElMessage.success('文件夹创建成功')
    showCreateFolderDialog.value = false
    await loadFiles()
  } catch (error) {
    console.error('创建文件夹失败:', error)
  }
}

const previewFile = file => {
  activePreviewFile.value = file
  showPreview.value = true
}

const downloadFile = async file => {
  try {
    const blob = await downloadFileApi(file.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('文件下载失败:', error)
  }
}

const renameFile = async file => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定', cancelButtonText: '取消', inputValue: file.filename,
      inputValidator: name => name.trim() ? true : '名称不能为空'
    })
    const newName = value.trim()
    if (newName !== file.filename) {
      await renameFileApi(file.id, newName)
      ElMessage.success('重命名成功')
      await loadFiles()
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('重命名失败:', error)
  }
}

const confirmDelete = files => ElMessageBox.confirm(
  files.length === 1 ? `确定要删除“${files[0].filename}”吗？` : `确定要删除选中的 ${files.length} 个项目吗？`,
  '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
)

const deleteFile = async file => {
  try {
    await confirmDelete([file])
    await deleteFileApi(file.id)
    ElMessage.success('已删除')
    await loadFiles()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('删除文件失败:', error)
  }
}

const deleteSelectedFiles = async () => {
  try {
    await confirmDelete(selectedFiles.value)
    await batchDeleteFiles(selectedFiles.value.map(file => file.id))
    ElMessage.success('已删除选中的项目')
    await loadFiles()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('批量删除失败:', error)
  }
}

const clearSearch = () => router.replace({ path: '/files' })
const formatDate = value => value ? new Date(value).toLocaleString('zh-CN') : '-'

watch(searchKeyword, loadFiles)
onMounted(() => {
  fileStore.setCurrentFolderId(0)
  fileStore.setCurrentPath('/')
  loadFiles()
})
</script>

<style scoped>
.file-manager { min-height: 100%; }
.file-manager__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 48px; margin-bottom: 16px; }
.file-manager__breadcrumb { min-width: 0; }
.file-manager__breadcrumb :deep(.el-breadcrumb__inner) { cursor: pointer; }
.file-manager__toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.file-manager__search-result { margin-bottom: 12px; }
.file-row__name { display: inline-flex; align-items: center; gap: 8px; max-width: 100%; padding: 0; color: inherit; background: transparent; border: 0; font: inherit; text-align: left; cursor: pointer; }
.file-row__name:hover { color: var(--el-color-primary); }
.file-row__icon { color: var(--el-color-primary); flex: 0 0 auto; }
.upload-progress { display: grid; gap: 8px; margin-top: 16px; font-size: 13px; color: var(--el-text-color-regular); }
@media (max-width: 720px) { .file-manager__header { align-items: flex-start; flex-direction: column; } .file-manager__toolbar { justify-content: flex-start; } }
</style>
