<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <section class="welcome-section">
      <h2 class="section-title">欢迎使用 CloudDrive</h2>
      
      <!-- 快速访问 -->
      <div class="quick-access">
        <h3 class="subsection-title">快速访问</h3>
        <div class="quick-cards">
          <div class="quick-card" @click="handleQuickAction('document')">
            <div class="card-icon document">
              <el-icon size="28"><Document /></el-icon>
            </div>
            <span>文档</span>
          </div>
          <div class="quick-card" @click="handleQuickAction('image')">
            <div class="card-icon image">
              <el-icon size="28"><Picture /></el-icon>
            </div>
            <span>图片</span>
          </div>
          <div class="quick-card" @click="handleQuickAction('video')">
            <div class="card-icon video">
              <el-icon size="28"><VideoPlay /></el-icon>
            </div>
            <span>视频</span>
          </div>
          <div class="quick-card" @click="handleQuickAction('folder')">
            <div class="card-icon folder">
              <el-icon size="28"><Folder /></el-icon>
            </div>
            <span>文件夹</span>
          </div>
        </div>
      </div>

      <!-- 最近文件 -->
      <div class="recent-files">
        <h3 class="subsection-title">最近文件</h3>
        <div class="files-grid" v-if="recentFiles.length">
          <div 
            class="file-card" 
            v-for="file in recentFiles" 
            :key="file.id"
            @click="openFile(file)"
          >
            <div class="file-preview">
              <el-icon size="40" v-if="file.type === 'folder'"><Folder /></el-icon>
              <el-icon size="40" v-else-if="file.type === 'image'"><Picture /></el-icon>
              <el-icon size="40" v-else-if="file.type === 'video'"><VideoPlay /></el-icon>
              <el-icon size="40" v-else><Document /></el-icon>
            </div>
            <div class="file-info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-meta">{{ file.modifiedTime }}</p>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无最近文件" />
      </div>

      <!-- 推荐文件夹 -->
      <div class="suggested-section">
        <h3 class="subsection-title">我的存储桶</h3>
        <div class="suggested-grid" v-if="myBuckets.length > 0">
          <div 
            class="suggested-card" 
            v-for="bucket in myBuckets" 
            :key="bucket.id"
            @click="$router.push('/files')"
          >
            <el-icon size="24" class="suggested-icon"><Box /></el-icon>
            <div class="bucket-card-info">
              <span class="bucket-card-name">{{ bucket.name }}</span>
              <el-progress 
                :percentage="getStoragePercentage(bucket)" 
                :stroke-width="4" 
                :show-text="false"
                class="bucket-card-progress"
              />
              <span class="file-count">
                {{ formatFileSize(bucket.usedStorage || 0) }} / {{ formatFileSize(bucket.totalStorage || 0) }}
              </span>
            </div>
            <el-tag v-if="String(bucket.id) === String(userStore.userInfo?.currentBucketId)" size="small" type="success" style="margin-left: 8px;">默认</el-tag>
          </div>
        </div>
        <div v-else class="suggested-grid">
          <div class="suggested-card" @click="$router.push('/settings')">
            <el-icon size="24" class="suggested-icon"><Box /></el-icon>
            <span>创建第一个存储桶</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Picture,
  VideoPlay,
  Folder,
  Box
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'
import { getMyBuckets, getDefaultBucket } from '@/api/user.js'
import { formatFileSize } from '@/utils/index.js'

const router = useRouter()
const userStore = useUserStore()

// 存储桶数据
const defaultBucket = ref(null)
const myBuckets = ref([])
const loadingBuckets = ref(false)

// 最近文件（从默认桶渲染占位信息）
const recentFiles = ref([])

onMounted(async () => {
  loadingBuckets.value = true
  try {
    const [buckets, defBucket] = await Promise.allSettled([
      getMyBuckets(),
      getDefaultBucket()
    ])
    if (buckets.status === 'fulfilled') {
      myBuckets.value = Array.isArray(buckets.value) ? buckets.value : []
    }
    if (defBucket.status === 'fulfilled') {
      defaultBucket.value = defBucket.value
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loadingBuckets.value = false
  }
})

const handleQuickAction = (type) => {
  router.push('/files')
}

const openFile = (file) => {
  if (file.type === 'folder') {
    router.push('/files')
  }
}

const getStoragePercentage = (bucket) => {
  if (!bucket || !bucket.totalStorage) return 0
  return Math.min(Math.round((bucket.usedStorage || 0) / bucket.totalStorage * 100), 100)
}
</script>

<style scoped>
.home-container {
  padding: 24px 32px;
  background: #f8f9fa;
  min-height: 100%;
}

.section-title {
  font-size: 24px;
  font-weight: 400;
  color: #202124;
  margin-bottom: 24px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 快速访问 */
.quick-access {
  margin-bottom: 40px;
}

.quick-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 32px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-card:hover {
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.15);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.card-icon.document {
  background: #e3f2fd;
  color: #1a73e8;
}

.card-icon.image {
  background: #fce4ec;
  color: #e91e63;
}

.card-icon.video {
  background: #fff3e0;
  color: #f57c00;
}

.card-icon.folder {
  background: #e8f5e9;
  color: #4caf50;
}

.quick-card span {
  font-size: 14px;
  color: #202124;
}

/* 最近文件 */
.recent-files {
  margin-bottom: 40px;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.file-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-card:hover {
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.file-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  color: #5f6368;
}

.file-info .file-name {
  font-size: 14px;
  color: #202124;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info .file-meta {
  font-size: 12px;
  color: #5f6368;
  margin: 0;
}

/* 建议文件夹 */
.suggested-section {
  margin-bottom: 40px;
}

.suggested-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.suggested-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-card:hover {
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.15);
}

.suggested-icon {
  color: #5f6368;
}

.suggested-card span {
  font-size: 14px;
  color: #202124;
}

.file-count {
  color: #5f6368 !important;
  font-size: 12px !important;
}

.bucket-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.bucket-card-name {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.bucket-card-progress {
  width: 100%;
}

.bucket-card-progress :deep(.el-progress-bar__outer) {
  background: #e5e7eb;
}

.bucket-card-progress :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #14b8a6, #0ea5e9);
}
</style>
