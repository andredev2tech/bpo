import { prismaTest } from '../setup'
import bcrypt from 'bcryptjs'

export async function seedTest(userId = 'user-test-id', email = 'teste@bpo.com') {
    const senhaHash = await bcrypt.hash('senha123', 4)

    const usuario = await prismaTest.usuario.create({
        data: { id: userId, nome: 'Teste User', email, senhaHash },
    })

    // Tipos dinâmicos
    const tipo = await prismaTest.tipoTarefa.create({
        data: { nome: 'Conciliação Teste', cor: '#378ADD', usuarioId: usuario.id },
    })

    const cliente = await prismaTest.cliente.create({
        data: { razaoSocial: 'Empresa Teste LTDA', nomeFantasia: 'Empresa Teste', slug: `empresa-teste-${userId.slice(-6)}`, usuarioId: usuario.id },
    })

    const modelo = await prismaTest.tarefaModelo.create({
        data: { nome: 'Conciliação bancária', tipoId: tipo.id, recorrencia: 'DIAS_UTEIS', usuarioId: usuario.id },
    })
    return { usuario, tipo, cliente, modelo }
}
