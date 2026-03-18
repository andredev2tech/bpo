'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [form, setForm] = useState({ email: '', senha: '' })
    const [erro, setErro] = useState('')
    const [loading, setLoading] = useState(false)

    function set(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErro('')
    }

    async function entrar() {
        if (!form.email.trim() || !form.senha.trim()) {
            setErro('Preencha email e senha.')
            return
        }

        setLoading(true)
        setErro('')

        const res = await signIn('credentials', {
            email: form.email.trim(),
            senha: form.senha,
            redirect: false,
        })

        if (res?.error) {
            setErro('Email ou senha incorretos.')
            setLoading(false)
            return
        }

        router.push('/')
        router.refresh()
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') entrar()
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex items-center gap-2.5 justify-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="2" width="5" height="5" rx="1" fill="#185FA5" />
                            <rect x="9" y="2" width="5" height="5" rx="1" fill="#185FA5" opacity=".4" />
                            <rect x="2" y="9" width="5" height="5" rx="1" fill="#185FA5" opacity=".4" />
                            <rect x="9" y="9" width="5" height="5" rx="1" fill="#185FA5" />
                        </svg>
                    </div>
                    <span className="text-base font-semibold text-zinc-800">BPO Manager</span>
                </div>

                {/* Card */}
                <div className="bg-white border border-zinc-100 rounded-xl px-8 py-8 flex flex-col gap-5">
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-800">Entrar</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Acesse sua conta para continuar</p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="seu@email.com.br"
                            autoComplete="email"
                            className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
                        />
                    </div>

                    {/* Senha */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-zinc-500">Senha</label>
                            <a href="/recuperar-senha" className="text-xs text-blue-400 hover:text-blue-600 transition-colors">
                                Esqueceu a senha?
                            </a>
                        </div>
                        <input
                            type="password"
                            value={form.senha}
                            onChange={e => set('senha', e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
                        />
                    </div>

                    {/* Erro */}
                    {erro && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                            {erro}
                        </p>
                    )}

                    {/* Botão */}
                    <button
                        onClick={entrar}
                        disabled={loading}
                        className="w-full text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>

            </div>
        </div>
    )
}