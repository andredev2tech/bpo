/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId,slug]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,cnpj]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `ObrigacaoTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cliente_cnpj_key";

-- DropIndex
DROP INDEX "Cliente_slug_key";

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ObrigacaoTemplate" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "senhaHash" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_slug_key" ON "Cliente"("usuarioId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_cnpj_key" ON "Cliente"("usuarioId", "cnpj");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrigacaoTemplate" ADD CONSTRAINT "ObrigacaoTemplate_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
