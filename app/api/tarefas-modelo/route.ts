import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const tarefas = await prisma.tarefaModelo.findMany({
            where: { ativo: true, usuarioId: session.user.id },
            include: { tipo: true },
            orderBy: { nome: 'asc' },
        })
        return NextResponse.json(tarefas)
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar tarefas' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const body = await request.json()
        const { nome, tipoId, recorrencia, diaSemana, diaDoMes, mesDoAno, horaLimite } = body

        if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
        if (!tipoId) return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 })
        if (!recorrencia) return NextResponse.json({ error: 'Recorrência é obrigatória' }, { status: 400 })
        if (recorrencia === 'SEMANAL' && diaSemana == null)
            return NextResponse.json({ error: 'Informe o dia da semana' }, { status: 400 })
        if (recorrencia === 'MENSAL' && !diaDoMes)
            return NextResponse.json({ error: 'Informe o dia do mês' }, { status: 400 })
        if (recorrencia === 'ANUAL' && !mesDoAno)
            return NextResponse.json({ error: 'Informe o mês' }, { status: 400 })

        // Verifica que o tipo pertence ao usuário
        const tipo = await prisma.tipoTarefa.findFirst({ where: { id: tipoId, usuarioId: session.user.id } })
        if (!tipo) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })

        const tarefa = await prisma.tarefaModelo.create({
            data: {
                nome: nome.trim(), tipoId, recorrencia, usuarioId: session.user.id,
                diaSemana: recorrencia === 'SEMANAL' ? Number(diaSemana) : null,
                diaDoMes: recorrencia === 'MENSAL' ? Number(diaDoMes) : null,
                mesDoAno: recorrencia === 'ANUAL' ? Number(mesDoAno) : null,
                horaLimite: horaLimite || '17:00',
            },
            include: { tipo: true },
        })
        return NextResponse.json(tarefa, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
    }
}
