import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const securityHeaders = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    // CSP omitido intencionalmente: configurar depois com domínio e CDNs definitivos
]

const nextConfig: NextConfig = {
    async headers() {
        if (isDev) return [] // desativado em dev — não quebra hot reload
        return [{ source: '/(.*)', headers: securityHeaders }]
    },
}

export default nextConfig
