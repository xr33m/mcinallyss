import { resolve } from 'path'
import { readdirSync } from 'fs'
import { defineConfig } from 'vite'

// Build every top-level .html file automatically, so new service/area/hub pages
// are never left out of the build (index.html is the entry named "main").
const input = Object.fromEntries(
  readdirSync(__dirname)
    .filter((file) => file.endsWith('.html'))
    .sort()
    .map((file) => [
      file === 'index.html' ? 'main' : file.replace(/\.html$/, ''),
      resolve(__dirname, file),
    ])
)

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input },
  },
})
