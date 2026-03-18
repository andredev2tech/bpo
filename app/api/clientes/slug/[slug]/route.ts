import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { slug } = await params
        const cliente = await prisma.cliente.findFirst({ where: { slug, usuarioId: session.user.id } })
        if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
        return NextResponse.json(cliente)
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 })
    }
}