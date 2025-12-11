/*
  Warnings:

  - You are about to drop the column `pricePerKg` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "pricePerKg",
ADD COLUMN     "pricePerKgCompra" DOUBLE PRECISION,
ADD COLUMN     "pricePerKgVenda" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "vendas" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalItens" INTEGER NOT NULL DEFAULT 0,
    "pesoTotal" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "valorTotal" DECIMAL(65,30) NOT NULL DEFAULT 0.00,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_venda" (
    "id" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "peso" DECIMAL(65,30) NOT NULL,
    "precoKg" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0.00,

    CONSTRAINT "itens_venda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
