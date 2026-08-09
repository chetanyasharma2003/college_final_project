import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom/')) {
            return 'router';
          }
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
            return 'charts';
          }
          if (id.includes('node_modules/@reduxjs/') || id.includes('node_modules/redux/')) {
            return 'redux';
          }
          if (id.includes('node_modules/axios/')) {
            return 'http';
          }
        },
      },
    },
  },
})
