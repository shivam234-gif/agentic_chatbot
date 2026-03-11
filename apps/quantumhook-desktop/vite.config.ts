import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],

  // Prevent Vite from clearing the terminal so Tauri logs are visible
  clearScreen: false,

  server: {
    // Tauri expects a fixed port
    strictPort: true,
    port: 5173,
  },
})
