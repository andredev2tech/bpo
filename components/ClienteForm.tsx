'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id?: string
}

const CORES = [
  '#6366f1', '#378ADD', '#1D9E75', '#D85A30', '#7F77DD', '#E24B4A', '#BA7517', '#0F6E56',
]

function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')    // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-')             // espaços → hífens
    .replace(/-+/g, '-')              // hífens duplos → simples
}

export default function ClienteForm({ id }: Props) {
  const router = useRouter()
  const editando = !!id

  const [form, setForm] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    slug: '',
    cnpj: '',
    email: '',
    telefone: '',
    nomeContato: '',
    cor: '#6366f1',
  })
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [loading, setLoading] = useState(editando)

  useEffect(() => {
    if (!editando) return
    fetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          razaoSocial: data.razaoSocial || '',
          nomeFantasia: data.nomeFantasia || '',
          slug: data.slug || '',
          cnpj: data.cnpj || '',
          email: data.email || '',
          telefone: data.telefone || '',
          nomeContato: data.nomeContato || '',
          cor: data.cor || '#6366f1',
        })
        // No modo edição, o slug já existe — tratar como manual para não sobrescrever
        setSlugEditadoManualmente(true)
        setLoading(false)
      })
  }, [id, editando])

  function set(field: string, value: string) {
    setForm(prev => {
      const novo = { ...prev, [field]: value }

      // Auto-gerar slug se não foi editado manualmente
      if (!slugEditadoManualmente) {
        const base = field === 'nomeFantasia' ? value : (field === 'razaoSocial' && !prev.nomeFantasia) ? value : prev.nomeFantasia || prev.razaoSocial
        const fonte = (field === 'nomeFantasia') ? value : (field === 'razaoSocial' && !novo.nomeFantasia) ? value : novo.nomeFantasia || novo.razaoSocial
        novo.slug = gerarSlug(fonte)
      }

      return novo
    })
    setErro('')
  }

  function setSlugManual(value: string) {
    setSlugEditadoManualmente(true)
    setForm(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
    setErro('')
  }

  function resetarSlug() {
    setSlugEditadoManualmente(false)
    const fonte = form.nomeFantasia || form.razaoSocial
    setForm(prev => ({ ...prev, slug: gerarSlug(fonte) }))
  }

  async function salvar() {
    if (!form.razaoSocial.trim()) {
      setErro('Razão social é obrigatória.')
      return
    }
    if (!form.slug.trim()) {
      setErro('O identificador (slug) é obrigatório.')
      return
    }
    setSalvando(true)
    setErro('')

    const url = editando ? `/api/clientes/${id}` : '/api/clientes'
    const method = editando ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao salvar.')
      setSalvando(false)
      return
    }

    router.push('/clientes')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-center flex-1">
          <p className="text-sm text-zinc-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar */}
      <div className="bg-white border-b border-zinc-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => router.push('/clientes')}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-zinc-800">
            {editando ? 'Editar cliente' : 'Novo cliente'}
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {editando ? 'Atualize os dados do cliente' : 'Preencha os dados do novo cliente'}
          </p>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-xl flex flex-col gap-5">

          {/* Razão social */}
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1.5">
              Razão social <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.razaoSocial}
              onChange={e => set('razaoSocial', e.target.value)}
              placeholder="Ex: Empresa LTDA"
              className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Nome fantasia */}
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Nome fantasia</label>
            <input
              type="text"
              value={form.nomeFantasia}
              onChange={e => set('nomeFantasia', e.target.value)}
              placeholder="Ex: Empresa"
              className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Identificador <span className="text-red-400">*</span>
              </label>
              {slugEditadoManualmente && (
                <button
                  type="button"
                  onClick={resetarSlug}
                  className="text-[11px] text-blue-400 hover:text-blue-600 transition-colors"
                >
                  ↺ Gerar automaticamente
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-300 select-none pointer-events-none">
                /clientes/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={e => setSlugManual(e.target.value)}
                placeholder="nome-do-cliente"
                className={`w-full text-sm bg-white border rounded-lg pl-[88px] pr-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none transition-colors ${slugEditadoManualmente
                  ? 'border-zinc-200 focus:border-zinc-300'
                  : 'border-blue-200 focus:border-blue-300 bg-blue-50/30'
                  }`}
              />
            </div>
            {!slugEditadoManualmente && (
              <p className="text-[11px] text-blue-400 mt-1">Gerado automaticamente — clique no campo para editar</p>
            )}
          </div>

          {/* CNPJ + Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1.5">CNPJ</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={e => set('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1.5">Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="contato@empresa.com.br"
              className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Nome contato */}
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Nome do contato principal</label>
            <input
              type="text"
              value={form.nomeContato}
              onChange={e => set('nomeContato', e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Cor */}
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1.5">Cor de identificação</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.cor}
                onChange={e => set('cor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                title="Escolher cor"
              />
              <span className="text-sm text-zinc-500">{form.cor}</span>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">{erro}</p>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={salvar}
              disabled={salvando}
              className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors"
            >
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar cliente'}
            </button>
            <button
              onClick={() => router.push('/clientes')}
              className="text-sm text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg px-5 py-2.5 transition-colors hover:bg-zinc-50"
            >
              Cancelar
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
