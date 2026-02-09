<template>
  <div class="oauth-login">
    <div class="oauth-divider">
      <span>或者</span>
    </div>
    
    <div class="oauth-buttons">
      <el-button 
        class="oauth-btn github-btn" 
        size="large"
        :loading="githubLoading"
        @click="handleGitHubLogin"
      >
        <svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
        </svg>
        使用 GitHub 登录
      </el-button>
      
      <!-- 可以添加更多OAuth提供商 -->
      <!-- <el-button 
        class="oauth-btn google-btn" 
        size="large"
        disabled
      >
        <svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        使用 Google 登录
      </el-button> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getGithubOAuthUrl } from '@/api/auth.js'

const githubLoading = ref(false)

// GitHub OAuth登录
const handleGitHubLogin = async () => {
  githubLoading.value = true
  
  try {
    // 不传 state，让后端自动生成并存入 Redis 管理
    const result = await getGithubOAuthUrl()
    console.log('getGithubOAuthUrl 返回:', JSON.stringify(result))
    
    // 跳转到GitHub授权页面（兼容多种响应格式）
    let authUrl = null
    if (result && typeof result === 'object') {
      authUrl = result.authUrl || result.url || result.data?.authUrl
    } else if (typeof result === 'string') {
      authUrl = result
    }
    
    if (!authUrl) {
      console.error('OAuth2 authorize 响应:', result)
      throw new Error('未获取到授权URL')
    }
    
    window.location.href = authUrl
  } catch (error) {
    console.error('GitHub登录失败:', error)
    ElMessage.error(error.message || 'GitHub登录失败，请重试')
    githubLoading.value = false
  }
}
</script>

<style scoped>
.oauth-login {
  margin-top: 24px;
}

.oauth-divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
  color: #6b7280;
  font-size: 14px;
}

.oauth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
  z-index: 1;
}

.oauth-divider span {
  background: rgba(255, 255, 255, 0.75);
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oauth-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  border: 2px solid;
}

.github-btn {
  background: #24292e;
  border-color: #24292e;
  color: white;
}

.github-btn:hover {
  background: #1a1e22;
  border-color: #1a1e22;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(36, 41, 46, 0.3);
}

.google-btn {
  background: white;
  border-color: #e5e7eb;
  color: #374151;
}

.google-btn:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.oauth-icon {
  flex-shrink: 0;
}

.oauth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>