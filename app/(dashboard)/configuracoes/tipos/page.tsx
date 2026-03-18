'use client'

import { useEffect, useState } from 'react'

type TipoTarefa = { id: string; nome: string; cor: string; ativo: boolean }

export default function ConfiguracoesTiposPage() {
    const [tipos, setTipos] = useState<TipoTarefa[]>([])
    const [novo, setNovo] = useState({ nome: '', cor: '#6366f1' })
    const [editando, setEditando] = useState<TipoTarefa | null>(null)
    const [erro, setErro] = useState('')
    const [salvando, setSalvando] = useState(false)

    async function carregar() {
        const r = await fetch('/api/tipos')
        const data = await r.json()
        setTipos(data)
    }

    useEffect(() => { carregar() }, [])

    async function criar() {
        if (!novo.nome.trim()) { setErro('Nome é obrigatório'); return }
        setSalvando(true)
        const r = await fetch('/api/tipos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novo),
        })
        const data = await r.json()
        if (!r.ok) { setErro(data.error || 'Erro ao criar'); setSalvando(false); return }
        setNovo({ nome: '', cor: '#6366f1' })
        setErro('')
        setSalvando(false)
        carregar()
    }

    async function salvarEdicao() {
        if (!editando) return
        if (!editando.nome.trim()) { setErro('Nome é obrigatório'); return }
        setSalvando(true)
        const r = await fetch(`/api/tipos/${editando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: editando.nome, cor: editando.cor }),
        })
        const data = await r.json()
        if (!r.ok) { setErro(data.error || 'Erro ao salvar'); setSalvando(false); return }
        setEditando(null)
        setErro('')
        setSalvando(false)
        carregar()
    }

    async function remover(id: string) {
        if (!confirm('Remover este tipo? As tarefas com este tipo não serão afetadas.')) return
        await fetch(`/api/tipos/${id}`, { method: 'DELETE' })
        carregar()
    }

    const inputCls = "text-sm bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 outline-none focus:border-blue-300 transition-colors"

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex-shrink-0">
                <h2 className="text-base font-semibold text-zinc-800">Tipos de tarefa</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Categorias reutilizáveis para classificar suas tarefas</p>
            </div>

            <main className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-lg space-y-6">

                    {/* Formulário de criação */}
                    <div className="bg-white border border-zinc-100 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-medium text-zinc-500">Novo tipo</p>
                        <div className="flex gap-2">
                            <input
                                value={novo.nome} onChange={e => { setNovo(p => ({ ...p, nome: e.target.value })); setErro('') }}
                                onKeyDown={e => e.key === 'Enter' && criar()}
                                placeholder="Nome do tipo (ex: Fiscal, Trabalhista...)"
                                className={`${inputCls} flex-1`}
                            />
                            <div className="flex items-center gap-1.5">
                                <input type="color" value={novo.cor} onChange={e => setNovo(p => ({ ...p, cor: e.target.value }))}
                                    className="w-9 h-9 rounded-md border border-zinc-200 cursor-pointer p-0.5" title="Cor" />
                            </div>
                            <button onClick={criar} disabled={salvando}
                                className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 rounded-lg px-4 py-2 transition-colors">
                                Adicionar
                            </button>
                        </div>
                        {erro && <p className="text-xs text-red-500">{erro}</p>}
                    </div>

                    {/* Lista */}
                    {tipos.length === 0 ? (
                        <p className="text-sm text-zinc-400">Nenhum tipo cadastrado ainda.</p>
                    ) : (
                        <div className="space-y-2">
                            {tipos.map(t => (
                                <div key={t.id} className="bg-white border border-zinc-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                    {editando?.id === t.id ? (
                                        <>
                                            <input type="color" value={editando.cor}
                                                onChange={e => setEditando(p => p && ({ ...p, cor: e.target.value }))}
                                                className="w-8 h-8 rounded-md border border-zinc-200 cursor-pointer p-0.5" />
                                            <input value={editando.nome}
                                                onChange={e => setEditando(p => p && ({ ...p, nome: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && salvarEdicao()}
                                                className={`${inputCls} flex-1`} />
                                            <button onClick={salvarEdicao} disabled={salvando}
                                                className="text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-lg px-3 py-1.5 transition-colors">
                                                Salvar
                                            </button>
                                            <button onClick={() => setEditando(null)}
                                                className="text-xs text-zinc-400 hover:text-zinc-600">
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.cor }} />
                                            <span className="flex-1 text-sm text-zinc-700">{t.nome}</span>
                                            <button onClick={() => setEditando(t)}
                                                className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                                                Editar
                                            </button>
                                            <button onClick={() => remover(t.id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition-colors">
                                                Remover
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
