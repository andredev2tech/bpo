'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type TipoTarefa = {
    id: string
    nome: string
    cor: string
}

type TarefaModelo = {
    id: string
    nome: string
    tipo: TipoTarefa
    recorrencia: 'DIARIA' | 'SEMANAL' | 'DIAS_UTEIS' | 'MENSAL' | 'ANUAL'
    diaSemana: number | null
    diaDoMes: number | null
    mesDoAno: number | null
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function recorrenciaLabel(t: TarefaModelo) {
    if (t.recorrencia === 'DIARIA') return 'Diária'
    if (t.recorrencia === 'DIAS_UTEIS') return 'Dias úteis'
    if (t.recorrencia === 'SEMANAL') return `Semanal — ${DIAS_SEMANA[t.diaSemana ?? 1]}`
    if (t.recorrencia === 'MENSAL') return `Mensal — dia ${t.diaDoMes || '?'}`
    if (t.recorrencia === 'ANUAL') return `Anual — ${MESES[(t.mesDoAno ?? 1) - 1] || '?'}`
    return '—'
}

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
}

export default function TarefasPage() {
    const [tarefas, setTarefas] = useState<TarefaModelo[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [deletando, setDeletando] = useState<string | null>(null)

    useEffect(() => { carregar() }, [])

    async function carregar() {
        setLoading(true)
        const res = await fetch('/api/tarefas-modelo')
        const data = await res.json()
        setTarefas(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    async function remover(id: string) {
        if (!confirm('Remover esta tarefa do catálogo?')) return
        setDeletando(id)
        await fetch(`/api/tarefas-modelo/${id}`, { method: 'DELETE' })
        setTarefas(prev => prev.filter(t => t.id !== id))
        setDeletando(null)
    }

    const filtradas = tarefas
        .filter(t =>
            t.nome.toLowerCase().includes(busca.toLowerCase()) ||
            t.tipo.nome.toLowerCase().includes(busca.toLowerCase())
        )
        .sort((a, b) => {
            const cmpTipo = a.tipo.nome.localeCompare(b.tipo.nome)
            if (cmpTipo !== 0) return cmpTipo
            return a.nome.localeCompare(b.nome)
        })

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0 w-full lg:w-1/2">
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-zinc-800">Catálogo de tarefas</h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                        {tarefas.length} tarefa{tarefas.length !== 1 ? 's' : ''} cadastrada{tarefas.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Buscar tarefa..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="w-56 text-sm bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-zinc-600 placeholder:text-zinc-400 outline-none focus:border-blue-200 focus:bg-white transition-colors"
                    />
                    <Link
                        href="/tarefas/novo"
                        className="text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors flex-shrink-0"
                    >
                        + Nova tarefa
                    </Link>
                </div>
            </div>

            {/* Lista */}
            <main className="flex-1 overflow-y-auto px-6 py-5">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-sm text-zinc-400">Carregando...</p>
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <p className="text-sm text-zinc-400">
                            {busca ? 'Nenhuma tarefa encontrada.' : 'Nenhuma tarefa no catálogo ainda.'}
                        </p>
                        {!busca && (
                            <Link href="/tarefas/novo" className="text-sm text-blue-500 hover:underline">
                                Cadastrar primeira tarefa
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 w-full lg:w-1/2">
                        {filtradas.map(t => (
                            <div key={t.id} className="bg-white border border-zinc-100 rounded-lg px-5 py-3.5 flex items-center gap-4 hover:border-zinc-200 transition-colors">
                                {/* Indicador de cor do tipo */}
                                <div
                                    className="w-1.5 h-8 rounded-full flex-shrink-0"
                                    style={{ background: t.tipo.cor }}
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-800 truncate">{t.nome}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{recorrenciaLabel(t)}</p>
                                </div>

                                {/* Badge tipo dinâmico */}
                                <span
                                    className="text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                                    style={{
                                        background: hexToRgba(t.tipo.cor, 0.1),
                                        color: t.tipo.cor,
                                    }}
                                >
                                    {t.tipo.nome}
                                </span>

                                {/* Ações */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href={`/tarefas/${t.id}`}
                                        className="text-xs text-zinc-400 hover:text-blue-500 transition-colors px-2 py-1 rounded hover:bg-zinc-50"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => remover(t.id)}
                                        disabled={deletando === t.id}
                                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-zinc-50 disabled:opacity-50"
                                    >
                                        {deletando === t.id ? '...' : 'Remover'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}