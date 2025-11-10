import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/victoria-peinado.github.io/', 
  plugins: [react()],
})