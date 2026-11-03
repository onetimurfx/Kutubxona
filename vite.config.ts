import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repository-name>/ (set automatically in CI)
export default defineConfig({
  base: process.env.VITE_BASE ?? '/Kutubxona/',
  plugins: [react(), tailwindcss()],
})
