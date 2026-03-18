import TarefaForm from '@/components/TarefaForm'
export default async function EditarTarefaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <TarefaForm id={id} />
}
