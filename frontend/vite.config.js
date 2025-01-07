import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
   plugins: [
      vue({
         template: {
            compilerOptions: {
               isCustomElement: tag => tag.startsWith('jcb-')
            },
         }
      }),
   ],

   server: {
      port: 8000,
      open: true,
      proxy: {
         '^/chatgpt-socket-io/.*': {
            target: 'http://localhost:3000',
            ws: true,
            secure: false,
            changeOrigin: true,
         },
         '^/static/.*': 'http://localhost:3000',
      }
   },
})
