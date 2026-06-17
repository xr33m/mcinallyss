import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        'bathroom-fitting': resolve(__dirname, 'bathroom-fitting.html'),
        'bathroom-fitting-leith': resolve(__dirname, 'bathroom-fitting-leith.html'),
        'bathroom-fitting-morningside': resolve(__dirname, 'bathroom-fitting-morningside.html'),
        'bathroom-fitting-stockbridge': resolve(__dirname, 'bathroom-fitting-stockbridge.html'),
        'blocked-drains': resolve(__dirname, 'blocked-drains.html'),
        'blocked-drains-leith': resolve(__dirname, 'blocked-drains-leith.html'),
        'blocked-drains-morningside': resolve(__dirname, 'blocked-drains-morningside.html'),
        'blocked-drains-stockbridge': resolve(__dirname, 'blocked-drains-stockbridge.html'),
        'emergency-plumbing': resolve(__dirname, 'emergency-plumbing.html'),
        'emergency-plumber-leith': resolve(__dirname, 'emergency-plumber-leith.html'),
        'emergency-plumber-morningside': resolve(__dirname, 'emergency-plumber-morningside.html'),
        'emergency-plumber-stockbridge': resolve(__dirname, 'emergency-plumber-stockbridge.html'),
        'leak-repair': resolve(__dirname, 'leak-repair.html'),
        'leak-repair-leith': resolve(__dirname, 'leak-repair-leith.html'),
        'leak-repair-morningside': resolve(__dirname, 'leak-repair-morningside.html'),
        'leak-repair-stockbridge': resolve(__dirname, 'leak-repair-stockbridge.html'),
        'radiator-repair': resolve(__dirname, 'radiator-repair.html'),
        'radiator-repair-leith': resolve(__dirname, 'radiator-repair-leith.html'),
        'radiator-repair-morningside': resolve(__dirname, 'radiator-repair-morningside.html'),
        'radiator-repair-stockbridge': resolve(__dirname, 'radiator-repair-stockbridge.html'),
        'boiler-service': resolve(__dirname, 'boiler-service.html'),
        'kitchen-fitting': resolve(__dirname, 'kitchen-fitting.html'),
        'thank-you': resolve(__dirname, 'thank-you.html'),
      },
    },
  },
})
