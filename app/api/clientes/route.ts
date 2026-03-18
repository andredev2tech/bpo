import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const clientes = await prisma.cliente.findMany({
            where: { ativo: true, usuarioId: session.user.id },
            orderBy: { razaoSocial: 'asc' },
        })
        return NextResponse.json(clientes)
    } catch {
        return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const body = await request.json()
        const { razaoSocial, nomeFantasia, slug, cnpj, email, telefone, nomeContato, cor } = body

        if (!razaoSocial?.trim()) return NextResponse.json({ error: 'Razão social é obrigatória' }, { status: 400 })
        if (!slug?.trim()) return NextResponse.json({ error: 'Identificador (slug) é obrigatório' }, { status: 400 })

        const cliente = await prisma.cliente.create({
            data: {
                razaoSocial: razaoSocial.trim(),
                nomeFantasia: nomeFantasia?.trim() || null,
                slug: slug.trim(),
                cnpj: cnpj?.trim() || null,
                email: email?.trim() || null,
                telefone: telefone?.trim() || null,
                nomeContato: nomeContato?.trim() || null,
                cor: cor || '#6366f1',
                usuarioId: session.user.id, // sempre da sessão
            },
        })
        return NextResponse.json(cliente, { status: 201 })
    } catch (e: any) {
        if (e.code === 'P2002') {
            const campo = e.meta?.target?.includes('slug') ? 'Identificador (slug)' : 'CNPJ'
            return NextResponse.json({ error: `${campo} já está em uso` }, { status: 409 })
        }
        return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
    }
}
