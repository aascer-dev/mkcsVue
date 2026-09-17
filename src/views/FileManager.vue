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
      <el-table-column label="操作" width="246" fixed="right">
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
          <el-tooltip :content="row.isFavorite ? '取消收藏' : '收藏'">
            <el-button
              circle
              size="small"
              :loading="favoriteChangingFileId === row.id"
              :aria-label="`${row.isFavorite ? '取消收藏' : '收藏'} ${row.filename}`"
              @click="toggleFavorite(row)"
            >
              <el-icon><StarFilled v-if="row.isFavorite" /><Star v-else /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="创建分享链接">
            <el-button circle size="small" :aria-label="`分享 ${row.filename}`" @click="openShareDialog(row)">
              <el-icon><Share /></el-icon>
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

    <el-dialog v-model="showShareDialog" title="创建分享链接" width="min(480px, calc(100vw - 32px))" @closed="resetShareDialog">
      <template v-if="createdShareUrl">
        <el-alert type="success" :closable="false" title="分享链接已创建" show-icon />
        <el-input class="share-link" :model-value="createdShareUrl" readonly>
          <template #append>
            <el-tooltip content="复制分享链接"><el-button aria-label="复制分享链接" @click="copyShareLink"><el-icon><CopyDocument /></el-icon></el-button></el-tooltip>
          </template>
        </el-input>
        <el-input class="share-link" :model-value="shareForm.password" readonly>
          <template #prepend>提取码</template>
          <template #append>
            <el-tooltip content="复制提取码"><el-button aria-label="复制提取码" @click="copyShareCode"><el-icon><CopyDocument /></el-icon></el-button></el-tooltip>
          </template>
        </el-input>
        <p class="share-code-hint">提取码区分大小写，请与链接一并发送给访问者。</p>
      </template>
      <el-form v-else :model="shareForm" label-width="84px" @submit.prevent="createShareLink">
        <el-form-item label="文件">
          <el-text truncated>{{ shareForm.filename }}</el-text>
        </el-form-item>
        <el-form-item label="提取码">
          <el-input v-model="shareForm.password" maxlength="4" autocomplete="off" autocapitalize="off" placeholder="4位字母或数字" @input="sanitizeShareCode" />
          <p class="share-code-hint">已随机生成，可自定义；区分大小写。</p>
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker v-model="shareForm.expiresAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" :disabled-date="disablePastDate" style="width: 100%" />
          <p class="share-code-hint">默认 1 天后过期。</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showShareDialog = false">{{ createdShareUrl ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!createdShareUrl" type="primary" :loading="creatingShare" @click="createShareLink">创建链接</el-button>
      </template>
    </el-dialog>

    <FilePreview v-if="activePreviewFile" v-model="showPreview" :file-id="activePreviewFile.id" :file="activePreviewFile" @closed="activePreviewFile = null" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Delete, Document, Download, Edit, Folder, FolderAdd, Refresh, Share, Star, StarFilled, Upload, UploadFilled, View } from '@element-plus/icons-vue'
import { FilePreview } from '@/components/FilePreview'
import { batchDeleteFiles, completeMultipartUpload, createFolder, createShare, deleteFile as deleteFileApi, downloadFile as downloadFileApi, favoriteFile as favoriteFileApi, getFolderContents, getMultipartUploadStatus, initMultipartUpload, presignMultipartPart, renameFile as renameFileApi, searchFiles, unfavoriteFile as unfavoriteFileApi, uploadFile, uploadMultipartPart, verifyMultipartSecondUpload } from '@/api/file.js'
import { useFileStore } from '@/stores/file.js'
import { useUserStore } from '@/stores/user.js'
import { formatFileSize } from '@/utils/fileUtils.js'
import { hashBlobMd5, hashFileSha256 } from '@/utils/sha256.js'

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
const showShareDialog = ref(false)
const creatingShare = ref(false)
const createdShareUrl = ref('')
const favoriteChangingFileId = ref(null)
const uploading = ref(false)
const uploadAbortController = ref(null)
const uploadFileList = ref([])
const uploadProgress = reactive({ name: '', value: 0 })
const folderForm = reactive({ name: '' })
const shareForm = reactive({ fileId: null, filename: '', password: '', expiresAt: null })
const MULTIPART_THRESHOLD = 16 * 1024 * 1024
const MULTIPART_CONCURRENCY = 3

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

const multipartLocation = () => ({
  parentId: currentFolderId.value > 0 ? currentFolderId.value : null,
  bucketId: currentBucketId.value || null
})

const uploadLargeFile = async file => {
  uploadProgress.name = `${file.name}（正在计算 SHA-256）`
  uploadProgress.value = 0
  const fileHash = await hashFileSha256(file, value => { uploadProgress.value = Math.round(value * 10) }, uploadAbortController.value.signal)
  const task = await initMultipartUpload({ filename: file.name, fileSize: file.size, fileHash, mimeType: file.type || 'application/octet-stream', ...multipartLocation() })
  if (task.secondUploadChallenge) {
    uploadProgress.name = `${file.name}（正在验证文件内容）`
    const challenge = file.slice(task.challengeOffset, task.challengeOffset + task.challengeLength)
    if (challenge.size !== task.challengeLength) throw new Error('秒传校验范围无效，请重新上传')
    const challengeHash = await hashBlobMd5(challenge)
    await verifyMultipartSecondUpload({ uploadId: task.uploadId, challengeHash })
    uploadProgress.value = 100
    return
  }
  if (task.instantUpload) return

  uploadProgress.name = file.name
  const status = await getMultipartUploadStatus(task.uploadId)
  const parts = new Map(status.uploadedParts.map(part => [part.partNumber, part.etag]))
  const loaded = new Map(status.uploadedParts.map(part => [part.partNumber, Math.min(part.size || 0, task.partSize)]))
  const pending = []
  for (let partNumber = 1; partNumber <= task.totalParts; partNumber++) if (!parts.has(partNumber)) pending.push(partNumber)
  const updateProgress = () => {
    const uploaded = [...loaded.values()].reduce((sum, value) => sum + value, 0)
    uploadProgress.value = Math.min(99, 10 + Math.round((uploaded / file.size) * 90))
  }
  const worker = async () => {
    while (pending.length) {
      const partNumber = pending.shift()
      const offset = (partNumber - 1) * task.partSize
      const blob = file.slice(offset, Math.min(offset + task.partSize, file.size))
      const { url } = await presignMultipartPart({ uploadId: task.uploadId, partNumber })
      const response = await uploadMultipartPart(url, blob, file.type, event => {
        loaded.set(partNumber, event.loaded)
        updateProgress()
      }, uploadAbortController.value.signal)
      const etag = response.headers.etag
      if (!etag) throw new Error('MinIO 未在响应中返回 ETag；请检查 MinIO CORS 的 ExposeHeaders 配置')
      loaded.set(partNumber, blob.size)
      parts.set(partNumber, etag)
      updateProgress()
    }
  }
  await Promise.all(Array.from({ length: Math.min(MULTIPART_CONCURRENCY, pending.length) }, worker))
  await completeMultipartUpload({ uploadId: task.uploadId, parts: [...parts.entries()].map(([partNumber, etag]) => ({ partNumber, etag })) })
  uploadProgress.value = 100
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
      uploadProgress.name = uploadItem.name
      uploadProgress.value = 0
      if (uploadItem.raw.size >= MULTIPART_THRESHOLD) {
        await uploadLargeFile(uploadItem.raw)
      } else {
        const formData = new FormData()
        formData.append('file', uploadItem.raw)
        appendLocation(formData)
        await uploadFile(formData, event => {
          if (event.total) uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }, uploadAbortController.value.signal)
      }
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

const toggleFavorite = async file => {
  if (favoriteChangingFileId.value !== null) return
  const isFavorite = Boolean(file.isFavorite)
  favoriteChangingFileId.value = file.id
  try {
    if (isFavorite) {
      await unfavoriteFileApi(file.id)
      file.isFavorite = false
      ElMessage.success('已取消收藏')
    } else {
      await favoriteFileApi(file.id)
      file.isFavorite = true
      ElMessage.success('已加入收藏夹')
    }
  } catch (error) {
    console.error(isFavorite ? '取消收藏失败:' : '收藏文件失败:', error)
  } finally {
    favoriteChangingFileId.value = null
  }
}

const openShareDialog = file => {
  if (file.isFolder) {
    ElMessage.info('文件夹公开下载暂不支持，请选择单个文件')
    return
  }
  shareForm.fileId = file.id
  shareForm.filename = file.filename
  shareForm.password = generateShareCode()
  shareForm.expiresAt = defaultShareExpiry()
  showShareDialog.value = true
}

const resetShareDialog = () => {
  Object.assign(shareForm, { fileId: null, filename: '', password: '', expiresAt: null })
  createdShareUrl.value = ''
  creatingShare.value = false
}

const createShareLink = async () => {
  if (!shareForm.fileId) return
  if (!/^[A-Za-z0-9]{4}$/.test(shareForm.password)) {
    ElMessage.warning('提取码必须为 4 位大小写字母或数字')
    return
  }
  creatingShare.value = true
  try {
    const share = await createShare({ fileId: shareForm.fileId, password: shareForm.password, expiresAt: shareForm.expiresAt })
    createdShareUrl.value = `${window.location.origin}/s/${share.shareCode}`
  } catch (error) {
    console.error('创建分享链接失败:', error)
  } finally {
    creatingShare.value = false
  }
}

const sanitizeShareCode = value => {
  shareForm.password = String(value).replace(/[^A-Za-z0-9]/g, '').slice(0, 4)
}

const generateShareCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const values = new Uint32Array(4)
  crypto.getRandomValues(values)
  return Array.from(values, value => alphabet[value % alphabet.length]).join('')
}

const formatDateTimeValue = date => {
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const defaultShareExpiry = () => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 1)
  return formatDateTimeValue(expiresAt)
}

const disablePastDate = date => date.getTime() < Date.now() - 24 * 60 * 60 * 1000

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(createdShareUrl.value)
    ElMessage.success('分享链接已复制')
  } catch (error) {
    console.error('复制分享链接失败:', error)
    ElMessage.error('无法复制分享链接')
  }
}

const copyShareCode = async () => {
  try {
    await navigator.clipboard.writeText(shareForm.password)
    ElMessage.success('提取码已复制')
  } catch (error) {
    console.error('复制提取码失败:', error)
    ElMessage.error('无法复制提取码')
  }
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
.share-link { margin-top: 16px; }
.share-code-hint { width: 100%; margin: 6px 0 0; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.5; }
@media (max-width: 720px) { .file-manager__header { align-items: flex-start; flex-direction: column; } .file-manager__toolbar { justify-content: flex-start; } }
</style>
