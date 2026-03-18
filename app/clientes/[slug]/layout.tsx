'use client'

import { use, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

type ClienteInfo = {
    id: string
    slug: string
    razaoSocial: string
    nomeFantasia: string | null
    cor: string
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
}

export default function ClienteLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params)
    const pathname = usePathname()
    const [cliente, setCliente] = useState<ClienteInfo | null>(null)

    useEffect(() => {
        fetch(`/api/clientes/slug/${slug}`)
            .then(r => r.json())
            .then(data => setCliente(data))
            .catch(() => { })
    }, [slug])

    function isAtivo(href: string) {
        if (href === `/clientes/${slug}`) return pathname === `/clientes/${slug}`
        return pathname.startsWith(href)
    }

    const nome = cliente?.nomeFantasia || cliente?.razaoSocial || ''
    const razao = cliente?.nomeFantasia ? cliente.razaoSocial : null
    const iniciais = nome ? nome.slice(0, 2).toUpperCase() : ''
    const cor = cliente?.cor || '#e4e4e7'
    const { r, g, b } = hexToRgb(cor)
    const bgSidebar = `rgba(${r},${g},${b},0.07)`
    const bgAtivo = `rgba(${r},${g},${b},0.15)`
    const corTexto = cliente ? cor : '#a1a1aa'

    const navLink = (href: string, label: string, icon: React.ReactNode) => {
        const ativo = isAtivo(href)
        return (
            <Link
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                style={ativo
                    ? { background: bgAtivo, color: corTexto, fontWeight: 500 }
                    : { color: '#71717a' }
                }
                onMouseEnter={e => { if (!ativo) (e.currentTarget as HTMLElement).style.background = bgSidebar }}
                onMouseLeave={e => { if (!ativo) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
                {icon}
                {label}
            </Link>
        )
    }

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            <aside
                className="w-64 border-r border-zinc-100 flex flex-col flex-shrink-0"
                style={{ background: bgSidebar }}
            >
                {/* Avatar + nome */}
                <div
                    className="px-4 py-4 border-b"
                    style={{ borderColor: `rgba(${r},${g},${b},0.15)` }}
                >
                    {cliente ? (
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: cor }}
                            >
                                {iniciais}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-800 truncate leading-tight">{nome}</p>
                                {razao && <p className="text-[11px] text-zinc-400 truncate mt-0.5">{razao}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-zinc-100 rounded animate-pulse w-3/4" />
                                <div className="h-2.5 bg-zinc-100 rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
                    {navLink(`/clientes/${slug}`, 'Dashboard', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    ))}
                    {navLink(`/clientes/${slug}/tarefas`, 'Tarefas do dia', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="2" y="2" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    ))}
                    {navLink(`/clientes/${slug}/vencimentos`, 'Vencimentos', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    ))}

                    <div className="px-3 pt-4 pb-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                        Configurações
                    </div>

                    {navLink(`/clientes/${slug}/editar`, 'Dados do cliente', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    ))}
                    {navLink(`/clientes/${slug}/configuracoes/tarefas`, 'Tarefas', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            <rect x="2" y="2" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    ))}
                </nav>

                {/* Voltar ao painel */}
                <div
                    className="px-3 py-3"
                    style={{ borderTop: `0.5px solid rgba(${r},${g},${b},0.15)` }}
                >
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1.5 rounded-md"
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = bgSidebar}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Voltar ao painel
                    </Link>
                </div>
            </aside>

            <div className="flex flex-col flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    )
}