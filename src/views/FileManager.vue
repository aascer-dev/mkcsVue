<template>
  <div class="file-manager">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item @click="navigateTo('/')">根目录</el-breadcrumb-item>
              <el-breadcrumb-item
                v-for="(path, index) in pathSegments"
                :key="index"
                @click="navigateTo(getPathUpTo(index))"
              >
                {{ path }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="toolbar">
            <el-button type="primary" @click="showUploadDialog = true">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
            <el-button @click="showCreateFolderDialog = true">
              <el-icon><FolderAdd /></el-icon>
              新建文件夹
            </el-button>
            <el-button @click="refreshFileList">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <el-table
          v-loading="fileStore.loading"
          :data="fileStore.fileList"
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="名称" min-width="300">
            <template #default="{ row }">
              <div class="file-item" @dblclick="handleFileDoubleClick(row)">
                <el-icon size="20" class="file-icon">
                  <Folder v-if="row.type === 'folder'" />
                  <Document v-else />
                </el-icon>
                <span class="file-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="大小" width="120">
            <template #default="{ row }">
              {{ row.type === 'folder' ? '-' : formatFileSize(row.size) }}
            </template>
          </el-table-column>
          
          <el-table-column label="修改时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.modifiedTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="downloadFile(row)" v-if="row.type !== 'folder'">
                <el-icon><Download /></el-icon>
              </el-button>
              <el-button size="small" @click="renameFile(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="deleteFile(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    
    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传文件" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="uploadFileList"
        multiple
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </el-upload>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploading">
          上传
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="showCreateFolderDialog" title="新建文件夹" width="400px">
      <el-form :model="folderForm" label-width="80px">
        <el-form-item label="文件夹名">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateFolderDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateFolder">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Upload,
  FolderAdd,
  Refresh,
  Folder,
  Document,
  Download,
  Edit,
  Delete,
  UploadFilled
} from '@element-plus/icons-vue'
import { useFileStore } from '@/stores/file.js'
import {
  getFileList,
  uploadFile,
  downloadFile as downloadFileApi,
  deleteFile as deleteFileApi,
  createFolder,
  renameFile as renameFileApi
} from '@/api/file.js'

const fileStore = useFileStore()

const showUploadDialog = ref(false)
const showCreateFolderDialog = ref(false)
const uploading = ref(false)
const uploadFileList = ref([])
const selectedFiles = ref([])

const folderForm = reactive({
  name: ''
})

const pathSegments = computed(() => {
  return fileStore.currentPath.split('/').filter(segment => segment)
})

const getPathUpTo = (index) => {
  return '/' + pathSegments.value.slice(0, index + 1).join('/')
}

const navigateTo = async (path) => {
  fileStore.setCurrentPath(path)
  await loadFileList()
}

const loadFileList = async () => {
  try {
    fileStore.setLoading(true)
    const files = await getFileList(fileStore.currentPath)
    fileStore.setFileList(files)
  } catch (error) {
    console.error('加载文件列表失败:', error)
  } finally {
    fileStore.setLoading(false)
  }
}

const refreshFileList = () => {
  loadFileList()
}

const handleFileDoubleClick = (file) => {
  if (file.type === 'folder') {
    const newPath = fileStore.currentPath === '/' 
      ? `/${file.name}` 
      : `${fileStore.currentPath}/${file.name}`
    navigateTo(newPath)
  }
}

const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
  fileStore.setSelectedFiles(selection)
}

const handleFileChange = (file, fileList) => {
  uploadFileList.value = fileList
}

const handleUpload = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  uploading.value = true
  
  try {
    for (const file of uploadFileList.value) {
      const formData = new FormData()
      formData.append('file', file.raw)
      formData.append('path', fileStore.currentPath)
      
      await uploadFile(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`上传进度: ${progress}%`)
      })
    }
    
    ElMessage.success('文件上传成功')
    showUploadDialog.value = false
    uploadFileList.value = []
    await loadFileList()
  } catch (error) {
    console.error('文件上传失败:', error)
  } finally {
    uploading.value = false
  }
}

const handleCreateFolder = async () => {
  if (!folderForm.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  
  try {
    await createFolder({
      name: folderForm.name,
      path: fileStore.currentPath
    })
    
    ElMessage.success('文件夹创建成功')
    showCreateFolderDialog.value = false
    folderForm.name = ''
    await loadFileList()
  } catch (error) {
    console.error('创建文件夹失败:', error)
  }
}

const downloadFile = async (file) => {
  try {
    const blob = await downloadFileApi(file.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('文件下载失败:', error)
  }
}

const renameFile = async (file) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新名称',
      '重命名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: file.name
      }
    )
    
    if (newName && newName !== file.name) {
      await renameFileApi(file.id, newName)
      ElMessage.success('重命名成功')
      await loadFileList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重命名失败:', error)
    }
  }
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${file.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteFileApi(file.id)
    ElMessage.success('删除成功')
    await loadFileList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  loadFileList()
})
</script>

<style scoped>
.file-manager {
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.breadcrumb {
  flex: 1;
}

.breadcrumb .el-breadcrumb-item {
  cursor: pointer;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.file-icon {
  margin-right: 8px;
  color: #409eff;
}

.file-name {
  flex: 1;
}

.el-upload {
  width: 100%;
}

.el-upload__text {
  margin-top: 15px;
}
</style>