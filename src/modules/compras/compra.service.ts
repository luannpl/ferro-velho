import { CompraData } from "@/types";
import { compraRepository } from "./compra.repository";
import { fornecedorService } from "../fornecedores/fornecedores.service";

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

    const fornecedor = await fornecedorService.findById(data.fornecedorId);
    if (!fornecedor) throw new Error("Fornecedor não encontrado");
    const compra = await compraRepository.create(data);
    return {
      message: "Compra realizada com sucesso",
      compra,
    };
  },
};
