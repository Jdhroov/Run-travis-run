import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5173 },
  build: { target: 'es2019' },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true
  }
})
