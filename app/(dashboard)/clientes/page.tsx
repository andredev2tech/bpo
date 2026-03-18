'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Cliente = {
  id: string
  slug: string
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  email: string | null
  telefone: string | null
  nomeContato: string | null
  cor: string
  ativo: boolean
}

function nomeExibicao(c: Cliente) {
  return c.nomeFantasia || c.razaoSocial
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [deletando, setDeletando] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
    setLoading(false)
  }

  async function remover(id: string) {
    if (!confirm('Remover este cliente?')) return
    setDeletando(id)
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    setClientes(prev => prev.filter(c => c.id !== id))
    setDeletando(null)
  }

  const filtrados = clientes.filter(c =>
    nomeExibicao(c).toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj?.includes(busca) ||
    c.nomeContato?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-zinc-800">Clientes</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-56 text-sm bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-zinc-600 placeholder:text-zinc-400 outline-none focus:border-blue-200 focus:bg-white transition-colors"
        />
        <Link
          href="/clientes/novo"
          className="text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors flex-shrink-0"
        >
          + Novo cliente
        </Link>
      </div>

      {/* Lista */}
      <main className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-zinc-400">Carregando...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm text-zinc-400">{busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>
            {!busca && (
              <Link href="/clientes/novo" className="text-sm text-blue-500 hover:underline">
                Cadastrar primeiro cliente
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtrados.map(c => (
              <div key={c.id} className="bg-white border border-zinc-100 rounded-lg px-5 py-3.5 flex items-center gap-4 hover:border-zinc-200 transition-colors">

                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: c.cor }}>
                  {nomeExibicao(c).slice(0, 2).toUpperCase()}
                </div>

                {/* Nome — largura fixa pra não empurrar o resto */}
                <div className="w-48 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{nomeExibicao(c)}</p>
                  {c.nomeFantasia && (
                    <p className="text-xs text-zinc-400 truncate">{c.razaoSocial}</p>
                  )}
                </div>

                {/* CNPJ + Email */}
                <div className="w-52 min-w-0">
                  <p className="text-xs text-zinc-400 truncate">{c.email || '—'}</p>
                  <p className="text-sm text-zinc-600">{c.cnpj || '—'}</p>
                </div>

                {/* Contato + Telefone */}
                <div className="w-44 min-w-0">
                  <p className="text-xs text-zinc-400 truncate">{c.nomeContato || '—'}</p>
                  <p className="text-sm text-zinc-600">{c.telefone || '—'}</p>
                </div>

                {/* Espaço flexível empurra ações pra direita */}
                <div className="flex-1" />

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/clientes/${(c as any).slug}/editar`}
                    className="text-xs text-zinc-400 hover:text-blue-500 transition-colors px-2 py-1 rounded hover:bg-zinc-50"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => remover(c.id)}
                    disabled={deletando === c.id}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {deletando === c.id ? '...' : 'Remover'}
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