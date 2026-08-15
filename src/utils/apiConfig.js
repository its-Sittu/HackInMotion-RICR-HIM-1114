/**
 * Smart Production & Local API URL Resolver for PulseMed
 * Automatically routes production web traffic to live Render backend:
 * https://pulsemed-backend.onrender.com
 */
export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // 1. Explicit VITE_API_URL env var if specified
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    const base = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '')
    const pathWithoutApi = cleanPath.startsWith('/api') ? cleanPath.slice(4) : cleanPath
    return `${base}${pathWithoutApi}`
  }

  // 2. Production Deployment (Vercel / Netlify / Remote Host) -> Route to Live Render Backend
  if (typeof window !== 'undefined' && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
    return `https://pulsemed-backend.onrender.com${cleanPath}`
  }

  // 3. Local Development -> Relative /api path (handled via Vite Proxy to port 5000)
  return cleanPath
}
