import ClienteForm from '@/components/ClienteForm'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function EditarClientePage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { slug } = await params
    const cliente = await prisma.cliente.findFirst({ where: { slug, usuarioId: session.user.id } })
    if (!cliente) notFound()
    return <ClienteForm id={cliente.id} />
}