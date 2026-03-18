import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const cliente = await prisma.cliente.findFirst({ where: { slug } })
        if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
        return NextResponse.json(cliente)
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 })
    }
}