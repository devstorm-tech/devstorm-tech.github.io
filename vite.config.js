import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    // Listen on all network interfaces
    host: '0.0.0.0',
    
    // Use default Vite port or set custom
    port: 5173,
    
    // Automatically open browser when server starts
    open: true,
    
    // Configure CORS (important for API requests from other devices)
    cors: true,
    
    // Enable HTTPS if needed (optional)
    // https: false,
    
    // Watch for changes in these directories
    watch: {
      usePolling: true, // Useful for network drives or WSL
    },
    
    // Proxy configuration for API (if you have a backend)
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your backend server
        changeOrigin: true,
        secure: false,
      }
    },
    
    // Set headers for all responses
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    
    // Increase timeout for slow connections
    hmr: {
      timeout: 30000
    }
  },
  
  // Build configuration
  build: {
    // Generate sourcemaps for debugging
    sourcemap: true,
    
    // Optimize chunk size for network performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        }
      }
    },
    
    // Show warnings in console
    minify: 'esbuild',
    
    // Report chunk sizes
    reportCompressedSize: true,
    
    // Build target
    target: 'es2020',
  },
  
  // Preview configuration (for testing builds)
  preview: {
    host: '0.0.0.0',
    port: 4173,
    open: true,
    cors: true,
  },
  
  // Resolve aliases for cleaner imports
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