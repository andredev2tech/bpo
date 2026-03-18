import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ slug: string; id: string }> }

export async function PATCH(request: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { slug, id } = await params
        const body = await request.json()
        const { nome, tipoId, recorrencia, diaSemana, diaDoMes, ativo, horaLimite, mesDoAno } = body

        // Verifica que o cliente pertence ao usuário logado
        const cliente = await prisma.cliente.findFirst({ where: { slug, usuarioId: session.user.id } })
        if (!cliente) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

        // Verifica que a config pertence a esse cliente
        const existente = await prisma.tarefaConfig.findFirst({ where: { id, clienteId: cliente.id } })
        if (!existente) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

        const config = await prisma.tarefaConfig.update({
            where: { id },
            data: {
                ...(ativo !== undefined && { ativo }),
                ...(nome !== undefined && { nome: nome.trim() }),
                ...(tipoId !== undefined && { tipoId }),
                ...(horaLimite !== undefined && { horaLimite: horaLimite || null }),
                ...(recorrencia !== undefined && {
                    recorrencia,
                    diaSemana: recorrencia === 'SEMANAL' ? Number(diaSemana) : null,
                    diaDoMes: ['MENSAL', 'ANUAL'].includes(recorrencia) ? Number(diaDoMes) : null,
                    mesDoAno: recorrencia === 'ANUAL' ? Number(mesDoAno) : null,
                }),
            },
        })

        return NextResponse.json(config)
    } catch {
        return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { slug, id } = await params

        const cliente = await prisma.cliente.findFirst({ where: { slug, usuarioId: session.user.id } })
        if (!cliente) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

        const existente = await prisma.tarefaConfig.findFirst({ where: { id, clienteId: cliente.id } })
        if (!existente) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

        await prisma.tarefaConfig.update({ where: { id }, data: { ativo: false } })
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Erro ao remover tarefa' }, { status: 500 })
    }
}
