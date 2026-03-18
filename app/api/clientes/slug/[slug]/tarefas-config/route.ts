import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { slug } = await params
        const cliente = await prisma.cliente.findFirst({ where: { slug, usuarioId: session.user.id } })
        if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

        const [modelos, vinculadas, especificas] = await Promise.all([
            prisma.tarefaModelo.findMany({
                where: { ativo: true, usuarioId: session.user.id },
                include: { tipo: true },
                orderBy: [{ tipo: { nome: 'asc' } }, { nome: 'asc' }],
            }),
            prisma.tarefaConfig.findMany({
                where: { clienteId: cliente.id, ativo: true, modeloId: { not: null } },
                include: { tipo: true },
                orderBy: { nome: 'asc' },
            }),
            prisma.tarefaConfig.findMany({
                where: { clienteId: cliente.id, modeloId: null },
                include: { tipo: true },
                orderBy: { nome: 'asc' },
            }),
        ])

        return NextResponse.json({ clienteId: cliente.id, modelos, vinculadas, especificas })
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar tarefas' }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: Params) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { slug } = await params
        const body = await request.json()
        const { nome, tipoId, recorrencia, diaSemana, diaDoMes, mesDoAno, modeloId, horaLimite } = body

        const cliente = await prisma.cliente.findFirst({ where: { slug, usuarioId: session.user.id } })
        if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

        if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
        if (!tipoId) return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 })
        if (!recorrencia) return NextResponse.json({ error: 'Recorrência é obrigatória' }, { status: 400 })
        if (recorrencia === 'ANUAL' && (!diaDoMes || !mesDoAno))
            return NextResponse.json({ error: 'Informe o dia e o mês para recorrência anual' }, { status: 400 })

        const config = await prisma.tarefaConfig.create({
            data: {
                clienteId: cliente.id, modeloId: modeloId || null,
                nome: nome.trim(), tipoId, recorrencia,
                diaSemana: recorrencia === 'SEMANAL' ? Number(diaSemana) : null,
                diaDoMes: ['MENSAL', 'ANUAL'].includes(recorrencia) ? Number(diaDoMes) : null,
                mesDoAno: recorrencia === 'ANUAL' ? Number(mesDoAno) : null,
                horaLimite: horaLimite || '17:00',
            },
            include: { tipo: true },
        })

        return NextResponse.json(config, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
    }
}
