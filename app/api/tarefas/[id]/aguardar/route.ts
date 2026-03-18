import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const { motivo, responsavel } = body

        if (!motivo) return NextResponse.json({ error: 'Motivo é obrigatório' }, { status: 400 })
        if (responsavel !== 'CLIENTE' && responsavel !== 'INTERNO') return NextResponse.json({ error: 'Responsável inválido' }, { status: 400 })

        const tarefa = await prisma.tarefa.findFirst({
            where: { id, tarefaConfig: { cliente: { usuarioId: session.user.id } } },
        })
        if (!tarefa) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
        if (tarefa.status === 'CONCLUIDA') return NextResponse.json({ error: 'Tarefa finalizada não pode ficar aguardando' }, { status: 400 })

        const atualizada = await prisma.tarefa.update({
            where: { id },
            data: {
                status: 'AGUARDANDO',
                aguardandoDesde: new Date(),
                aguardandoMotivo: motivo,
                aguardandoResponsavel: responsavel,
            },
        })
        return NextResponse.json(atualizada)
    } catch {
        return NextResponse.json({ error: 'Erro ao colocar tarefa em espera' }, { status: 500 })
    }
}
