import { prisma } from "@/lib/prisma";
import { ProductData } from "@/types";
import { Product } from "@prisma/client";

export const productRepository = {
  findAll: () => prisma.product.findMany(),
  findById: (id: number) => prisma.product.findUnique({ where: { id } }),
  create: (data: ProductData) => prisma.product.create({ data }),
  update: (id: number, data: Partial<Product>) =>
    prisma.product.update({ where: { id }, data }),
  delete: (id: number) => prisma.product.delete({ where: { id } }),
  getProductsData: async () => {
    const totalProducts = await prisma.product.count();
    const totalInStock = await prisma.product.aggregate({
      _sum: {
        stock: true,
      },
    });
    return { totalProducts, totalInStock };
  }
};
