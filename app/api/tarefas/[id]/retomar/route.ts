import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await params

        const tarefa = await prisma.tarefa.findFirst({
            where: { id, tarefaConfig: { cliente: { usuarioId: session.user.id } } },
        })
        if (!tarefa) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

        const atualizada = await prisma.tarefa.update({
            where: { id },
            data: { 
                status: 'EM_ANDAMENTO' as any,
                finalizadaEm: null
            },
        })
        return NextResponse.json(atualizada)
    } catch {
        return NextResponse.json({ error: 'Erro ao retomar tarefa' }, { status: 500 })
    }
}
