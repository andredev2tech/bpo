'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type TipoTarefa = { id: string; nome: string; cor: string }
type TipoRecorrencia = 'DIARIA' | 'SEMANAL' | 'DIAS_UTEIS' | 'MENSAL' | 'ANUAL'

type Modelo = {
    id: string
    nome: string
    tipoId: string
    tipo: TipoTarefa
    recorrencia: TipoRecorrencia
    diaSemana: number | null
    diaDoMes: number | null
    mesDoAno: number | null
    horaLimite: string | null
}

type TarefaConfig = {
    id: string
    nome: string
    tipoId: string
    tipo: TipoTarefa
    recorrencia: TipoRecorrencia
    diaSemana: number | null
    diaDoMes: number | null
    mesDoAno: number | null
    horaLimite: string | null
    modeloId: string | null
    ativo: boolean
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },   { value: 5, label: 'Maio' },      { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },   { value: 8, label: 'Agosto' },    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },{ value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]

function recorrenciaLabel(o: Pick<TarefaConfig, 'recorrencia' | 'diaSemana' | 'diaDoMes' | 'mesDoAno'>) {
    if (o.recorrencia === 'DIARIA')     return 'Diária'
    if (o.recorrencia === 'DIAS_UTEIS') return 'Dias úteis'
    if (o.recorrencia === 'SEMANAL')    return `Semanal — ${DIAS_SEMANA[o.diaSemana ?? 1]}`
    if (o.recorrencia === 'MENSAL')     return `Mensal — dia ${o.diaDoMes || '?'}`
    if (o.recorrencia === 'ANUAL')      return `Anual — ${MESES.find(m => m.value === o.mesDoAno)?.label || '?'}`
    return '—'
}

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16) || 99
    const g = parseInt(hex.slice(3, 5), 16) || 102
    const b = parseInt(hex.slice(5, 7), 16) || 241
    return `rgba(${r},${g},${b},${alpha})`
}

// ──────────────────────────────────────
// Form inline de edição / criação
// ──────────────────────────────────────
type FormData = {
    nome: string
    tipoId: string
    recorrencia: TipoRecorrencia
    diaSemana: number
    diaDoMes: number
    mesDoAno: number
    horaLimite: string
}

function TarefaForm({
    inicial,
    onSalvar,
    onCancelar,
    salvando,
    tiposGlobais,
}: {
    inicial: FormData
    onSalvar: (d: FormData) => void
    onCancelar: () => void
    salvando: boolean
    tiposGlobais: TipoTarefa[]
}) {
    const [form, setForm] = useState<FormData>(inicial)
    const set = (f: Partial<FormData>) => setForm(p => ({ ...p, ...f }))

    return (
        <div className="mt-2 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 flex flex-col gap-2">
            <input
                className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:border-blue-300 w-full"
                placeholder="Nome da tarefa"
                value={form.nome}
                onChange={e => set({ nome: e.target.value })}
            />
            <div className="flex gap-2 flex-wrap">
                <select
                    className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2 py-1.5 bg-white outline-none focus:border-blue-300 min-w-32"
                    value={form.tipoId}
                    onChange={e => set({ tipoId: e.target.value })}
                >
                    <option value="">(Tipo)</option>
                    {tiposGlobais.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                </select>
                <select
                    className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2 py-1.5 bg-white outline-none focus:border-blue-300"
                    value={form.recorrencia}
                    onChange={e => set({ recorrencia: e.target.value as TipoRecorrencia })}
                >
                    <option value="DIARIA">Diária</option>
                    <option value="DIAS_UTEIS">Dias úteis</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSAL">Mensal</option>
                    <option value="ANUAL">Anual</option>
                </select>
                {form.recorrencia === 'SEMANAL' && (
                    <select
                        className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2 py-1.5 bg-white outline-none focus:border-blue-300"
                        value={form.diaSemana}
                        onChange={e => set({ diaSemana: Number(e.target.value) })}
                    >
                        {DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                )}
                {form.recorrencia === 'MENSAL' && (
                    <input
                        type="number" min={1} max={31}
                        className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2 py-1.5 bg-white outline-none focus:border-blue-300 w-16"
                        placeholder="Dia"
                        value={form.diaDoMes}
                        onChange={e => set({ diaDoMes: Number(e.target.value) })}
                    />
                )}
                {form.recorrencia === 'ANUAL' && (
                    <select
                        className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2 py-1.5 bg-white outline-none focus:border-blue-300"
                        value={form.mesDoAno}
                        onChange={e => set({ mesDoAno: Number(e.target.value) })}
                    >
                        {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                )}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400">Limite:</span>
                    <input
                        type="time"
                        className="text-sm text-zinc-700 border border-zinc-200 rounded-md px-2 py-1.5 bg-white outline-none focus:border-blue-300"
                        value={form.horaLimite}
                        onChange={e => set({ horaLimite: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={onCancelar} className="text-xs text-zinc-400 hover:text-zinc-600 px-3 py-1 rounded transition-colors">
                    Cancelar
                </button>
                <button
                    onClick={() => onSalvar(form)}
                    disabled={salvando || !form.tipoId || !form.nome}
                    className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                    {salvando ? 'Salvando…' : 'Salvar'}
                </button>
            </div>
        </div>
    )
}

// ──────────────────────────────────────
// Página principal
// ──────────────────────────────────────
export default function ClienteTarefasConfigPage() {
    const { slug } = useParams<{ slug: string }>()

    const [tiposGlobais, setTiposGlobais] = useState<TipoTarefa[]>([])
    const [modelos, setModelos] = useState<Modelo[]>([])
    const [vinculadas, setVinculadas] = useState<TarefaConfig[]>([])
    const [especificas, setEspecificas] = useState<TarefaConfig[]>([])
    const [loading, setLoading] = useState(true)

    const [editando, setEditando] = useState<string | null>(null)
    const [salvando, setSalvando] = useState(false)
    const [toggling, setToggling] = useState<string | null>(null)
    const [criandoNova, setCriandoNova] = useState(false)

    useEffect(() => {
        fetch('/api/tipos').then(r => r.json()).then(setTiposGlobais).catch(() => {})
        carregar()
    }, [slug])

    async function carregar() {
        setLoading(true)
        const res = await fetch(`/api/clientes/slug/${slug}/tarefas-config`)
        const data = await res.json()
        setModelos(data.modelos ?? [])
        setVinculadas(data.vinculadas ?? [])
        setEspecificas(data.especificas ?? [])
        setLoading(false)
    }

    function vinculadaDe(modeloId: string) {
        return vinculadas.find(v => v.modeloId === modeloId)
    }

    async function toggleModelo(m: Modelo) {
        const existente = vinculadaDe(m.id)
        setToggling(m.id)
        if (existente) {
            await fetch(`/api/clientes/slug/${slug}/tarefas-config/${existente.id}`, { method: 'DELETE' })
            setVinculadas(prev => prev.filter(v => v.id !== existente.id))
        } else {
            const res = await fetch(`/api/clientes/slug/${slug}/tarefas-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modeloId: m.id,
                    nome: m.nome,
                    tipoId: m.tipoId,
                    recorrencia: m.recorrencia,
                    diaSemana: m.diaSemana,
                    diaDoMes: m.diaDoMes,
                    mesDoAno: m.mesDoAno,
                    horaLimite: m.horaLimite || '17:00',
                }),
            })
            const nova = await res.json()
            setVinculadas(prev => [...prev, nova])
        }
        setToggling(null)
    }

    async function salvarEdicao(id: string, form: FormData) {
        setSalvando(true)
        const res = await fetch(`/api/clientes/slug/${slug}/tarefas-config/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const atualizada = await res.json()
        setVinculadas(prev => prev.map(v => v.id === id ? atualizada : v))
        setEspecificas(prev => prev.map(e => e.id === id ? atualizada : e))
        setEditando(null)
        setSalvando(false)
    }

    async function criarEspecifica(form: FormData) {
        setSalvando(true)
        const res = await fetch(`/api/clientes/slug/${slug}/tarefas-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const nova = await res.json()
        setEspecificas(prev => [...prev, nova])
        setCriandoNova(false)
        setSalvando(false)
    }

    async function toggleEspecifica(o: TarefaConfig) {
        setToggling(o.id)
        const res = await fetch(`/api/clientes/slug/${slug}/tarefas-config/${o.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: !o.ativo }),
        })
        const atualizada = await res.json()
        setEspecificas(prev => prev.map(e => e.id === o.id ? atualizada : e))
        setToggling(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-sm text-zinc-400">Carregando…</p>
            </div>
        )
    }

    const totalAtivas = vinculadas.length + especificas.filter(e => e.ativo).length

    function renderTipoBadge(tipoObj: TipoTarefa | undefined) {
        const t = tipoObj || { id: '', nome: '—', cor: '#94a3b8' }
        return (
            <span
                className="text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: hexToRgba(t.cor, 0.1), color: t.cor }}
            >
                {t.nome}
            </span>
        )
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-zinc-800">Tarefas</h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                        {totalAtivas} ativa{totalAtivas !== 1 ? 's' : ''} neste cliente
                    </p>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

                {/* Específicas */}
                <div>
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                        Específicas deste cliente · {especificas.length}
                    </p>
                    {!criandoNova && (
                        <button
                            onClick={() => { setCriandoNova(true); setEditando(null) }}
                            className="text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors mb-2"
                        >
                            + Criar tarefa específica
                        </button>
                    )}
                    {criandoNova && (
                        <div className="mb-2 max-w-2xl">
                            <TarefaForm
                                inicial={{ nome: '', tipoId: tiposGlobais[0]?.id || '', recorrencia: 'MENSAL', diaSemana: 1, diaDoMes: 1, mesDoAno: 1, horaLimite: '17:00' }}
                                onSalvar={criarEspecifica}
                                onCancelar={() => setCriandoNova(false)}
                                salvando={salvando}
                                tiposGlobais={tiposGlobais}
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5 max-w-2xl">
                        {especificas.map(o => {
                            const estaEditando = editando === o.id
                            const emToggle = toggling === o.id
                            return (
                                <div key={o.id} className={`bg-white border rounded-lg px-4 py-2.5 transition-colors ${o.ativo ? 'border-zinc-200' : 'border-zinc-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => !emToggle && toggleEspecifica(o)}
                                            disabled={emToggle}
                                            className="flex-shrink-0 disabled:opacity-50"
                                            title={o.ativo ? 'Desativar' : 'Ativar'}
                                        >
                                            <div className={`w-8 h-4 rounded-full transition-colors relative ${o.ativo ? 'bg-blue-500' : 'bg-zinc-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${o.ativo ? 'left-4' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                        <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: o.tipo?.cor || '#ccc' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${o.ativo ? 'text-zinc-800' : 'text-zinc-500'}`}>{o.nome}</p>
                                            <p className="text-xs text-zinc-400 mt-0.5">{recorrenciaLabel(o)}</p>
                                        </div>
                                        {renderTipoBadge(o.tipo)}
                                        {o.ativo && (
                                            <button
                                                onClick={() => setEditando(estaEditando ? null : o.id)}
                                                className="text-xs text-zinc-400 hover:text-blue-500 transition-colors px-2 py-1 rounded hover:bg-zinc-50 flex-shrink-0"
                                            >
                                                {estaEditando ? 'Fechar' : 'Editar'}
                                            </button>
                                        )}
                                    </div>
                                    {estaEditando && (
                                        <TarefaForm
                                            inicial={{ nome: o.nome, tipoId: o.tipoId, recorrencia: o.recorrencia, diaSemana: o.diaSemana ?? 1, diaDoMes: o.diaDoMes ?? 1, mesDoAno: o.mesDoAno ?? 1, horaLimite: o.horaLimite || '17:00' }}
                                            onSalvar={(form) => salvarEdicao(o.id, form)}
                                            onCancelar={() => setEditando(null)}
                                            salvando={salvando}
                                            tiposGlobais={tiposGlobais}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Do catálogo */}
                <div>
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block" />
                        Do catálogo · {modelos.length} modelos
                    </p>
                    <div className="flex flex-col gap-1.5 max-w-2xl">
                        {modelos.map(m => {
                            const ativa = vinculadaDe(m.id)
                            const estaEditando = ativa && editando === ativa.id
                            const emToggle = toggling === m.id
                            return (
                                <div key={m.id} className={`bg-white border rounded-lg px-4 py-2.5 transition-colors ${ativa ? 'border-zinc-200' : 'border-zinc-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => !emToggle && toggleModelo(m)}
                                            disabled={emToggle}
                                            className="flex-shrink-0 disabled:opacity-50"
                                            title={ativa ? 'Desativar' : 'Ativar'}
                                        >
                                            <div className={`w-8 h-4 rounded-full transition-colors relative ${ativa ? 'bg-blue-500' : 'bg-zinc-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${ativa ? 'left-4' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                        <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: (ativa?.tipo || m.tipo)?.cor || '#ccc' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${ativa ? 'text-zinc-800' : 'text-zinc-600'}`}>
                                                {ativa ? ativa.nome : m.nome}
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-0.5">{recorrenciaLabel(ativa ?? m)}</p>
                                        </div>
                                        {renderTipoBadge(ativa?.tipo || m.tipo)}
                                        {ativa && (
                                            <button
                                                onClick={() => setEditando(estaEditando ? null : ativa.id)}
                                                className="text-xs text-zinc-400 hover:text-blue-500 transition-colors px-2 py-1 rounded hover:bg-zinc-50 flex-shrink-0"
                                            >
                                                {estaEditando ? 'Fechar' : 'Editar'}
                                            </button>
                                        )}
                                    </div>
                                    {estaEditando && ativa && (
                                        <TarefaForm
                                            inicial={{ nome: ativa.nome, tipoId: ativa.tipoId, recorrencia: ativa.recorrencia, diaSemana: ativa.diaSemana ?? 1, diaDoMes: ativa.diaDoMes ?? 1, mesDoAno: ativa.mesDoAno ?? 1, horaLimite: ativa.horaLimite || '17:00' }}
                                            onSalvar={(form) => salvarEdicao(ativa.id, form)}
                                            onCancelar={() => setEditando(null)}
                                            salvando={salvando}
                                            tiposGlobais={tiposGlobais}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </main>
        </div>
    )
}
