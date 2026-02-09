<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 简化布局，每个页面自己管理布局
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background: #f8fafc;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  width: 100vw;
  min-height: 100vh;
}

/* Element Plus 主题定制 */
:root {
  --el-color-primary: #4ade80;
  --el-color-primary-light-3: #86efac;
  --el-color-primary-light-5: #bbf7d0;
  --el-color-primary-light-7: #dcfce7;
  --el-color-primary-light-8: #ecfdf5;
  --el-color-primary-light-9: #f0fdf4;
  --el-color-primary-dark-2: #22c55e;
  --el-border-radius-base: 8px;
  --el-border-radius-small: 6px;
  --el-border-radius-round: 20px;
}
</style>
