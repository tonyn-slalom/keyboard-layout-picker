import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// @ts-ignore — vitest config not in vite types; picked up by vitest at test time
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  // @ts-ignore
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
