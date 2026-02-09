<template>
  <div class="api-test">
    <h2>API 连接测试</h2>
    <el-space direction="vertical" style="width: 100%">
      <el-button @click="testApiConnection" type="primary" :loading="loading">测试API连接</el-button>
      <el-button @click="testRegister" type="success" :loading="loading">测试用户注册</el-button>
      <el-divider />
      
      <el-card v-if="result">
        <template #header>
          <span>测试结果</span>
        </template>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </el-card>
      
      <el-card v-if="error">
        <template #header>
          <span style="color: red">错误信息</span>
        </template>
        <pre style="color: red">{{ error }}</pre>
      </el-card>
    </el-space>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { checkUsernameAvailability, register } from '@/api/auth'

const loading = ref(false)
const result = ref(null)
const error = ref(null)

const clearResults = () => {
  result.value = null
  error.value = null
}

const testApiConnection = async () => {
  loading.value = true
  clearResults()
  
  try {
    console.log('开始测试API连接...')
    // 尝试调用一个不需要认证的API端点
    const response = await checkUsernameAvailability('testuser')
    result.value = {
      success: true,
      message: 'API连接成功',
      data: response
    }
    console.log('API测试成功:', response)
  } catch (err) {
    console.error('API测试失败:', err)
    error.value = `API连接失败: ${err.message}`
    
    // 额外的错误信息
    if (err.response) {
      error.value += `\n状态码: ${err.response.status}`
      error.value += `\n响应数据: ${JSON.stringify(err.response.data, null, 2)}`
    } else if (err.request) {
      error.value += `\n网络错误，无法连接到服务器`
    }
  } finally {
    loading.value = false
  }
}

const testRegister = async () => {
  loading.value = true
  clearResults()
  
  try {
    const testData = {
      username: 'testuser_' + Date.now(),
      email: 'test@example.com',
      password: 'Test123!',
      verificationCode: '123456'
    }
    
    console.log('开始测试用户注册...', testData)
    const response = await register(testData)
    result.value = {
      success: true,
      message: '注册测试成功',
      data: response
    }
    console.log('注册测试成功:', response)
  } catch (err) {
    console.error('注册测试失败:', err)
    error.value = `注册测试失败: ${err.message}`
    
    if (err.response) {
      error.value += `\n状态码: ${err.response.status}`
      error.value += `\n响应数据: ${JSON.stringify(err.response.data, null, 2)}`
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-test {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}
</style>