'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

type ClienteNav = {
    id: string
    slug: string
    razaoSocial: string
    nomeFantasia: string | null
    cor: string
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [clientes, setClientes] = useState<ClienteNav[]>([])

    useEffect(() => {
        fetch('/api/clientes')
            .then(r => {
                if (r.status === 401) {
                    signOut({ callbackUrl: '/login' })
                    return
                }
                return r.json()
            })
            .then(data => setClientes(data || []))
            .catch(() => { })
    }, [])

    function nomeExibicao(c: ClienteNav) {
        return c.nomeFantasia || c.razaoSocial
    }

    function isAtivo(href: string) {
        if (href === '/') return pathname === '/'
        if (href === '/clientes') return pathname === '/clientes' || pathname === '/clientes/novo'
        return pathname.startsWith(href)
    }

    const navLink = (href: string, label: string, icon: React.ReactNode) => (
        <Link
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isAtivo(href)
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                }`}
        >
            {icon}
            {label}
        </Link>
    )

    const { data: session } = useSession()

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-100 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="px-4 py-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="5" height="5" rx="1" fill="#185FA5" />
                                <rect x="9" y="2" width="5" height="5" rx="1" fill="#185FA5" opacity=".4" />
                                <rect x="2" y="9" width="5" height="5" rx="1" fill="#185FA5" opacity=".4" />
                                <rect x="9" y="9" width="5" height="5" rx="1" fill="#185FA5" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-zinc-800">BPO Manager</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
                    {navLink('/', 'Home', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    ))}
                    {navLink('/clientes', 'Clientes', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    ))}
                    {navLink('/tarefas', 'Tarefas', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            <rect x="2" y="2" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    ))}
                    {navLink('/vencimentos', 'Vencimentos', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    ))}
                    {navLink('/configuracoes/tipos', 'Tipos de tarefa', (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="2" fill="currentColor" />
                            <circle cx="3" cy="8" r="2" fill="currentColor" />
                            <circle cx="13" cy="8" r="2" fill="currentColor" />
                        </svg>
                    ))}

                    {clientes.length > 0 && (
                        <>
                            <div className="px-3 pt-4 pb-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                                Clientes
                            </div>
                            {clientes.map(c => (
                                <Link
                                    key={c.id}
                                    href={`/clientes/${c.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
                                >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.cor }} />
                                    <span className="truncate">{nomeExibicao(c)}</span>
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                {/* Bottom — usuário + logout */}
                <div className="px-3 py-3 border-t border-zinc-100">
                    {session?.user?.email && (
                        <p className="text-[11px] text-zinc-400 truncate mb-2 px-1">
                            {session.user.email}
                        </p>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            <path d="M10 5l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    )
}