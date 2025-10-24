import { ProductData } from "@/types";
import { productRepository } from "./product.repository";

export const productService = {
  getAll: async () => {
    return await productRepository.findAll();
  },

  getById: async (id: number) => {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Produto não encontrado");
    return product;
  },

  create: async (data: ProductData) => {
    if (!data.name || !data.category) throw new Error("Dados inválidos");
    const product = await productRepository.create(data);
    return {
      message: "Produto criado com sucesso",
      product,
    };
  },

  update: async (id: number, data: ProductData) => {
    return await productRepository.update(id, data);
  },

  delete: async (id: number) => {
    return await productRepository.delete(id);
  },
};
