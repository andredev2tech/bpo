import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const { nome, cor } = body
        if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

        const existente = await prisma.tipoTarefa.findFirst({ where: { id, usuarioId: session.user.id } })
        if (!existente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

        const tipo = await prisma.tipoTarefa.update({
            where: { id },
            data: { nome: nome.trim(), ...(cor && { cor }) },
        })
        return NextResponse.json(tipo)
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Já existe um tipo com esse nome' }, { status: 409 })
        return NextResponse.json({ error: 'Erro ao atualizar tipo' }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params
        const existente = await prisma.tipoTarefa.findFirst({ where: { id, usuarioId: session.user.id } })
        if (!existente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

        // Soft delete — mantém integridade referencial com tarefasModelo e tarefasConfig
        await prisma.tipoTarefa.update({ where: { id }, data: { ativo: false } })
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Erro ao remover tipo' }, { status: 500 })
    }
}
