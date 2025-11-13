import { prisma } from "@/lib/prisma";
import { CompraData } from "@/types";

export const compraRepository = {
  findAll: () => prisma.compra.findMany(),
  create: (data: CompraData) => prisma.compra.create({ data }),
};
