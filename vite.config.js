import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import VueInspector from 'vite-plugin-vue-inspector'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      VueInspector(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
        },
        '/avatar': {
          target: env.MINIO_PROXY_TARGET || 'http://127.0.0.1:9000',
          changeOrigin: true,
        },
        '/files/': {
          target: env.MINIO_PROXY_TARGET || 'http://127.0.0.1:9000',
          changeOrigin: false,
        }
      },
    }
  }
})
