<template>
  <div class="file-operations-example">
    <h3>文件操作示例</h3>
    
    <!-- 文件上传 -->
    <el-upload
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :show-file-list="false"
    >
      <el-button type="primary">上传文件</el-button>
    </el-upload>
    
    <!-- 文件列表 -->
    <el-table :data="fileList" style="margin-top: 20px">
      <el-table-column prop="name" label="文件名" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthRefresh } from '@/composables/useAuthRefresh.js'
import { uploadFile, deleteFile } from '@/api/file.js'

// 使用认证刷新钩子
const { refreshAuth, withAuthRefresh } = useAuthRefresh()

const fileList = ref([])

// 方式1: 手动调用 refreshAuth
const handleBeforeUpload = (file) => {
  console.log('准备上传文件:', file.name)
  return true
}

const handleUpload = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const result = await uploadFile(formData)
    ElMessage.success('上传成功')
    
    // 上传成功后刷新用户状态
    await refreshAuth({ showSuccess: false })
    
    // 更新文件列表
    fileList.value.push(result)
  } catch (error) {
    ElMessage.error('上传失败: ' + error.message)
  }
}

// 方式2: 使用 withAuthRefresh 包装
const deleteFileWithRefresh = withAuthRefresh(deleteFile)

const handleDelete = async (fileId) => {
  try {
    // 删除文件，操作成功后会自动刷新用户状态
    await deleteFileWithRefresh(fileId)
    
    ElMessage.success('删除成功')
    
    // 更新文件列表
    fileList.value = fileList.value.filter(f => String(f.id) !== String(fileId))
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message)
  }
}
</script>

<style scoped>
.file-operations-example {
  padding: 20px;
}
</style>
