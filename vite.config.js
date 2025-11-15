// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Because deploying to a custom root domain (magictrivia.org),
// the base path should just be "/" for both dev and production.
export default defineConfig({
  base: '/', 
  plugins: [react()],
})