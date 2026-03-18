'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type TipoTarefa = { id: string; nome: string; cor: string }
type Props = { id?: string }

const DIAS_SEMANA = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
]

const MESES = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },   { value: 5, label: 'Maio' },      { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },   { value: 8, label: 'Agosto' },    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },{ value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]

export default function TarefaForm({ id }: Props) {
    const router = useRouter()
    const editando = !!id

    const [tipos, setTipos] = useState<TipoTarefa[]>([])
    const [form, setForm] = useState({
        nome: '', tipoId: '', recorrencia: '',
        diaSemana: '1', diaDoMes: '1', mesDoAno: '1', horaLimite: '17:00'
    })
    const [erro, setErro] = useState('')
    const [salvando, setSalvando] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Carrega tipos dinâmicos
        fetch('/api/tipos').then(r => r.json()).then(setTipos).catch(() => {})

        if (editando) {
            fetch(`/api/tarefas-modelo/${id}`)
                .then(r => r.json())
                .then(data => {
                    setForm({
                        nome: data.nome || '',
                        tipoId: data.tipoId || '',
                        recorrencia: data.recorrencia || '',
                        diaSemana: data.diaSemana != null ? String(data.diaSemana) : '1',
                        diaDoMes: data.diaDoMes != null ? String(data.diaDoMes) : '1',
                        mesDoAno: data.mesDoAno != null ? String(data.mesDoAno) : '1',
                        horaLimite: data.horaLimite || '',
                    })
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [id, editando])

    function set(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErro('')
    }

    async function salvar() {
        if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
        if (!form.tipoId) { setErro('Tipo é obrigatório.'); return }
        if (!form.recorrencia) { setErro('Recorrência é obrigatória.'); return }
        if (form.recorrencia === 'ANUAL' && !form.mesDoAno) {
            setErro('Informe o mês para recorrência anual.'); return
        }

        setSalvando(true)
        setErro('')

        const url = editando ? `/api/tarefas-modelo/${id}` : '/api/tarefas-modelo'
        const method = editando ? 'PUT' : 'POST'

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: form.nome.trim(),
                tipoId: form.tipoId,
                recorrencia: form.recorrencia,
                diaSemana: form.recorrencia === 'SEMANAL' ? Number(form.diaSemana) : null,
                diaDoMes: form.recorrencia === 'MENSAL' ? Number(form.diaDoMes) : null,
                mesDoAno: form.recorrencia === 'ANUAL' ? Number(form.mesDoAno) : null,
                horaLimite: form.horaLimite || '17:00',
            }),
        })

        const data = await res.json()
        if (!res.ok) { setErro(data.error || 'Erro ao salvar.'); setSalvando(false); return }

        router.push('/tarefas')
        router.refresh()
    }

    const selectCls = "w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 outline-none focus:border-blue-300 transition-colors"
    const inputCls = "w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"

    if (loading) return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-center flex-1">
                <p className="text-sm text-zinc-400">Carregando...</p>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
                <button onClick={() => router.push('/tarefas')} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-zinc-800">{editando ? 'Editar tarefa' : 'Nova tarefa'}</h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Catálogo global de tarefas</p>
                </div>
            </div>

            {/* Form */}
            <main className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-md flex flex-col gap-5">

                    {/* Nome */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-1.5">Nome <span className="text-red-400">*</span></label>
                        <input type="text" value={form.nome} onChange={e => set('nome', e.target.value)}
                            placeholder="Ex: Conciliar extrato bancário" className={inputCls} />
                    </div>

                    {/* Tipo — carregado do banco */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-1.5">
                            Tipo <span className="text-red-400">*</span>
                            <a href="/configuracoes/tipos" className="ml-2 text-blue-400 hover:text-blue-600 text-[10px] font-normal">
                                ＋ Gerenciar tipos
                            </a>
                        </label>
                        <select value={form.tipoId} onChange={e => set('tipoId', e.target.value)} className={selectCls}>
                            <option value="">Selecione...</option>
                            {tipos.map(t => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                        {tipos.length === 0 && (
                            <p className="text-xs text-zinc-400 mt-1">
                                Nenhum tipo cadastrado.{' '}
                                <a href="/configuracoes/tipos" className="text-blue-500 underline">Criar agora</a>
                            </p>
                        )}
                    </div>

                    {/* Recorrência */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-1.5">Recorrência <span className="text-red-400">*</span></label>
                        <select value={form.recorrencia} onChange={e => set('recorrencia', e.target.value)} className={selectCls}>
                            <option value="">Selecione...</option>
                            <option value="DIARIA">Diária — todos os dias</option>
                            <option value="DIAS_UTEIS">Dias úteis — seg a sex</option>
                            <option value="SEMANAL">Semanal — dia específico</option>
                            <option value="MENSAL">Mensal — dia fixo do mês</option>
                            <option value="ANUAL">Anual — uma vez por ano</option>
                        </select>
                    </div>

                    {/* Dia da semana (só SEMANAL) */}
                    {form.recorrencia === 'SEMANAL' && (
                        <div>
                            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Dia da semana <span className="text-red-400">*</span></label>
                            <select value={form.diaSemana} onChange={e => set('diaSemana', e.target.value)} className={selectCls}>
                                {DIAS_SEMANA.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Dia do mês (MENSAL) */}
                    {form.recorrencia === 'MENSAL' && (
                        <div>
                            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Dia do mês <span className="text-red-400">*</span></label>
                            <input type="number" min={1} max={31} value={form.diaDoMes}
                                onChange={e => set('diaDoMes', e.target.value)} className={inputCls} />
                            <p className="text-xs text-zinc-400 mt-1">Se o mês não tiver esse dia, a tarefa cai no último dia do mês.</p>
                        </div>
                    )}

                    {/* Mês (ANUAL) */}
                    {form.recorrencia === 'ANUAL' && (
                        <div>
                            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Mês <span className="text-red-400">*</span></label>
                            <select value={form.mesDoAno} onChange={e => set('mesDoAno', e.target.value)} className={selectCls}>
                                {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Hora Limite Opcional */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-1.5">Hora limite (opcional)</label>
                        <input type="time" value={form.horaLimite} onChange={e => set('horaLimite', e.target.value)}
                            className={inputCls} />
                        <p className="text-[11px] text-zinc-400 mt-1">Se não preenchido, a tarefa vence às 23:59 do dia estipulado.</p>
                    </div>

                    {/* Erro */}
                    {erro && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">{erro}</p>}

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={salvar} disabled={salvando}
                            className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">
                            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar tarefa'}
                        </button>
                        <button onClick={() => router.push('/tarefas')}
                            className="text-sm text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg px-5 py-2.5 transition-colors hover:bg-zinc-50">
                            Cancelar
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
