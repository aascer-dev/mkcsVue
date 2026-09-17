<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <router-link to="/landing" class="logo">
          <el-icon size="28" class="logo-icon"><Upload /></el-icon>
          <span class="logo-text">CloudDrive</span>
        </router-link>
      </div>

      <div class="header-center">
        <!-- 面包屑导航 -->
        <el-breadcrumb v-if="showBreadcrumb" separator="/" class="breadcrumb">
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="item.path"
            :to="item.path ? { path: item.path } : undefined"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <div class="search-bar" v-if="showSearch">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文件和文件夹"
            :prefix-icon="Search"
            size="large"
            class="search-input"
            @keyup.enter="submitSearch"
          />
        </div>
      </div>

      <div class="header-right">
        <template v-if="userStore.isAuthenticated">
          <el-button circle class="header-btn" @click="themeStore.toggleTheme()" :title="themeStore.isDark ? '切换到明亮模式' : '切换到暗黑模式'">
            <el-icon><Moon v-if="themeStore.isDark" /><Sunny v-else /></el-icon>
          </el-button>
          <el-dropdown @command="handleUserAction">
            <div class="user-avatar">
              <el-avatar :size="36" :src="userStore.userInfo?.avatarUrl" class="avatar">
                <template #default>
                  {{ userStore.userInfo?.nickname?.charAt(0)?.toUpperCase() || userStore.userInfo?.username?.charAt(0)?.toUpperCase() || 'U' }}
                </template>
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else-if="!isAuthPage">
          <el-button type="primary" round @click="router.push('/login')">
            登录
          </el-button>
        </template>
      </div>
    </header>

    <!-- 侧边栏 -->
    <aside class="sidebar" v-if="showSidebar">
      <div class="sidebar-content">
        <nav class="nav-menu">
          <router-link to="/home" class="nav-item" :class="{ active: $route.path === '/home' }">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/files" class="nav-item" :class="{ active: $route.path === '/files' }">
            <el-icon><Folder /></el-icon>
            <span>我的文件</span>
          </router-link>
          <router-link to="/shares" class="nav-item" :class="{ active: $route.path === '/shares' }">
            <el-icon><Share /></el-icon>
            <span>我的分享</span>
          </router-link>
          <router-link to="/favorites" class="nav-item" :class="{ active: $route.path === '/favorites' }">
            <el-icon><StarFilled /></el-icon>
            <span>收藏夹</span>
          </router-link>
          <router-link to="/recycle-bin" class="nav-item" :class="{ active: $route.path === '/recycle-bin' }">
            <el-icon><Delete /></el-icon>
            <span>回收站</span>
          </router-link>
        </nav>

        <div class="storage-info">
          <div class="storage-title">存储空间</div>
          <el-progress :percentage="storageUsage" class="storage-progress" />
          <div class="storage-text">已使用 {{ usedStorage }} / {{ totalStorage }}</div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'full-width': !showSidebar }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Upload,
  Search,
  HomeFilled,
  Folder,
  Share,
  StarFilled,
  Delete,
  Sunny,
  Moon
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'
import { useThemeStore } from '@/stores/theme.js'
import { getDefaultBucket } from '@/api/user.js'
import { formatFileSize } from '@/utils/index.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

const searchQuery = ref('')
const defaultBucket = ref(null)

const storageUsage = computed(() => {
  if (!defaultBucket.value || !defaultBucket.value.totalStorage || defaultBucket.value.totalStorage === 0) return 0
  const percentage = Math.round((defaultBucket.value.usedStorage || 0) / defaultBucket.value.totalStorage * 100)
  return Math.min(isNaN(percentage) ? 0 : percentage, 100)
})

const usedStorage = computed(() => {
  return formatFileSize(defaultBucket.value?.usedStorage || 0)
})

const totalStorage = computed(() => {
  return formatFileSize(defaultBucket.value?.totalStorage || 0)
})

const showSidebar = computed(() => {
  return route.path !== '/login' && route.path !== '/register' && route.path !== '/forgot-password' && route.path !== '/landing' && route.path !== '/settings' && !route.path.startsWith('/s/')
})

const showSearch = computed(() => {
  return route.path === '/home' || route.path === '/files'
})

const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register' || route.path === '/forgot-password'
})

const submitSearch = () => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return
  router.push({ path: '/files', query: { keyword } })
}

// 面包屑导航配置
const breadcrumbMap = {
  '/landing': [{ name: '首页', path: '/landing' }],
  '/home': [{ name: '首页', path: '/home' }],
  '/files': [{ name: '首页', path: '/home' }, { name: '我的文件', path: '/files' }],
  '/shares': [{ name: '首页', path: '/home' }, { name: '我的分享', path: '/shares' }],
  '/favorites': [{ name: '首页', path: '/home' }, { name: '收藏夹', path: '/favorites' }],
  '/recycle-bin': [{ name: '首页', path: '/home' }, { name: '回收站', path: '/recycle-bin' }],
  '/settings': [{ name: '首页', path: '/home' }, { name: '设置', path: '/settings' }],
  '/login': [{ name: '登录', path: null }],
  '/register': [{ name: '注册', path: null }],
  '/forgot-password': [{ name: '重置密码', path: null }]
}

const breadcrumbs = computed(() => {
  return breadcrumbMap[route.path] || [{ name: '首页', path: '/home' }]
})

const showBreadcrumb = computed(() => {
  return route.path !== '/landing' && route.path !== '/login' && route.path !== '/register' && route.path !== '/forgot-password' && route.path !== '/home' && route.path !== '/files' && !route.path.startsWith('/s/')
})

// 加载默认存储桶信息
const loadDefaultBucket = async () => {
  if (!userStore.isAuthenticated) return
  try {
    defaultBucket.value = await getDefaultBucket()
  } catch (error) {
    console.error('加载默认存储桶失败:', error)
  }
}

// 监听登录状态变化
watch(() => userStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadDefaultBucket()
  } else {
    defaultBucket.value = null
  }
})

onMounted(() => {
  if (userStore.isAuthenticated) {
    loadDefaultBucket()
  }
})

const handleUserAction = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/settings')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await userStore.logout()
      router.push('/landing')
      break
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.header {
  height: 64px;
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(14, 165, 233, 0.15);
  z-index: 1000;
}

.header-left {
  flex: 0 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.9;
}

.logo-icon {
  margin-right: 12px;
  color: #5eead4;
}

.logo-text {
  background: linear-gradient(45deg, #5eead4, #67e8f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 48px;
}

.search-bar {
  width: 100%;
  max-width: 600px;
}

.search-input {
  --el-input-bg-color: rgba(255, 255, 255, 0.95);
  --el-input-border-color: transparent;
  --el-input-focus-border-color: #5eead4;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  color: white;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  color: rgba(255, 255, 255, 0.9);
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: all 0.2s;
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: white;
}

.breadcrumb :deep(.el-breadcrumb__inner.is-link) {
  color: rgba(255, 255, 255, 0.8);
}

.breadcrumb :deep(.el-breadcrumb__inner.is-link:hover) {
  color: white;
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.6);
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  cursor: pointer;
}

.avatar {
  background: linear-gradient(45deg, #14b8a6, #0ea5e9);
  color: white;
  font-weight: 600;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  width: 280px;
  height: calc(100vh - 64px);
  background: white;
  border-right: 1px solid #e5e7eb;
  z-index: 100;
}

.sidebar-content {
  padding: 24px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-menu {
  flex: 1;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 12px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-item.active {
  background: linear-gradient(135deg, #0ea5e920, #14b8a620);
  color: #0d9488;
  font-weight: 500;
}

.nav-item .el-icon {
  margin-right: 12px;
  font-size: 20px;
}

.storage-info {
  padding: 24px;
  margin: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.storage-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.storage-progress {
  margin-bottom: 8px;
}

.storage-progress :deep(.el-progress-bar__outer) {
  background: #e5e7eb;
}

.storage-progress :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #14b8a6, #0ea5e9);
}

.storage-text {
  font-size: 12px;
  color: #6b7280;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 24px;
  overflow-y: auto;
  transition: margin-left 0.3s;
}

.main-content.full-width {
  margin-left: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .header-center {
    padding: 0 16px;
  }

  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
    padding: 16px;
  }
}

@media (max-width: 640px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
