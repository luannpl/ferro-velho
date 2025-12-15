-- CreateTable
CREATE TABLE "caixas" (
    "id" SERIAL NOT NULL,
    "dataCaixaAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataCaixaFechamento" TIMESTAMP(3),
    "lucro" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "despesa" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "receita" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "numTransacoes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caixas_pkey" PRIMARY KEY ("id")
);
