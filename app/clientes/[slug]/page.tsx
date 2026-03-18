import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

function nomeExibicao(c: { nomeFantasia: string | null; razaoSocial: string }) {
    return c.nomeFantasia || c.razaoSocial
}


// ==========================================
// DADOS MOCKADOS (IDÊNTICOS AO PRINT FIRMA)
// ==========================================
const MOCK_PAUSADAS = [
    { id: 1, tarefa: "Entrega de Balanço Anual", sub: "Aguardando assinatura digital do representante legal", badge: "PARADO HÁ 2 HORAS", tipo: "Obrigação Fiscal", corTipo: "bg-rose-500" },
    { id: 2, tarefa: "Conciliação Bancária Outubro", sub: "Pendente envio do extrato da conta PJ (Itaú)", badge: "PARADO HÁ 40 MINUTOS", tipo: "Rotina Administrativa", corTipo: "bg-[#cbd5e1]" },
]

const MOCK_ATRASADAS = [
    { id: 1, tarefa: "Emissão de Guias de GPS", badge: "ATRASADO HÁ 3 DIAS", tipo: "Obrigação Fiscal", corTipo: "bg-rose-500" },
    { id: 2, tarefa: "Relatório de Faturamento Semanal", badge: "ATRASADO HÁ 1 DIA", tipo: "Apoio Contábil", corTipo: "bg-blue-400" },
]

const MOCK_ATIVIDADES = [
    { id: 1, texto: "Aline concluiu Folha de pagamento", tempo: "2h atrás" },
    { id: 2, texto: "Aline enviou o comprovante do FGTS", tempo: "5h atrás" },
    { id: 3, texto: "Sistema gerou guia automática de ISS", tempo: "Ontem às 18:30" },
    { id: 4, texto: "Aline iniciou revisão fiscal trimestral", tempo: "Ontem às 14:15" },
    { id: 5, texto: "Sistema arquivou Nota Fiscal #4412", tempo: "2 dias atrás" },
    { id: 6, texto: "Aline atualizou o status da operação", tempo: "3 dias atrás" },
]


const MOCK_SEMANA = [
    { dia: 'DOM', num: 13, hoje: false, qtd: 0, temAtraso: false },
    { dia: 'SEG', num: 14, hoje: false, qtd: 3, temAtraso: true },
    { dia: 'TER', num: 15, hoje: true, qtd: 8, temAtraso: true },
    { dia: 'QUA', num: 16, hoje: false, qtd: 2, temAtraso: false },
    { dia: 'QUI', num: 17, hoje: false, qtd: 4, temAtraso: false },
    { dia: 'SEX', num: 18, hoje: false, qtd: 3, temAtraso: false },
    { dia: 'SÁB', num: 19, hoje: false, qtd: 0, temAtraso: false },
]


export default async function ClienteDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { slug } = await params

    const cliente = await prisma.cliente.findFirst({
        where: { slug, usuarioId: session.user.id }
    })

    if (!cliente) notFound()

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topbar Padrão do Sistema */}
            <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0 z-10 relative">
                <Link href="/clientes" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: cliente.cor || '#000' }}>
                        {nomeExibicao(cliente).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-zinc-800 leading-tight">{nomeExibicao(cliente)}</h2>
                        {cliente.nomeFantasia && (
                            <p className="text-[11px] text-zinc-400 leading-tight">{cliente.razaoSocial} · CNPJ {cliente.cnpj}</p>
                        )}
                    </div>
                </div>
                <Link
                    href={`/clientes/${cliente.slug}/editar`}
                    className="text-sm text-zinc-500 border border-zinc-200 rounded-md bg-white shadow-sm px-4 py-1.5 font-medium hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
                >
                    Editar dados
                </Link>
            </div>

            {/* Corpo Scrollável da Dashboard */}
            <div className="flex-1 overflow-y-auto bg-[#fafafa]">
                <main className="max-w-5xl w-full mx-auto px-8 py-8 flex flex-col gap-8">
                    
                    {/* 1. Grade de KPIs (4 Colunas) */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* KPI 1 - Tarefas do Dia */}
                        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-sm flex flex-col justify-between min-h-[120px]">
                            <div>
                                <h3 className="text-[28px] font-bold text-[#ea580c] leading-none mb-1.5">12</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-snug">TAREFAS DO DIA</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-auto">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                8 em andamento
                            </div>
                        </div>

                        {/* KPI 2 - Status Crítico */}
                        <div className="relative bg-white border border-rose-500/20 rounded-lg p-5 shadow-sm flex flex-col justify-between min-h-[120px] overflow-hidden">
                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-rose-500 rounded-r-md"></div>
                            <div className="pl-2">
                                <h3 className="text-[28px] font-bold leading-none mb-1.5 flex items-baseline">
                                    <span className="text-rose-600">3</span>
                                    <span className="text-zinc-200 text-2xl font-medium mx-1.5">/</span>
                                    <span className="text-amber-500">2</span>
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-snug">STATUS CRÍTICO</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest mt-auto pl-2">
                                <span className="text-rose-600">ATRASADAS</span>
                                <span className="text-zinc-300 mx-1">&amp;</span>
                                <span className="text-amber-500">PAUSADAS</span>
                            </div>
                        </div>

                        {/* KPI 3 - No Prazo */}
                        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-sm flex flex-col justify-between min-h-[120px]">
                            <div>
                                <h3 className="text-[28px] font-bold text-zinc-800 leading-none mb-1.5">94%</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-snug">NO PRAZO</p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-auto">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                +2.4% vs mês anterior
                            </div>
                        </div>

                        {/* KPI 4 - Horas no mês */}
                        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-sm flex flex-col justify-between min-h-[120px]">
                            <div>
                                <h3 className="text-[28px] font-bold text-zinc-800 leading-none mb-1.5">15h</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-snug">HORAS NO MÊS</p>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 mt-auto rounded-full overflow-hidden flex">
                                <div className="h-full bg-[#ea580c]" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Pausadas (Caixa Amarela) */}
                    <section>
                        <h2 className="text-[15px] font-bold text-zinc-800 flex items-center gap-2 mb-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ea580c] text-white">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                            </span>
                            Pausadas
                        </h2>
                        <div className="bg-[#fffbeb] border border-[#fde047] rounded-lg shadow-sm flex flex-col divide-y divide-[#fef08a]">
                            {MOCK_PAUSADAS.map(t => (
                                <div key={t.id} className="p-4 px-5 flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.corTipo}`} />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.tipo}</span>
                                        </div>
                                        <p className="text-[14px] font-bold text-zinc-800">{t.tarefa}</p>
                                        <p className="text-[12px] text-zinc-600">{t.sub}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-700 bg-[#fef08a]/80 px-2 py-1 rounded-full">{t.badge}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Tarefas Atrasadas (Caixa Vermelha) */}
                    <section>
                        <h2 className="text-[15px] font-bold text-zinc-800 flex items-center gap-2 mb-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded bg-rose-500 text-white">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </span>
                            Tarefas Atrasadas
                        </h2>
                        <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg shadow-sm flex flex-col divide-y divide-[#ffe4e6]">
                            {MOCK_ATRASADAS.map(t => (
                                <div key={t.id} className="p-4 px-5 flex items-center justify-between hover:bg-rose-50 transition-colors">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.corTipo}`} />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.tipo}</span>
                                        </div>
                                        <p className="text-[14px] font-bold text-zinc-800">{t.tarefa}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-rose-700 bg-[#ffe4e6] px-2 py-1 rounded-full">{t.badge}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. Cronograma Semanal */}
                    <section>
                        <h2 className="text-[15px] font-bold text-zinc-800 flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-[#ea580c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Cronograma Semanal (13 a 19 de Outubro)
                        </h2>
                        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm">
                            <div className="grid grid-cols-7 gap-3 mb-5">
                                {MOCK_SEMANA.map(s => (
                                    <div key={s.dia} className={`relative flex flex-col h-[88px] p-3 rounded-lg border ${s.hoje ? 'border-[#ea580c] shadow-sm' : 'border-zinc-200/70'}`}>
                                        {s.hoje && (
                                            <span className="absolute -top-2.5 -right-1 bg-[#ea580c] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Hoje</span>
                                        )}
                                        <div className="flex flex-col">
                                            <p className={`text-[10px] font-bold tracking-wider mb-0.5 ${s.hoje ? 'text-[#ea580c]' : 'text-zinc-400'}`}>{s.dia}</p>
                                            <p className={`text-[17px] font-bold leading-none ${s.hoje ? 'text-[#ea580c]' : 'text-zinc-800'}`}>{s.num}</p>
                                            {s.qtd > 0 && (
                                                <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 tracking-wide">{s.qtd} tarefas</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-auto">
                                            {s.temAtraso && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-6 pt-4 border-t border-zinc-100/80">
                                <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Tarefas Atrasadas</span>
                            </div>
                        </div>
                    </section>

                    {/* 5. 2 Colunas Inferiores */}
                    <div className="grid grid-cols-2 gap-6 pb-12">
                        {/* Atividade Recente */}
                        <section>
                            <h2 className="text-[15px] font-bold text-zinc-800 flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-[#ea580c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Atividade Recente
                            </h2>
                            <div className="bg-white border border-zinc-200/80 rounded-lg shadow-sm">
                                <div className="divide-y divide-zinc-100 flex flex-col">
                                    {MOCK_ATIVIDADES.map(a => (
                                        <div key={a.id} className="p-4 px-5 flex items-center text-[12px] hover:bg-zinc-50 transition-colors">
                                            <p className="text-zinc-800 w-full"><strong className="font-bold text-zinc-800">{a.texto.split(' ')[0]}</strong> {a.texto.substring(a.texto.indexOf(' '))} <span className="text-zinc-400 font-medium ml-1">· {a.tempo}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Horas Trabalhadas */}
                        <section>
                            <h2 className="text-[15px] font-bold text-zinc-800 flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-[#ea580c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Horas Trabalhadas
                            </h2>
                            <div className="bg-white border border-zinc-200/80 rounded-lg p-6 shadow-sm flex flex-col items-center justify-between h-full">
                                {/* Gráfico Donut Concêntrico (SVG) */}
                                <div className="relative w-[152px] h-[152px] mb-8 mt-2">
                                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                        {/* Fundo do aro externo (Mês) */}
                                        <circle cx="50" cy="50" r="42" fill="transparent" stroke="#f4f4f5" strokeWidth="6" />
                                        {/* Progresso do aro externo (Mês) - Laranja (60%) */}
                                        <circle cx="50" cy="50" r="42" fill="transparent" stroke="#ea580c" strokeWidth="6" strokeDasharray="263.9" strokeDashoffset="105.5" strokeLinecap="round" />
                                        
                                        {/* Fundo pseudo opcional, mas manteremos só a barra */}
                                        {/* Progresso do aro interno (Hoje) - Azul Escuro (30%) */}
                                        <circle cx="50" cy="50" r="30" fill="transparent" stroke="#334155" strokeWidth="6" strokeDasharray="188.5" strokeDashoffset="131.9" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                                        <span className="text-[32px] font-bold text-[#1e293b] leading-none mb-1">15h</span>
                                        <span className="text-[8px] font-bold text-[#ea580c] uppercase tracking-wider mt-0.5">TOTAL NO MÊS</span>
                                    </div>
                                </div>
                                
                                {/* Cards Inferiores */}
                                <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                                    <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-lg py-3 flex flex-col items-center justify-center gap-1.5">
                                        <span className="text-[9px] font-bold text-[#ea580c] uppercase tracking-wider leading-none">MÊS (ACUMULADO)</span>
                                        <span className="flex items-center gap-1.5 text-[15px] font-bold text-zinc-800 leading-none tracking-tight">
                                            <div className="w-2 h-2 rounded-full bg-[#ea580c]" /> 15.0h
                                        </span>
                                    </div>
                                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-lg py-3 flex flex-col items-center justify-center gap-1.5">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">HOJE (ATUAL)</span>
                                        <span className="flex items-center gap-1.5 text-[15px] font-bold text-zinc-800 leading-none tracking-tight">
                                            <div className="w-2 h-2 rounded-full bg-[#334155]" /> 2.5h
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                </main>
            </div>
        </div>
    )
}