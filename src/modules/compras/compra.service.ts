import { CompraData } from "@/types";
import { compraRepository } from "./compra.repository";
import { fornecedorService } from "../fornecedores/fornecedores.service";
import { productRepository } from "../product/product.repository";
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
    if (!data.itens || data.itens.length === 0)
      throw new Error("A compra deve ter pelo menos um item");

    const fornecedor = await fornecedorService.findById(data.fornecedorId);
    if (!fornecedor) throw new Error("Fornecedor não encontrado");

    const compra = await prisma.$transaction(async (tx) => {
      const promises = data.itens.map((item) =>
        productRepository.updateStock(item.produtoId, item.peso, tx)
      );
      await Promise.all(promises);
      return compraRepository.create(data, tx);
    });

    return {
      message: "Compra realizada com sucesso",
      compra,
    };
  },
};
