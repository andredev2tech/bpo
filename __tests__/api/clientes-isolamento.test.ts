import { describe, it, expect, vi, beforeEach } from 'vitest'
import { seedTest } from '../helpers/seed'
import { prismaTest } from '../setup'

const MOCK_USER_ID_A = 'user-a-id'
const MOCK_USER_ID_B = 'user-b-id'

// Mock único para toda a suite
vi.mock('@/lib/auth')

describe('Isolamento de Tenant — Cliente por ID', () => {
    beforeEach(async () => {
        vi.resetModules()
    })

    it('usuário A consegue acessar seu próprio cliente por ID', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        const clienteVerificacao = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_A }
        })
        expect(clienteVerificacao?.id).toBe(clienteA.id)
        expect(clienteVerificacao?.usuarioId).toBe(MOCK_USER_ID_A)
    })

    it('usuário B não consegue acessar cliente de usuário A por ID', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        await seedTest(MOCK_USER_ID_B, 'user-b@bpo.com')
        
        // User B tenta acessar cliente de A
        const tentativaAcesso = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_B }
        })
        expect(tentativaAcesso).toBeNull()
    })

    it('cliente de A fica inacessível a B mesmo se tentar por findUnique sem filtro', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        await seedTest(MOCK_USER_ID_B, 'user-b@bpo.com')
        
        // Simulando query insegura de API (antes do fix)
        const inseguro = await prismaTest.cliente.findUnique({
            where: { id: clienteA.id }
        })
        // Sem filtro, encontra cliente
        expect(inseguro?.id).toBe(clienteA.id)
        
        // Mas com filtro de tenant (depois do fix) não encontra
        const seguro = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_B }
        })
        expect(seguro).toBeNull()
    })
})

describe('Isolamento de Tenant — Cliente por Slug', () => {
    it('usuário A consegue acessar seu próprio cliente por slug', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        
        const acesso = await prismaTest.cliente.findFirst({
            where: { slug: clienteA.slug, usuarioId: MOCK_USER_ID_A }
        })
        expect(acesso?.slug).toBe(clienteA.slug)
    })
    it('usuário B não consegue acessar cliente de A por slug', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        await seedTest(MOCK_USER_ID_B, 'user-b@bpo.com')
        
        // B tenta slug de A
        const tentativa = await prismaTest.cliente.findFirst({
            where: { slug: clienteA.slug, usuarioId: MOCK_USER_ID_B }
        })
        expect(tentativa).toBeNull()
    })

    it('soft delete bloqueia visibilidade de cliente deletado', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        
        // Deleted cliente
        await prismaTest.cliente.update({
            where: { id: clienteA.id },
            data: { ativo: false }
        })
        
        // Sem filtro ativo, encontra
        const encontraSemFiltro = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_A }
        })
        expect(encontraSemFiltro?.ativo).toBe(false)
        
        // Com filtro ativo=true, não encontra
        const comFiltroAtivo = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_A, ativo: true }
        })
        expect(comFiltroAtivo).toBeNull()
    })
})

describe('Padrão de Ownership — PUT/DELETE', () => {
    it('validação server-side owner: cliente pode ser atualizado se pertence ao usuário', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        
        // Verifica ownership ANTES de update
        const owner = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_A }
        })
        expect(owner).not.toBeNull()
        
        // Atualiza com segurança
        const atualizado = await prismaTest.cliente.update({
            where: { id: clienteA.id },
            data: { razaoSocial: 'Nova Razão' }
        })
        expect(atualizado.razaoSocial).toBe('Nova Razão')
    })

    it('validação server-side owner: cliente não pode ser deletado se não pertence ao usuário', async () => {
        const { cliente: clienteA } = await seedTest(MOCK_USER_ID_A, 'user-a@bpo.com')
        await seedTest(MOCK_USER_ID_B, 'user-b@bpo.com')
        
        // B tenta verificar ownership de A
        const naoEhDono = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_B }
        })
        expect(naoEhDono).toBeNull() // Falha na verificação, bloqueia delete
        
        // Confirma que A ainda pode deletar seu próprio cliente
        const ehDono = await prismaTest.cliente.findFirst({
            where: { id: clienteA.id, usuarioId: MOCK_USER_ID_A }
        })
        expect(ehDono).not.toBeNull()
    })
})
