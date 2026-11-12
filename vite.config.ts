import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// Mirrors the /plex/* proxy in the Caddyfile so `npm run dev` and `npm run preview`
// behave like the container: the browser calls /plex/..., and the token is added
// here, server-side. PLEX_SERVER_URL and PLEX_TOKEN are deliberately not VITE_-
// prefixed, so Vite never exposes them to client code.
const plexProxy = (env: Record<string, string>): Record<string, ProxyOptions> | undefined => {
  const target = (env.PLEX_SERVER_URL || env.PLEX_URL || '').replace(/\/+$/, '')
  if (!target) return undefined
  return {
    '/plex': {
      target,
      changeOrigin: true,
      rewrite: path => path.replace(/^\/plex/, ''),
      headers: { 'X-Plex-Token': env.PLEX_TOKEN ?? '' },
      // Same allowlist as the Caddyfile: read-only library data and images.
      // Returning false makes Vite answer 404 instead of proxying.
      bypass: req => {
        const path = req.url ?? ''
        const allowed =
          (req.method === 'GET' || req.method === 'HEAD') &&
          (path.startsWith('/plex/library/') || path.startsWith('/plex/photo/:/transcode'))
        if (!allowed) return false
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const proxy = plexProxy(loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react()],
    preview: {
      port: 5173,
      host: '0.0.0.0',
      proxy,
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy,
    },
  }
})
