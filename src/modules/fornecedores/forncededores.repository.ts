import { prisma } from "@/lib/prisma";
import { FornecedorData } from "@/types";

export const fornecedorRepository = {
  findAll: () => prisma.fornecedor.findMany(),
  create: (data: FornecedorData) => prisma.fornecedor.create({ data }),
  findById: (id: number) => prisma.fornecedor.findUnique({ where: { id } }),
};
