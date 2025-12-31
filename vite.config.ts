import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 相关
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 状态管理
          'state-vendor': ['zustand'],
          // 视频相关
          'video-vendor': ['hls.js'],
          // WebSocket 相关
          'socket-vendor': ['socket.io-client'],
          // 其他工具库
          'utils-vendor': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
