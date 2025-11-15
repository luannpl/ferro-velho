import { CompraData } from "@/types";
import { compraRepository } from "./compra.repository";
import { fornecedorService } from "../fornecedores/fornecedores.service";
import { productService } from "../product/product.service";
import { prisma } from "@/lib/prisma";

export const compraService = {
  findAll: async () => {
    const compras = await compraRepository.findAll();
    return compras;
  },
  create: async (data: CompraData) => {
    if (!data.fornecedorId) throw new Error("Fornecedor é obrigatório");
    if (!data.totalItens) throw new Error("Total de itens é obrigatório");
    if (!data.pesoTotal) throw new Error("Peso total é obrigatório");
    if (!data.valorTotal) throw new Error("Valor total é obrigatório");
    if (!data.dataCompra) throw new Error("Data da compra é obrigatória");
    if (!data.items || data.items.length === 0)
      throw new Error("A compra deve ter pelo menos um item");

    const fornecedor = await fornecedorService.findById(data.fornecedorId);
    if (!fornecedor) throw new Error("Fornecedor não encontrado");

    const compra = await prisma.$transaction(async (tx) => {
      const novaCompra = await compraRepository.create(data, tx);

      for (const item of data.items) {
        const product = await productService.getById(item.productId);
        if (!product) {
          throw new Error(`Produto com ID ${item.productId} não encontrado`);
        }
        await productService.update(
          item.productId,
          {
            stock: product.stock + item.quantity,
          },
          tx
        );
      }
      return novaCompra;
    });

    return {
      message: "Compra realizada com sucesso",
      compra,
    };
  },
};
