import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 8100, // Replace 3000 with your desired port number
    strictPort: true, // Exit if the port is already in use, instead of automatically trying the next available port
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})