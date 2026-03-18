import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/tarefas-modelo/route'
import { seedTest } from '../helpers/seed'

const MOCK_USER_ID = 'user-test-id'

vi.mock('@/lib/auth', () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: 'user-test-id', email: 'teste@bpo.com', name: 'Teste User' },
    }),
}))

describe('GET /api/tarefas-modelo', () => {
    it('retorna array vazio quando não há modelos', async () => {
        const res = await GET()
        const data = await res.json()
        expect(res.status).toBe(200)
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBe(0)
    })

    it('retorna modelos com tipo incluído', async () => {
        await seedTest(MOCK_USER_ID)
        const res = await GET()
        const data = await res.json()
        expect(res.status).toBe(200)
        expect(data.length).toBeGreaterThan(0)
        expect(data[0]).toHaveProperty('nome')
        expect(data[0]).toHaveProperty('tipo')      // objeto tipo incluído
        expect(data[0].tipo).toHaveProperty('nome')
    })
})

describe('POST /api/tarefas-modelo', () => {
    it('cria modelo com tipoId válido', async () => {
        const { tipo } = await seedTest(MOCK_USER_ID)
        const req = new Request('http://test/api/tarefas-modelo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: 'Novo Modelo', tipoId: tipo.id, recorrencia: 'MENSAL', diaDoMes: 15 }),
        })
        const res = await POST(req)
        const data = await res.json()
        expect(res.status).toBe(201)
        expect(data.nome).toBe('Novo Modelo')
        expect(data.tipoId).toBe(tipo.id)
        expect(data.tipo.nome).toBe('Conciliação Teste')
    })

    it('cria modelo com recorrência ANUAL', async () => {
        const { tipo } = await seedTest(MOCK_USER_ID)
        const req = new Request('http://test/api/tarefas-modelo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: 'Renovação Alvará', tipoId: tipo.id, recorrencia: 'ANUAL', mesDoAno: 3 }),
        })
        const res = await POST(req)
        const data = await res.json()
        expect(res.status).toBe(201)
        expect(data.recorrencia).toBe('ANUAL')
        expect(data.mesDoAno).toBe(3)
    })

    it('rejeita ANUAL sem mesDoAno', async () => {
        const { tipo } = await seedTest(MOCK_USER_ID)
        const req = new Request('http://test/api/tarefas-modelo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: 'Teste', tipoId: tipo.id, recorrencia: 'ANUAL', diaDoMes: 15 }),
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it('rejeita sem tipoId', async () => {
        const req = new Request('http://test/api/tarefas-modelo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: 'Teste', recorrencia: 'MENSAL', diaDoMes: 5 }),
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })
})
