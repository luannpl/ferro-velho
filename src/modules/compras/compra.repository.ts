import { prisma } from "@/lib/prisma";
import { CompraData } from "@/types";
import { Prisma } from "@prisma/client";

export const compraRepository = {
  findAll: () => prisma.compra.findMany(),
  create: (data: CompraData, tx?: Prisma.TransactionClient) => {
    const { itens, ...compraData } = data;
    const db = tx || prisma;

    return db.compra.create({
      data: {
        ...compraData,
        itens: {
          create: itens,
        },
      },
    });
  },
};
