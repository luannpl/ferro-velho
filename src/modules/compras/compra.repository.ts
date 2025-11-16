import { prisma } from "@/lib/prisma";
import { CompraData } from "@/types";

export const compraRepository = {
  findAll: () => prisma.compra.findMany(),
  create: (data: CompraData) =>
    prisma.compra.create({
      data: {
        fornecedorId: data.fornecedorId,
        totalItens: data.totalItens,
        pesoTotal: data.pesoTotal,
        valorTotal: data.valorTotal,
        dataCompra: data.dataCompra,
        // Criação aninhada dos ItemCompra
        itens: {
          create: data.itens.map((item) => ({
            produtoId: item.produtoId,
            peso: item.peso,
            precoKg: item.precoKg,
            subtotal: item.subtotal,
          })),
        },
      },
    }),
};
