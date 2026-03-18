import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const cliente = await prisma.cliente.findFirst({ where: { id, usuarioId: session.user.id } })
    if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    return NextResponse.json(cliente)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { razaoSocial, nomeFantasia, slug, cnpj, email, telefone, nomeContato, cor } = body

    if (!razaoSocial?.trim()) {
      return NextResponse.json({ error: 'Razão social é obrigatória' }, { status: 400 })
    }
    if (!slug?.trim()) {
      return NextResponse.json({ error: 'Identificador (slug) é obrigatório' }, { status: 400 })
    }

    const existente = await prisma.cliente.findFirst({ where: { id, usuarioId: session.user.id } })
    if (!existente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia?.trim() || null,
        slug: slug.trim(),
        cnpj: cnpj?.trim() || null,
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        nomeContato: nomeContato?.trim() || null,
        cor: cor || '#6366f1',
      },
    })
    return NextResponse.json(cliente)
  } catch (e: any) {
    if (e.code === 'P2002') {
      const campo = e.meta?.target?.includes('slug') ? 'Identificador (slug)' : 'CNPJ'
      return NextResponse.json({ error: `${campo} já está em uso` }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const existente = await prisma.cliente.findFirst({ where: { id, usuarioId: session.user.id } })
    if (!existente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

    await prisma.cliente.update({
      where: { id },
      data: { ativo: false },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao remover cliente' }, { status: 500 })
  }
}