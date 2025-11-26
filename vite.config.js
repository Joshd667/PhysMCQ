import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for assets to enable GitHub Pages deployment
  // (GitHub Pages serves from a subdirectory, not root)
  base: './',
})
