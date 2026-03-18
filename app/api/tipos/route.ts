import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const tipos = await prisma.tipoTarefa.findMany({
            where: { usuarioId: session.user.id, ativo: true },
            orderBy: { nome: 'asc' },
        })
        return NextResponse.json(tipos)
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar tipos' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const body = await request.json()
        const { nome, cor } = body
        if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

        const tipo = await prisma.tipoTarefa.create({
            data: { nome: nome.trim(), cor: cor || '#6366f1', usuarioId: session.user.id },
        })
        return NextResponse.json(tipo, { status: 201 })
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Já existe um tipo com esse nome' }, { status: 409 })
        return NextResponse.json({ error: 'Erro ao criar tipo' }, { status: 500 })
    }
}
