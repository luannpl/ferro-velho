import { fornecedorRepository } from "./forncededores.repository";
import { FornecedorData } from "@/types";

export const fornecedorService = {
  getAll: async () => {
    return await fornecedorRepository.findAll();
  },
  create: async (data: FornecedorData) => {
    if (!data.name) throw new Error("Nome do fornecedor é obrigatório");
    const fornecedor = await fornecedorRepository.create(data);
    return {
      message: "Fornecedor criado com sucesso",
      fornecedor,
    };
  },
  findById: async (id: number) => {
    return await fornecedorRepository.findById(id);
  },
};
