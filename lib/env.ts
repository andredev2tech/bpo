/**
 * Valida variáveis de ambiente na inicialização da aplicação.
 * Importar em app/layout.tsx para falhar rápido se faltar algo crítico.
 */

const required = ['DATABASE_URL', 'AUTH_SECRET'] as const

// Só obrigatórias em produção (em dev podem ser omitidas sem travar)
const prodOnly = ['SENTRY_DSN'] as const

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`[ENV] Variável obrigatória não definida: ${key}`)
    }
}

if (process.env.NODE_ENV === 'production') {
    for (const key of prodOnly) {
        if (!process.env[key]) {
            console.warn(`[ENV] Variável de produção não definida: ${key}`)
            // warn em vez de throw para não bloquear deploy se Sentry não estiver configurado ainda
        }
    }
}

export {} // necessário para o TypeScript tratar como módulo
