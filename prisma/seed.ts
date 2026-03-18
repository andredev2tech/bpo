import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.tarefa.deleteMany()
  await prisma.vencimento.deleteMany()
  await prisma.tarefaConfig.deleteMany()
  await prisma.tarefaModelo.deleteMany()
  await prisma.tipoTarefa.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.usuario.deleteMany()

  const senhaHash = await bcrypt.hash('123456', 10)
  const usuario = await prisma.usuario.create({
    data: { nome: 'aline ane', email: 'aline@bpo.com.br', telefone: '(27) 99900-0000', senhaHash },
  })
  console.log(`✔ Usuário criado: ${usuario.email} / senha: 123456`)

  const tiposData = [
    { nome: 'Conciliação', cor: '#378ADD' },
    { nome: 'Pagamento',   cor: '#1D9E75' },
    { nome: 'Relatório',   cor: '#7F77DD' },
    { nome: 'Fiscal',      cor: '#E24B4A' },
  ]
  const tipos: Record<string, string> = {}
  for (const t of tiposData) {
    const tipo = await prisma.tipoTarefa.create({ data: { ...t, usuarioId: usuario.id } })
    tipos[t.nome] = tipo.id
  }

  const clientesData = [
    { razaoSocial: 'Ecovila Empreendimentos LTDA', nomeFantasia: 'Ecovila Empreendimentos', slug: 'ecovila-empreendimentos', cnpj: '11.111.111/0001-11', cor: '#378ADD' },
    { razaoSocial: 'Ecovila Construtora S.A.', nomeFantasia: 'Ecovila Construtora', slug: 'ecovila-construtora', cnpj: '22.222.222/0001-22', cor: '#1D9E75' },
    { razaoSocial: 'Vila Surf Shop', nomeFantasia: 'Vila Surf', slug: 'vila-surf', cnpj: '33.333.333/0001-33', cor: '#D85A30' },
    { razaoSocial: 'Clínica Odonto do João', nomeFantasia: 'Odonto do Joao', slug: 'odonto-do-joao', cnpj: '44.444.444/0001-44', cor: '#7F77DD' },
    { razaoSocial: 'Igreja de Fé e Paz', nomeFantasia: 'Igreja de Fe', slug: 'igreja-de-fe', cnpj: '55.555.555/0001-55', cor: '#E24B4A' },
  ]
  const clientes = []
  for (const c of clientesData) {
    const cliente = await prisma.cliente.create({ data: { ...c, usuarioId: usuario.id } })
    clientes.push(cliente)
  }

  const modelosData = [
    { nome: 'Conciliação bancária Itaú', tipoId: tipos['Conciliação'], recorrencia: 'DIAS_UTEIS' as const },
    { nome: 'Emissão de NF-e de Serviços', tipoId: tipos['Fiscal'], recorrencia: 'DIARIA' as const },
    { nome: 'Folha de pagamento', tipoId: tipos['Pagamento'], recorrencia: 'MENSAL' as const, diaDoMes: 5 },
    { nome: 'Fechamento de caixa semanal', tipoId: tipos['Relatório'], recorrencia: 'SEMANAL' as const, diaSemana: 5 },
    { nome: 'Apuração Simples Nacional', tipoId: tipos['Fiscal'], recorrencia: 'MENSAL' as const, diaDoMes: 20 },
    { nome: 'Lançamento de Taxas', tipoId: tipos['Pagamento'], recorrencia: 'DIAS_UTEIS' as const },
  ]
  const modelos = []
  for (const m of modelosData) {
    const modelo = await prisma.tarefaModelo.create({ data: { ...m, usuarioId: usuario.id } })
    modelos.push(modelo)
  }

  // -------------------------------------------------------------
  // Foco dos Testes: Ecovila Empreendimentos (clientes[0])
  // -------------------------------------------------------------
  const ecovila = clientes[0]

  const configsEcovila = []
  for (const m of modelos) {
    const config = await prisma.tarefaConfig.create({
      data: {
        clienteId: ecovila.id, modeloId: m.id,
        nome: m.nome, tipoId: m.tipoId,
        recorrencia: m.recorrencia,
        diaSemana: m.diaSemana ?? null,
        diaDoMes: m.diaDoMes ?? null,
        horaLimite: m.recorrencia === 'MENSAL' ? '18:00' : '17:00'
      },
    })
    configsEcovila.push(config)
  }

  // Helper de Datas focado em Março de 2026
  const data = (dia: number, hora: number = 12) => new Date(2026, 2, dia, hora, 0, 0) // Março é mês 2 no JS
  
  const getConf = (nome: string) => configsEcovila.find(c => c.nome === nome)!

  const tarefasParaCriar = [
    // --- ATRASADAS ---
    { config: getConf('Conciliação bancária Itaú'), data: data(12), status: 'AGUARDANDO' as any, aguardandoDesde: data(12, 14), aguardandoMotivo: 'Falta extrato em PDF', aguardandoResponsavel: 'CLIENTE' as any },
    { config: getConf('Fechamento de caixa semanal'), data: data(14), status: 'PENDENTE' as any },
    { config: getConf('Emissão de NF-e de Serviços'), data: data(14), status: 'PENDENTE' as any }, 
    
    // --- HOJE (15/03/2026) ---
    { config: getConf('Emissão de NF-e de Serviços'), data: data(15), status: 'PENDENTE' as any },
    { config: getConf('Conciliação bancária Itaú'), data: data(15), status: 'PENDENTE' as any },
    { config: getConf('Lançamento de Taxas'), data: data(15), status: 'CONCLUIDA' as any, iniciadaEm: data(15, 8), finalizadaEm: data(15, 8, 45) },
    
    // --- AMANHÃ (16/03/2026) ---
    { config: getConf('Emissão de NF-e de Serviços'), data: data(16), status: 'PENDENTE' as any },
    { config: getConf('Conciliação bancária Itaú'), data: data(16), status: 'PENDENTE' as any },

    // --- SEMANA QUE VEM / FUTURO ---
    { config: getConf('Apuração Simples Nacional'), data: data(20), status: 'PENDENTE' as any },
    { config: getConf('Fechamento de caixa semanal'), data: data(21), status: 'PENDENTE' as any },
    
    // --- MÊS QUE VEM ---
    { config: getConf('Folha de pagamento'), data: new Date(2026, 3, 5, 12), status: 'PENDENTE' as any }, // Abril 05
  ]

  let qtdeTotal = 0
  for (const t of tarefasParaCriar) {
    await prisma.tarefa.create({
      data: {
        clienteId: ecovila.id,
        tarefaConfigId: t.config.id,
        data: t.data,
        status: t.status,
        horaLimite: t.config.horaLimite,
        iniciadaEm: t.iniciadaEm ?? null,
        finalizadaEm: t.finalizadaEm ?? null,
        aguardandoDesde: t.aguardandoDesde ?? null,
        aguardandoMotivo: t.aguardandoMotivo ?? null,
        aguardandoResponsavel: t.aguardandoResponsavel ?? null,
      }
    })
    qtdeTotal++
  }

  // Adicionar umas aleatórias nas outras empresas só para não ficarem vazias
  for (let i = 1; i < clientes.length; i++) {
    const configRoot = await prisma.tarefaConfig.create({
      data: {
        clienteId: clientes[i].id, modeloId: modelos[0].id, nome: modelos[0].nome, tipoId: modelos[0].tipoId,
        recorrencia: 'DIARIA', horaLimite: '17:00'
      }
    })
    await prisma.tarefa.create({ data: { clienteId: clientes[i].id, tarefaConfigId: configRoot.id, data: data(15), status: 'PENDENTE', horaLimite: '17:00' } })
    qtdeTotal++
  }

  console.log(`\n✅ Seed concluído. Foram criadas ${qtdeTotal} tarefas ricas para testes!`)
  console.log(`   --> Empresa Mestre de Testes: Ecovila Empreendimentos (slug: ecovila-empreendimentos)`)
  console.log(`   Login: aline@bpo.com.br / Senha: 123456`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())