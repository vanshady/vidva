import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// Same allowlist as the Caddyfile: the exact read-only request shapes the
// dashboard makes. Patterns exclude '.', '%' and '\', so encoded or dot-segment
// tricks can't reach other Plex endpoints.
const LIBRARY_PATH = /^\/library\/(sections|sections\/[0-9]+\/all|metadata\/[0-9]+(,[0-9]+)*|metadata\/[0-9]+\/thumb\/[0-9]+)$/
const THUMB_PATH = /^\/library\/metadata\/[0-9]+\/thumb\/[0-9]+$/
const DIMENSION = /^[0-9]{1,4}$/

/** Maps a browser request (/plex/...) to the Plex request to forward, or null to refuse it. */
const toPlexRequest = (method: string | undefined, rawUrl: string): string | null => {
  if (method !== 'GET' && method !== 'HEAD') return null
  if (!rawUrl.startsWith('/plex/')) return null
  const rest = rawUrl.slice('/plex'.length)
  const q = rest.indexOf('?')
  const path = q === -1 ? rest : rest.slice(0, q)
  const query = q === -1 ? '' : rest.slice(q + 1)

  if (LIBRARY_PATH.test(path)) return rest

  // Plex's transcoder fetches whatever `url` names (remote URLs included), so
  // the request is rebuilt from validated parts, never forwarded as-is.
  if (path === '/photo/:/transcode') {
    const params = new URLSearchParams(query)
    const url = params.getAll('url')
    const width = params.get('width') ?? ''
    const height = params.get('height') ?? ''
    if (url.length !== 1 || !THUMB_PATH.test(url[0]) || !DIMENSION.test(width) || !DIMENSION.test(height)) return null
    return `/photo/:/transcode?${new URLSearchParams({ width, height, minSize: '1', upscale: '1', url: url[0] })}`
  }
  return null
}

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
      headers: { 'X-Plex-Token': env.PLEX_TOKEN ?? '' },
      // Returning false makes Vite answer 404 instead of proxying.
      bypass: req => (toPlexRequest(req.method, req.url ?? '') === null ? false : undefined),
      // Only reached for allowed requests; `bypass` has already refused the rest.
      rewrite: url => toPlexRequest('GET', url) ?? '/__vidva_refused__',
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
