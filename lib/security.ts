/**
 * Feature flags de segurança — controlados por variáveis de ambiente.
 *
 * Em desenvolvimento tudo é permissivo por padrão.
 * Para testar uma feature em dev, sete a variável correspondente no .env:
 *
 *   SECURITY_RATE_LIMIT=true    → ativa rate limiting em dev
 *   SECURITY_STRICT_AUTH=false  → desativa verificação de usuarioId (CUIDADO)
 *
 * Em produção (NODE_ENV=production) tudo é ativo independente das variáveis.
 */

const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

export const security = {
    /** Rate limiting nas rotas de auth. Sempre ativo em prod. */
    rateLimitEnabled: isProd || process.env.SECURITY_RATE_LIMIT === 'true',

    /** Verifica usuarioId da sessão em todas as API routes. Sempre ativo. */
    strictAuth: process.env.SECURITY_STRICT_AUTH !== 'false',

    /** Security headers HTTP. Sempre ativo em prod, desativado em dev (quebra hot reload). */
    headersEnabled: isProd,

    /** Timeout em queries do Prisma (ms). 0 = desativado. Só ativo em produção. */
    queryTimeoutMs: isProd ? 5000 : 0,

    /** Custo do bcrypt. Baixo em dev para velocidade nos testes. */
    bcryptRounds: isDev ? 4 : 12,
} as const

/** Log apenas em dev — útil para debugar qual flag está ativa */
if (isDev) {
    console.log('[security]', security)
}
