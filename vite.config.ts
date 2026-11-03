import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repository-name>/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/kutubxona/',
  plugins: [react(), tailwindcss()],
})
