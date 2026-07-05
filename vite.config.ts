import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Dev only: the dev server's SPA fallback would serve index.html for `/gen`
// (no trailing slash), showing the main page instead of the generator.
// Redirect `/gen` -> `/gen/` so it matches production (GitHub Pages does this
// automatically for directory pages).
function genTrailingSlash(): Plugin {
  return {
    name: 'gen-trailing-slash',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (url === '/gen' || url.startsWith('/gen?')) {
          res.writeHead(302, { Location: '/gen/' + url.slice('/gen'.length) })
          res.end()
          return
        }
        next()
      })
    },
  }
}

// Custom domain (pay.chaparro.pt) serves from the root, so base is '/'.
// Multi-page: the payment page (index.html) and the /gen link builder.
export default defineConfig({
  base: '/',
  plugins: [react(), genTrailingSlash()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        gen: fileURLToPath(new URL('./gen/index.html', import.meta.url)),
      },
    },
  },
})
