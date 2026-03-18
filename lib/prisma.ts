import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// $use foi removido no Prisma 6 — timeout implementado no futuro via $extends quando necessário
// Por ora o queryTimeoutMs está a 0 fora de produção (sem efeito nos testes)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
