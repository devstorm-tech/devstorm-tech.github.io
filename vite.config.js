import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Crucial for GitHub Pages deploying to an apex organization root (devstorm-tech.github.io)
  base: '/', 

  plugins: [
    react(),
    tailwindcss()
  ],

  server: {
    // Listen on all network interfaces (perfect for WSL environment setups)
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    
    // Watch for file modifications accurately over network drives/WSL environments
    watch: {
      usePolling: true, 
    },
    
    // Proxy configuration for local API endpoints 
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Points to your backend ecosystem
        changeOrigin: true,
        secure: false,
      }
    },
    
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    
    hmr: {
      timeout: 30000
    }
  },
  
  build: {
    sourcemap: true,
    minify: 'esbuild',
    reportCompressedSize: true,
    target: 'es2020',
    
    // Optimized asset distribution mapping to bundle chunks cleanly 
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        }
      }
    }
  },
  
  preview: {
    host: '0.0.0.0',
    port: 4173,
    open: true,
    cors: true,
  },
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
    }
  }
})