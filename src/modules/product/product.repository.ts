import { prisma } from "@/lib/prisma";
import { ProductData } from "@/types";
import { Prisma, Product } from "@prisma/client";

export const productRepository = {
  findAll: () => prisma.product.findMany(),
  findById: (id: number) => prisma.product.findUnique({ where: { id } }),
  create: (data: ProductData) => prisma.product.create({ data }),
  update: (id: number, data: Partial<Product>) =>
    prisma.product.update({ where: { id }, data }),
  delete: (id: number) => prisma.product.delete({ where: { id } }),
  updateStock: (
    id: number,
    quantity: number,
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx || prisma;
    return db.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  },
};
