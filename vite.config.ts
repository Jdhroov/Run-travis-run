import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173
  },
  base: '/Run-travis-run/',
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
})
