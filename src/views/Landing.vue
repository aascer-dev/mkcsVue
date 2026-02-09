<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            安全便捷的
            <span class="gradient-text">云端存储</span>
          </h1>
          <p class="hero-subtitle">
            让您的文件随时随地可访问，享受企业级的数据安全保护
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="handleGetStarted" class="cta-button">
              <el-icon><Folder /></el-icon>
              开始使用
            </el-button>
            <el-button size="large" @click="learnMore" class="learn-more-button">
              了解更多
            </el-button>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="visual-container">
            <div class="floating-card card-1">
              <el-icon size="24"><Document /></el-icon>
              <span>文档</span>
            </div>
            <div class="floating-card card-2">
              <el-icon size="24"><Picture /></el-icon>
              <span>图片</span>
            </div>
            <div class="floating-card card-3">
              <el-icon size="24"><VideoPlay /></el-icon>
              <span>视频</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">为什么选择 CloudDrive？</h2>
        
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"><Lock /></el-icon>
            </div>
            <h3>安全加密</h3>
            <p>采用 AES-256 加密算法，确保您的数据安全</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"><Lightning /></el-icon>
            </div>
            <h3>极速同步</h3>
            <p>智能增量同步，文件变更实时更新</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"><Share /></el-icon>
            </div>
            <h3>便捷分享</h3>
            <p>一键生成分享链接，团队协作更高效</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"><Monitor /></el-icon>
            </div>
            <h3>多端访问</h3>
            <p>支持 Web、移动端、桌面客户端</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">10K+</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">1M+</div>
            <div class="stat-label">文件存储</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">可用性</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">技术支持</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <el-icon size="24"><Upload /></el-icon>
            <span>CloudDrive</span>
          </div>
          <div class="footer-links">
            <a href="#">关于我们</a>
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
            <a href="#">联系我们</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 CloudDrive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Upload,
  Folder,
  Document,
  Picture,
  VideoPlay,
  Lock,
  Lightning,
  Share,
  Monitor,
  Setting
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const handleGetStarted = () => {
  if (userStore.isAuthenticated) {
    router.push('/home')
  } else {
    router.push('/register')
  }
}

const learnMore = () => {
  // 滚动到特性介绍部分
  document.querySelector('.features-section').scrollIntoView({ 
    behavior: 'smooth' 
  })
}
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 64px);
  background: #ffffff;
}

/* 英雄区域 */
.hero-section {
  padding: 60px 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
  margin-bottom: 20px;
}

.gradient-text {
  background: linear-gradient(45deg, #4ade80, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: #6b7280;
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.cta-button {
  background: linear-gradient(135deg, #4ade80, #06b6d4);
  border: none;
  font-weight: 600;
  padding: 12px 24px;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 222, 128, 0.3);
}

.learn-more-button {
  border: 2px solid #e5e7eb;
  color: #6b7280;
  font-weight: 600;
  padding: 12px 24px;
}

.learn-more-button:hover {
  border-color: #4ade80;
  color: #4ade80;
}

/* 视觉效果 */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.visual-container {
  position: relative;
  width: 400px;
  height: 400px;
}

.floating-card {
  position: absolute;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #1f2937;
  animation: float 6s ease-in-out infinite;
  min-width: 120px;
}

.card-1 {
  top: 10px;
  left: 10px;
  animation-delay: 0s;
}

.card-2 {
  top: 40px;
  right: 10px;
  animation-delay: 2s;
}

.card-3 {
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

/* 特性介绍 */
.features-section {
  padding: 80px 40px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.feature-item {
  text-align: center;
  padding: 32px 24px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  color: #4ade80;
  margin-bottom: 20px;
}

.feature-item h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.feature-item p {
  color: #6b7280;
  line-height: 1.6;
}

/* 统计数据 */
.stats-section {
  padding: 60px 40px;
  background: #f8fafc;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #6b7280;
}

/* 底部 */
.footer {
  background: #1f2937;
  color: white;
  padding: 40px 40px 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #374151;
  color: #9ca3af;
  max-width: 1200px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section,
  .features-section,
  .stats-section,
  .footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 1200px) and (min-width: 769px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-content {
    gap: 60px;
  }
}

@media (min-width: 1400px) {
  .hero-section .hero-content,
  .container,
  .stats-grid,
  .footer-content,
  .footer-bottom {
    max-width: 1400px;
  }
}
</style>