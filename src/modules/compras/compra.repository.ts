import { prisma } from "@/lib/prisma";
import { CompraData } from "@/types";
import { Prisma } from "@prisma/client";

type Tx = Omit<
  Prisma.PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export const compraRepository = {
  findAll: () => prisma.compra.findMany(),
  create: (data: CompraData, tx?: Tx) => {
    const db = tx || prisma;
    return db.compra.create({
      data: {
        fornecedorId: data.fornecedorId,
        totalItens: data.totalItens,
        pesoTotal: data.pesoTotal,
        valorTotal: data.valorTotal,
        dataCompra: data.dataCompra,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            pricePerKg: item.pricePerKg,
            subtotal: item.subtotal,
          })),
        },
      },
    });
  },
};
