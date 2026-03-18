/*
  Warnings:

  - You are about to drop the column `nome` on the `Cliente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `razaoSocial` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "nome",
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "nomeContato" TEXT,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "razaoSocial" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cnpj_key" ON "Cliente"("cnpj");
