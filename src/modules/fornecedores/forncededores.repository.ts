import { prisma } from "@/lib/prisma";
import { FornecedorData } from "@/types";
import { Fornecedor } from "@prisma/client";

export const fornecedorRepository = {
  findAll: () => prisma.fornecedor.findMany(),
  create: (data: FornecedorData) => prisma.fornecedor.create({ data }),
  findById: (id: number) => prisma.fornecedor.findUnique({ where: { id } }),
  update: (id: number, data: Partial<Fornecedor>) =>
      prisma.fornecedor.update({ where: { id }, data }),
  delete: (id: number) => prisma.fornecedor.delete({ where: { id } }),
};
