import { PrismaClient } from '@prisma/client'
import { beforeEach, afterAll } from 'vitest'

const databaseUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL

export const prismaTest = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
})

beforeEach(async () => {
    await prismaTest.tarefa.deleteMany()
    await prismaTest.vencimento.deleteMany()
    await prismaTest.tarefaConfig.deleteMany()
    await prismaTest.tarefaModelo.deleteMany()
    await prismaTest.tipoTarefa.deleteMany()   // ← novo modelo
    await prismaTest.cliente.deleteMany()
    await prismaTest.usuario.deleteMany()
})

afterAll(async () => {
    await prismaTest.$disconnect()
})
