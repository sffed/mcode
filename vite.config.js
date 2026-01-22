import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['576a7d24d143.monkeycode-ai.online', '8e14a5cd4edf.monkeycode-ai.online', '2a6e430b4b05.monkeycode-ai.online']
  }
})
