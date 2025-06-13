import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // ton serveur backend Node.js
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
