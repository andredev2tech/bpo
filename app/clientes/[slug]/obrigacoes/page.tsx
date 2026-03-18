import { redirect } from 'next/navigation'
export default async function ClienteObrigacoesRedirect({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    redirect(`/clientes/${slug}/configuracoes/tarefas`)
}