import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

const clientes = [
    { nome: 'Padaria Sol', sigla: 'PS', cor: '#378ADD', bg: '#dbeeff', tc: '#185FA5', score: 5 },
    { nome: 'Constr. Mar Azul', sigla: 'CM', cor: '#1D9E75', bg: '#d4f5e9', tc: '#0F6E56', score: 9 },
    { nome: 'Moda ABC', sigla: 'MA', cor: '#D85A30', bg: '#ffe4d8', tc: '#712B13', score: 2 },
    { nome: 'Rest. Gourmet', sigla: 'RG', cor: '#7F77DD', bg: '#eceaff', tc: '#3C3489', score: 7 },
]

const tarefas = [
    { id: 1, nome: 'Conciliação Bancária', cliente: 'Padaria Sol', badge: 'Conciliação', bcls: 'bg-blue-50 text-blue-700', done: false, diasAtraso: 1 },
    { id: 2, nome: 'DARF vencido — Simples', cliente: 'Moda ABC', badge: 'Fiscal', bcls: 'bg-amber-50 text-amber-700', done: false, diasAtraso: 3 },
    { id: 3, nome: 'Emissão de NF-e de Serviços', cliente: 'Constr. Mar Azul', badge: 'Fiscal', bcls: 'bg-amber-50 text-amber-700', done: false, diasAtraso: 0 },
    { id: 4, nome: 'Fechamento de Caixa Semanal', cliente: 'Rest. Gourmet', badge: 'Relatório', bcls: 'bg-purple-50 text-purple-700', done: false, diasAtraso: 0 },
    { id: 5, nome: 'Contas a Pagar: Fornecedores', cliente: 'Moda ABC', badge: 'Pagamento', bcls: 'bg-green-50 text-green-700', done: false, diasAtraso: 0 },
    { id: 6, nome: 'Lançamentos contábeis diários', cliente: 'Constr. Mar Azul', badge: 'Conciliação', bcls: 'bg-blue-50 text-blue-700', done: true, diasAtraso: 0 },
    { id: 7, nome: 'DAS Simples Nacional', cliente: 'Padaria Sol', badge: 'Fiscal', bcls: 'bg-amber-50 text-amber-700', done: true, diasAtraso: 0 },
]

const vencimentos = [
    { nome: 'Folha de Pagamento', cliente: 'Padaria Sol', dias: 2 },
    { nome: 'DARF — IRPJ trimestral', cliente: 'Constr. Mar Azul', dias: 5 },
    { nome: 'Aluguel sede', cliente: 'Moda ABC', dias: 7 },
]

function getCli(nome: string) {
    return clientes.find(c => c.nome === nome) || clientes[0]
}

function CircleProgress({ score, cor, size = 72 }: { score: number; cor: string; size?: number }) {
    const r = (size - 8) / 2
    const cx = size / 2
    const cy = size / 2
    const circ = 2 * Math.PI * r
    const dash = circ * (score / 10)
    const gap = circ * (1 - score / 10)
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth="4.5" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth="4.5"
                strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="round" />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontWeight="600" fill="#3f3f46">{score}/10</text>
        </svg>
    )
}

function TaskCard({ t }: { t: typeof tarefas[0] }) {
    const c = getCli(t.cliente)
    const overdue = t.diasAtraso > 0 && !t.done
    return (
        <div className={`flex items-center gap-3 bg-white border rounded-lg px-4 py-2.5 transition-colors hover:border-zinc-200 ${overdue ? 'border-l-2 border-l-red-400 rounded-none border-zinc-100' : 'border-zinc-100'} ${t.done ? 'opacity-40' : ''}`}>
            <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${t.done ? 'bg-green-50 border-green-400' : 'border-zinc-300'}`}>
                {t.done && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.cor }}></span>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-zinc-800 truncate ${t.done ? 'line-through' : ''}`}>{t.nome}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                    {t.cliente}
                    {overdue && <span className="text-red-500 ml-1">· atrasada {t.diasAtraso} {t.diasAtraso === 1 ? 'dia' : 'dias'}</span>}
                </p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${t.bcls}`}>{t.badge}</span>
        </div>
    )
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const atrasadas = tarefas.filter(t => t.diasAtraso > 0 && !t.done)
    const pendentes = tarefas.filter(t => t.diasAtraso === 0 && !t.done)
    const concluidas = tarefas.filter(t => t.done)
    const vencProx = vencimentos.filter(v => v.dias <= 10)

    const now = new Date()
    const dateLine = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()
    const hora = now.getHours()
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-zinc-800">{saudacao}, João!</h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{dateLine}</p>
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar tarefas ou clientes..."
                    className="w-64 text-sm bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-zinc-600 placeholder:text-zinc-400 outline-none focus:border-blue-200 focus:bg-white transition-colors"
                />
                <svg className="text-zinc-400 cursor-pointer hover:text-zinc-600 transition-colors" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2a6 6 0 00-6 6v2l-1.5 3h15L16 10V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.2" />
                </svg>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">

                {/* Main */}
                <main className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                    {/* Métricas */}
                    <div className="grid grid-cols-4 gap-2.5">
                        {[
                            { label: 'Atrasadas', value: atrasadas.length, color: atrasadas.length > 0 ? 'text-red-500' : 'text-zinc-800' },
                            { label: 'Pendentes hoje', value: pendentes.length, color: 'text-zinc-800' },
                            { label: 'Concluídas hoje', value: concluidas.length, color: concluidas.length > 0 ? 'text-green-600' : 'text-zinc-800' },
                            { label: 'Vencimentos próximos', value: vencProx.length, color: vencProx.length > 0 ? 'text-amber-600' : 'text-zinc-800' },
                        ].map((m) => (
                            <div key={m.label} className="bg-zinc-50 rounded-lg px-3.5 py-3">
                                <p className="text-xs text-zinc-400 mb-1">{m.label}</p>
                                <p className={`text-xl font-semibold ${m.color}`}>{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Atrasadas */}
                    {atrasadas.length > 0 && (
                        <div>
                            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
                                Atrasadas · {atrasadas.length} tarefa{atrasadas.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {atrasadas.map(t => <TaskCard key={t.id} t={t} />)}
                            </div>
                        </div>
                    )}

                    {/* Pendentes hoje */}
                    <div>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block"></span>
                            Tarefas de hoje · {pendentes.length} planejadas
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {pendentes.length === 0
                                ? <p className="text-sm text-zinc-400 py-1">Tudo em dia.</p>
                                : pendentes.map(t => <TaskCard key={t.id} t={t} />)
                            }
                        </div>
                    </div>

                    {/* Vencimentos */}
                    {vencProx.length > 0 && (
                        <div>
                            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                                Vencimentos esta semana
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {vencProx.map((v, i) => {
                                    const c = getCli(v.cliente)
                                    return (
                                        <div key={i} className="flex items-center gap-3 bg-white border border-l-2 border-l-amber-400 rounded-none border-zinc-100 px-4 py-2.5">
                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.cor }}></span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-800 truncate">{v.nome}</p>
                                                <p className="text-xs text-zinc-400 mt-0.5">{v.cliente}</p>
                                            </div>
                                            <span className="text-xs font-medium text-amber-600 flex-shrink-0">em {v.dias} {v.dias === 1 ? 'dia' : 'dias'}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Concluídas */}
                    {concluidas.length > 0 && (
                        <div>
                            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                                Concluídas hoje
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {concluidas.map(t => <TaskCard key={t.id} t={t} />)}
                            </div>
                        </div>
                    )}
                </main>

                {/* Right panel */}
                <aside className="w-56 border-l border-zinc-100 bg-white px-4 py-5 flex flex-col gap-5 overflow-y-auto flex-shrink-0">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-zinc-700">Meus clientes</p>
                            <a href="/clientes" className="text-xs text-blue-500 hover:underline">Ver todos</a>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {clientes.map(c => (
                                <div key={c.nome} className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors">
                                    <CircleProgress score={c.score} cor={c.cor} size={68} />
                                    <p className="text-[11px] text-zinc-500 text-center leading-tight">{c.nome}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    )
}
