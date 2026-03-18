# Mapa de Arquitetura em Alta Densidade (IA-Optimized)

Este mapa atua no limite de densidade de informação para IAs (Alto Contexto, Baixos Tokens). Se você é um agente de IA, leia-o e considere o contexto 100% carregado.

### Lógica da Aplicação
Sistema de BPO Financeiro onde o gestor (Usuario - autenticado via NextAuth v5) gerencia múltiplas empresas (Clientes).
O Gestor cria seu Catálogo (TarefaModelo) de acordo com categorias dinâmicas (TipoTarefa).
Cada Cliente recebe uma "assinatura" (TarefaConfig) de tarefas do Catálogo ou tarefas avulsas.
Processos de Cron diários geram instâncias concretas (Tarefa) no dia correspondente para serem resolvidas (iniciadaEm, finalizadaEm, concluida).

### Estrutura de DB Essencial
- Prisma é usado como ORM. 
- Schema principal na pasta `prisma/schema.prisma`.
- Arquivo central de banco `lib/prisma.ts`.

### Regras Sistêmicas
- Proteção total de Tenant `where: { usuarioId }` nas API routes.
- Front-ends recebem payloads tipados, mas nunca lidam com validação rígida que não seja repassada ao backend (com Zod/Joi, ou manual com ifs e retornos `NextResponse.json(..., {status})`).
- Remoção lógica (`ativo: false`) é o único método seguro aprovado no sistema.

### Tipos de Recorrência
- `DIARIA`: Todos os dias.
- `DIAS_UTEIS`: De Seg a Sex.
- `SEMANAL`: Usa campo dependente `diaSemana: Int` (0 = Dom, 6 = Sáb).
- `MENSAL`: Usa campo dependente `diaDoMes: Int` (1 a 31).
- `ANUAL`: Usa campo dependente `mesDoAno: Int` (1 a 12).
