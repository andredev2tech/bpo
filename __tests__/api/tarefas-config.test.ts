import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/clientes/slug/[slug]/tarefas-config/route'
import { PATCH } from '@/app/api/clientes/slug/[slug]/tarefas-config/[id]/route'
import { seedTest } from '../helpers/seed'

const MOCK_USER_ID = 'user-test-id'

vi.mock('@/lib/auth', () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: 'user-test-id', email: 'teste@bpo.com', name: 'Teste User' },
    }),
}))

const makeParams = (params: Record<string, string>) =>
    ({ params: Promise.resolve(params) }) as any

describe('GET /api/clientes/slug/[slug]/tarefas-config', () => {
    it('retorna modelos, vinculadas e específicas', async () => {
        const { cliente } = await seedTest(MOCK_USER_ID)
        const res = await GET(new Request('http://test'), makeParams({ slug: cliente.slug }))
        const data = await res.json()
        expect(res.status).toBe(200)
        expect(data).toHaveProperty('modelos')
        expect(data).toHaveProperty('vinculadas')
        expect(data).toHaveProperty('especificas')
    })

    it('retorna 404 para slug inexistente', async () => {
        const res = await GET(new Request('http://test'), makeParams({ slug: 'nao-existe' }))
        expect(res.status).toBe(404)
    })
})

describe('POST /api/clientes/slug/[slug]/tarefas-config', () => {
    it('vincula um modelo ao cliente', async () => {
        const { cliente, modelo, tipo } = await seedTest(MOCK_USER_ID)
        const req = new Request('http://test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modeloId: modelo.id, nome: modelo.nome, tipoId: tipo.id, recorrencia: modelo.recorrencia }),
        })
        const res = await POST(req, makeParams({ slug: cliente.slug }))
        const data = await res.json()
        expect(res.status).toBe(201)
        expect(data.modeloId).toBe(modelo.id)
        expect(data.clienteId).toBe(cliente.id)
    })

    it('cria tarefa específica com ANUAL', async () => {
        const { cliente, tipo } = await seedTest(MOCK_USER_ID)
        const req = new Request('http://test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: 'Renovação Alvará', tipoId: tipo.id, recorrencia: 'ANUAL', diaDoMes: 10, mesDoAno: 6 }),
        })
        const res = await POST(req, makeParams({ slug: cliente.slug }))
        const data = await res.json()
        expect(res.status).toBe(201)
        expect(data.recorrencia).toBe('ANUAL')
        expect(data.mesDoAno).toBe(6)
        expect(data.modeloId).toBeNull()
    })
})

describe('PATCH /api/clientes/slug/[slug]/tarefas-config/[id]', () => {
    it('desativa uma config (ativo: false)', async () => {
        const { cliente, modelo, tipo } = await seedTest(MOCK_USER_ID)
        const postReq = new Request('http://test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modeloId: modelo.id, nome: modelo.nome, tipoId: tipo.id, recorrencia: modelo.recorrencia }),
        })
        const postRes = await POST(postReq, makeParams({ slug: cliente.slug }))
        const config = await postRes.json()

        const patchReq = new Request('http://test', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: false }),
        })
        const res = await PATCH(patchReq, makeParams({ slug: cliente.slug, id: config.id }))
        const data = await res.json()
        expect(res.status).toBe(200)
        expect(data.ativo).toBe(false)
    })
})
