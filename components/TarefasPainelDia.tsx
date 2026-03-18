'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Usamos any temporariamente para acelerar o desenvolvimento, mas idealmente usaríamos os tipos do Prisma.
type TarefaType = any

export default function TarefasPainelDia({
    tarefasIniciais,
    slug
}: {
    tarefasIniciais: TarefaType[]
    slug: string
}) {
    const router = useRouter()
    const [tarefas, setTarefas] = useState(tarefasIniciais)
    const [carregandoId, setCarregandoId] = useState<string | null>(null)

    // Estado para o mini-modal de aguardar
    const [aguardarId, setAguardarId] = useState<string | null>(null)
    const [aguardarMotivo, setAguardarMotivo] = useState('')
    const [aguardarResp, setAguardarResp] = useState<'CLIENTE' | 'INTERNO'>('CLIENTE')

    const updateStatus = async (id: string, action: 'iniciar' | 'pausar' | 'finalizar' | 'aguardar' | 'retomar', extraBody?: any) => {
        setCarregandoId(id)
        try {
            const res = await fetch(`/api/tarefas/${id}/${action}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: extraBody ? JSON.stringify(extraBody) : undefined
            })
            if (res.ok) {
                const atualizada = await res.json()
                setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...atualizada } : t))
                router.refresh()
            } else {
                alert('Erro ao atualizar tarefa')
            }
        } catch (e) {
            console.error(e)
            alert('Erro de conexão')
        } finally {
            setCarregandoId(null)
            if (action === 'aguardar') setAguardarId(null)
        }
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const emAndamento = tarefas.filter(t => t.status === 'EM_ANDAMENTO')
    const aguardando = tarefas.filter(t => t.status === 'AGUARDANDO')
    const pendentes = tarefas.filter(t => ['PENDENTE', 'PAUSADA'].includes(t.status))
    const concluidasHoje = tarefas.filter(t => t.status === 'CONCLUIDA')

    const atrasadas = pendentes.filter(t => new Date(t.data) < hoje)
    const venceHoje = pendentes.filter(t => new Date(t.data) >= hoje)

    const renderTempo = (t: TarefaType) => {
        if (t.status === 'EM_ANDAMENTO' && t.iniciadaEm) {
            return <span className="text-blue-600 font-semibold text-[13px]">Iniciada às {new Date(t.iniciadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        }
        if (t.status === 'PAUSADA' && t.iniciadaEm) {
            return <span className="text-zinc-500 font-semibold text-[13px]">Pausada (Iniciada às {new Date(t.iniciadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})</span>
        }
        if (t.status === 'AGUARDANDO' && t.aguardandoDesde) {
            return <span className="text-orange-600 font-semibold text-[13px]">Aguardando Desde {new Date(t.aguardandoDesde).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        }
        if (t.status === 'CONCLUIDA' && t.iniciadaEm && t.finalizadaEm) {
            const diff = new Date(t.finalizadaEm).getTime() - new Date(t.iniciadaEm).getTime()
            const mins = Math.floor(diff / 60000)
            const horaIni = new Date(t.iniciadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            const horaFim = new Date(t.finalizadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

            return <span className="text-emerald-600 font-semibold text-[13px]">Feita das {horaIni} às {horaFim} (Total: {mins}m)</span>
        }
        return null
    }

    const BadgeStatus = ({ status }: { status: string }) => {
        if (status === 'EM_ANDAMENTO') return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">FAZENDO</span>
        if (status === 'PAUSADA') return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">PAUSADA</span>
        if (status === 'AGUARDANDO') return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">AGUARDANDO</span>
        if (status === 'CONCLUIDA') return <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">CONCLUÍDA</span>
        return null
    }

    const renderTarefa = (t: TarefaType, tipoGrupo: 'ATRASADA' | 'HOJE' | 'ANDAMENTO' | 'AGUARDANDO' | 'CONCLUIDA') => {
        const isCarregando = carregandoId === t.id
        const isAguardandoMode = aguardarId === t.id
        const isConcluida = t.status === 'CONCLUIDA'

        let corLateral = t.tarefaConfig.tipo.cor
        let bgCard = 'bg-white'
        
        if (tipoGrupo === 'ATRASADA') {
            corLateral = '#ef4444' // red-500
            bgCard = 'bg-red-50/40' // Fundo destacado
        }
        if (tipoGrupo === 'ANDAMENTO') corLateral = '#047857' // emerald-700
        if (tipoGrupo === 'CONCLUIDA') corLateral = '#d4d4d8' // zinc-300
        if (tipoGrupo === 'AGUARDANDO') corLateral = '#f97316' // orange-500

        return (
            <div key={t.id} className={`flex flex-col ${bgCard} border border-zinc-200 rounded-lg shadow-sm mb-3 transition-all overflow-hidden ${isCarregando ? 'opacity-50' : ''} ${isConcluida ? 'opacity-50 bg-zinc-50' : ''}`}>
                <div className="flex">
                    {/* Linha Lateral de Cor */}
                    <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: corLateral }} />

                    <div className="flex-1 p-5 flex items-center justify-between">
                        
                        {/* Coluna 1: Info */}
                        <div className="flex flex-col gap-1 w-2/5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.tarefaConfig.tipo.cor }}>{t.tarefaConfig.tipo.nome}</span>
                                <BadgeStatus status={t.status} />
                            </div>
                            <h3 className="text-zinc-900 font-bold text-[17px] tracking-tight">{t.tarefaConfig.nome}</h3>
                        </div>

                        {/* Coluna 2: Meta / Data Hora */}
                        <div className="flex flex-col gap-2 w-2/5 justify-center px-4">
                            <div className="flex items-center gap-2 text-[13px] text-zinc-500 font-medium">
                                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>
                                    {tipoGrupo === 'ATRASADA' ? 'Venceu em: ' : 'Prazo: '} 
                                    {new Date(t.data).toLocaleDateString('pt-BR')} 
                                    {!isConcluida && <span className="font-bold text-zinc-700 ml-1">· {t.horaLimite}</span>}
                                </span>
                            </div>
                            
                            {renderTempo(t) && (
                                <div className="flex items-center gap-2 text-[13.5px]">
                                    <svg className="w-4 h-4 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: t.status === 'EM_ANDAMENTO' ? '#2563eb' : t.status === 'AGUARDANDO' ? '#ea580c' : '#71717a'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {renderTempo(t)}
                                </div>
                            )}
                        </div>

                        {/* Coluna 3: Ações */}
                        <div className="flex items-center justify-end gap-2.5 w-1/5 flex-shrink-0">
                            {!isConcluida && (
                                <>
                                    {['PENDENTE', 'PAUSADA', 'AGUARDANDO'].includes(t.status) && (
                                        <button onClick={() => updateStatus(t.id, 'iniciar')} disabled={isCarregando} className="text-[13px] bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors shadow-sm w-full max-w-[120px]">
                                            Iniciar
                                        </button>
                                    )}
                                    {t.status === 'EM_ANDAMENTO' && (
                                        <>
                                            <button onClick={() => updateStatus(t.id, 'pausar')} disabled={isCarregando} className="text-[13px] border border-zinc-300 text-zinc-600 hover:bg-zinc-50 px-4 py-2 rounded-md font-semibold transition-colors">
                                                Pausar
                                            </button>
                                            <button onClick={() => setAguardarId(t.id)} disabled={isCarregando} className="text-[13px] border border-orange-200 text-orange-600 bg-orange-50/50 hover:bg-orange-100 px-4 py-2 rounded-md font-semibold transition-colors">
                                                Aguardar
                                            </button>
                                            <button onClick={() => updateStatus(t.id, 'finalizar')} disabled={isCarregando} className="text-[13px] bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-md font-semibold transition-colors shadow-sm">
                                                Concluir
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                            
                            {isConcluida && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-semibold text-emerald-600 px-3 flex items-center gap-1">
                                        ✓ Concluída
                                    </span>
                                    <button onClick={() => updateStatus(t.id, 'retomar')} disabled={isCarregando} className="text-[11px] text-zinc-400 hover:text-zinc-700 underline underline-offset-2 px-3 transition-colors">
                                        Retomar tarefa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isAguardandoMode && (
                    <div className="p-3.5 bg-orange-50 border-t border-orange-100 text-sm flex items-center gap-3 w-full">
                        <select className="text-zinc-800 border border-orange-200 rounded px-3 py-2 outline-none focus:border-orange-400 bg-white" value={aguardarResp} onChange={e => setAguardarResp(e.target.value as any)}>
                            <option value="CLIENTE">Aguardando Cliente</option>
                            <option value="INTERNO">Aguardando Interno</option>
                        </select>
                        <input type="text" placeholder="Motivo (ex: Falta extrato)" className="flex-1 text-zinc-800 placeholder:text-orange-300 border border-orange-200 rounded px-3 py-2 outline-none focus:border-orange-400 bg-white shadow-sm" value={aguardarMotivo} onChange={e => setAguardarMotivo(e.target.value)} />
                        <button onClick={() => setAguardarId(null)} className="text-zinc-400 hover:text-zinc-600 px-2 font-medium">Cancelar</button>
                        <button onClick={() => updateStatus(t.id, 'aguardar', { motivo: aguardarMotivo, responsavel: aguardarResp })} className="bg-orange-500 hover:bg-orange-600 transition-colors text-white px-4 py-2 rounded font-medium shadow-sm">Salvar</button>
                    </div>
                )}

                {t.status === 'AGUARDANDO' && t.aguardandoMotivo && (
                    <div className="bg-[#fff7ed] border-t border-orange-100 px-6 py-3 text-[13px] text-orange-800 flex items-center gap-2">
                        <svg className="w-4 h-4 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-bold">{t.aguardandoResponsavel === 'CLIENTE' ? 'Depende do Cliente' : 'Depende do Interno'}:</span>
                        {t.aguardandoMotivo}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 overflow-auto bg-[#fafafa] p-6 lg:p-10">
            <div className="max-w-5xl mx-auto w-full">
                {/* Header Novo */}
                <div className="mb-6">
                    <h1 className="text-[26px] font-bold text-zinc-800 tracking-tight">Tarefas do dia</h1>
                    <p className="text-[13px] text-zinc-500 mt-0.5 capitalize">
                        {hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} · {hoje.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                        <p className="text-[13px] text-zinc-500 font-medium tracking-wide mb-2">Atrasadas</p>
                        <p className="text-[32px] font-bold text-red-600 leading-none">{atrasadas.length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                        <p className="text-[13px] text-zinc-500 font-medium tracking-wide mb-2">Em andamento</p>
                        <p className="text-[32px] font-bold text-amber-600 leading-none">{emAndamento.length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                        <p className="text-[13px] text-zinc-500 font-medium tracking-wide mb-2">Para hoje</p>
                        <p className="text-[32px] font-bold text-zinc-800 leading-none">{venceHoje.length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                        <p className="text-[13px] text-zinc-500 font-medium tracking-wide mb-2">Concluídas Hoje</p>
                        <p className="text-[32px] font-bold text-emerald-600 leading-none">{concluidasHoje.length}</p>
                    </div>
                </div>

                {tarefas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
                        <p className="text-zinc-400">Nenhuma tarefa ativa encontrada para hoje.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* EM ANDAMENTO */}
                        {emAndamento.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-700" />
                                    Em Andamento <span className="text-zinc-400 font-normal ml-1">({emAndamento.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">{emAndamento.map(t => renderTarefa(t, 'ANDAMENTO'))}</div>
                            </section>
                        )}

                        {/* ATRASADAS */}
                        {atrasadas.length > 0 && (
                            <section className="mt-8">
                                <h2 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-600" />
                                    Atrasadas <span className="text-zinc-400 font-normal ml-1">({atrasadas.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">{atrasadas.map(t => renderTarefa(t, 'ATRASADA'))}</div>
                            </section>
                        )}

                        {/* HOJE */}
                        {venceHoje.length > 0 && (
                            <section className="mt-8">
                                <h2 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-700" />
                                    Para Hoje <span className="text-zinc-400 font-normal ml-1">({venceHoje.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">{venceHoje.map(t => renderTarefa(t, 'HOJE'))}</div>
                            </section>
                        )}

                        {/* AGUARDANDO */}
                        {aguardando.length > 0 && (
                            <section className="mt-8 opacity-80 hover:opacity-100 transition-opacity">
                                <h2 className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Aguardando <span className="text-zinc-400 font-normal ml-1">({aguardando.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">{aguardando.map(t => renderTarefa(t, 'AGUARDANDO'))}</div>
                            </section>
                        )}

                        {/* CONCLUIDAS HOJE */}
                        {concluidasHoje.length > 0 && (
                            <section className="mt-10 border-t border-zinc-200 pt-8">
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-zinc-400" />
                                    Concluídas Hoje <span className="text-zinc-400 font-normal ml-1">({concluidasHoje.length})</span>
                                </h2>
                                <div className="flex flex-col gap-3">{concluidasHoje.map(t => renderTarefa(t, 'CONCLUIDA'))}</div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
