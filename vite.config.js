import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 给@添加别名，方便导入组件
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://159.75.169.224:1235/api',
        // 基地址写了api，因为是拼接在一起，所以不需要写/api
        target: 'http://159.75.169.224:1235',
        // 开启把请求头中的Host字段修改为target字段中的Host，
        // 如果没有或未false，则host任按照原地址
        changeOrigin: true,
      }
    }
  }
})
