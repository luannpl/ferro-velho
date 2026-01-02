-- DropForeignKey
ALTER TABLE "compras" DROP CONSTRAINT "compras_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_clientId_fkey";

-- AlterTable
ALTER TABLE "compras" ALTER COLUMN "fornecedorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "clientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
