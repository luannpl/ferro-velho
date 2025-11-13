import { ProductData } from "@/types";
import { productRepository } from "./product.repository";
import { stat } from "fs";

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
    const product = await productRepository.findById(id);
    if (!product) {
      return {
        message: "Produto não encontrado",
        status: 404,
      };
    }
    await productRepository.delete(id);
    return {
      message: "Produto deletado com sucesso",
      status: 200,
    };
  },
};
