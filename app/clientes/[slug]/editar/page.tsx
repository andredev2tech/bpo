import ClienteForm from '@/components/ClienteForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditarClientePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const cliente = await prisma.cliente.findFirst({ where: { slug } })
    if (!cliente) notFound()
    return <ClienteForm id={cliente.id} />
}