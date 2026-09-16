import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import MainLayout from '@/layouts/MainLayout.vue'
import Landing from '@/views/Landing.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import FileManager from '@/views/FileManager.vue'
import Settings from '@/views/Settings.vue'
import ChangeEmailVerification from '@/views/ChangeEmailVerification.vue'
import OAuthCallback from '@/views/OAuthCallback.vue'
import OAuth2EmailBinding from '@/views/OAuth2EmailBinding.vue'
import OAuth2UsernameSelection from '@/views/OAuth2UsernameSelection.vue'

const routes = [
  {
    path: '/',
    redirect: '/landing'
  },
  {
    path: '/landing',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: Landing
      }
    ]
  },
  {
    path: '/home',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
        meta: { guest: true }
      }
    ],
    meta: { guest: true }
  },
  {
    path: '/register',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Register',
        component: Login,
        meta: { isRegister: true, guest: true }
      }
    ],
    meta: { isRegister: true, guest: true }
  },
  {
    path: '/forgot-password',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'ForgotPassword',
        component: ForgotPassword,
        meta: { guest: true }
      }
    ],
    meta: { guest: true }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback
  },
  {
    // GitHub OAuth2 回调页面（支持多个路径）
    path: '/oauth/callback/github',
    name: 'GitHubOAuthCallback',
    component: OAuthCallback
  },
  {
    // OAuth2 邮箱绑定页面
    path: '/oauth2/email-binding',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'OAuth2EmailBinding',
        component: OAuth2EmailBinding,
        meta: { guest: true }
      }
    ]
  },
  {
    // OAuth2 用户名选择页面
    path: '/oauth2/username-selection',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'OAuth2UsernameSelection',
        component: OAuth2UsernameSelection,
        meta: { guest: true }
      }
    ]
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: () => import('@/views/ApiTest.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/files',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'FileManager',
        component: FileManager
      }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Settings',
        component: Settings
      }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/change-email-verification',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'ChangeEmailVerification',
        component: ChangeEmailVerification
      }
    ],
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 每次进入页面都从服务端同步用户信息，避免仅使用本地缓存的旧头像或资料。
  if (userStore.token) {
    try {
      await userStore.initialize()
    } catch (error) {
      console.error('初始化用户状态失败:', error)
    }
  }
  
  const isAuthenticated = userStore.isAuthenticated
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isGuestOnly = to.matched.some(record => record.meta.guest)
  
  if (requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (isGuestOnly && isAuthenticated) {
    // 访问游客页面但已登录，跳转到主页
    next('/home')
  } else {
    next()
  }
})

export default router
