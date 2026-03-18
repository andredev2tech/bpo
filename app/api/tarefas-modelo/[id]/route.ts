import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params
        const tarefa = await prisma.tarefaModelo.findFirst({
            where: { id, usuarioId: session.user.id }, // garante que pertence ao usuário
        })
        if (!tarefa) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
        return NextResponse.json(tarefa)
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar tarefa' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const { nome, tipoId, recorrencia, diaSemana, diaDoMes, mesDoAno, horaLimite } = body

        if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
        if (recorrencia === 'SEMANAL' && diaSemana == null)
            return NextResponse.json({ error: 'Informe o dia da semana' }, { status: 400 })
        if (recorrencia === 'MENSAL' && !diaDoMes)
            return NextResponse.json({ error: 'Informe o dia do mês' }, { status: 400 })
        if (recorrencia === 'ANUAL' && !mesDoAno)
            return NextResponse.json({ error: 'Informe o mês' }, { status: 400 })

        // Verifica ownership antes de atualizar
        const existente = await prisma.tarefaModelo.findFirst({ where: { id, usuarioId: session.user.id } })
        if (!existente) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

        const tarefa = await prisma.tarefaModelo.update({
            where: { id },
            data: {
                nome: nome.trim(), tipoId, recorrencia,
                diaSemana: recorrencia === 'SEMANAL' ? Number(diaSemana) : null,
                diaDoMes: recorrencia === 'MENSAL' ? Number(diaDoMes) : null,
                mesDoAno: recorrencia === 'ANUAL' ? Number(mesDoAno) : null,
                horaLimite: horaLimite || null,
            },
        })
        return NextResponse.json(tarefa)
    } catch {
        return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params
        // Verifica ownership antes de deletar
        const existente = await prisma.tarefaModelo.findFirst({ where: { id, usuarioId: session.user.id } })
        if (!existente) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

        await prisma.tarefaModelo.update({ where: { id }, data: { ativo: false } })
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Erro ao remover tarefa' }, { status: 500 })
    }
}
