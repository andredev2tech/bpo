import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import TarefasPainelDia from '@/components/TarefasPainelDia'

export default async function ClienteTarefasPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { slug } = await params

    const cliente = await prisma.cliente.findFirst({
        where: { slug, usuarioId: session.user.id },
    })

    if (!cliente) redirect('/')

    // Encontrar o "fim do dia de hoje"
    const hojeInicio = new Date()
    hojeInicio.setHours(0, 0, 0, 0)
    const hojeFim = new Date()
    hojeFim.setHours(23, 59, 59, 999)

    // Busca apenas as tarefas pendentes E que a data seja <= a hoje, 
    // ou tarefas que foram concluídas exatamente hoje.
    const tarefas = await prisma.tarefa.findMany({
        where: {
            clienteId: cliente.id,
            OR: [
                { status: { not: 'CONCLUIDA' }, data: { lte: hojeFim } },
                { status: 'CONCLUIDA', finalizadaEm: { gte: hojeInicio, lte: hojeFim } }
            ]
        },
        include: {
            tarefaConfig: {
                include: {
                    tipo: true
                }
            }
        },
        orderBy: [
            { data: 'asc' },        // Atrasadas primeiro
            { horaLimite: 'asc' }   // Mais cedo primeiro
        ]
    })

    function nomeExibicao(c: { nomeFantasia: string | null; razaoSocial: string }) {
        return c.nomeFantasia || c.razaoSocial
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
                <Link href="/clientes" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: cliente.cor }}>
                        {nomeExibicao(cliente).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-zinc-800">{nomeExibicao(cliente)}</h2>
                        {cliente.nomeFantasia && (
                            <p className="text-[11px] text-zinc-400">{cliente.razaoSocial}</p>
                        )}
                    </div>
                </div>
                <Link
                    href={`/clientes/${cliente.slug}/editar`}
                    className="text-sm text-zinc-400 border border-zinc-200 rounded-lg px-4 py-2 hover:bg-zinc-50 transition-colors"
                >
                    Editar dados
                </Link>
            </div>
            <TarefasPainelDia tarefasIniciais={tarefas} slug={slug} />
        </div>
    )
}