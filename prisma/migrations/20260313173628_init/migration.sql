/*
  Warnings:

  - You are about to drop the column `obrigacaoId` on the `Tarefa` table. All the data in the column will be lost.
  - You are about to drop the `Obrigacao` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `obrigacaoClienteId` to the `Tarefa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Obrigacao" DROP CONSTRAINT "Obrigacao_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Tarefa" DROP CONSTRAINT "Tarefa_obrigacaoId_fkey";

-- AlterTable
ALTER TABLE "Tarefa" DROP COLUMN "obrigacaoId",
ADD COLUMN     "obrigacaoClienteId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Obrigacao";

-- CreateTable
CREATE TABLE "ObrigacaoTemplate" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoTarefa" NOT NULL,
    "recorrencia" "TipoRecorrencia" NOT NULL,
    "diaSemana" INTEGER,
    "diaDoMes" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObrigacaoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObrigacaoCliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoTarefa" NOT NULL,
    "recorrencia" "TipoRecorrencia" NOT NULL,
    "diaSemana" INTEGER,
    "diaDoMes" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "templateId" TEXT,

    CONSTRAINT "ObrigacaoCliente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ObrigacaoCliente" ADD CONSTRAINT "ObrigacaoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrigacaoCliente" ADD CONSTRAINT "ObrigacaoCliente_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ObrigacaoTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_obrigacaoClienteId_fkey" FOREIGN KEY ("obrigacaoClienteId") REFERENCES "ObrigacaoCliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
