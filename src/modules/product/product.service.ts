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
  transferProduct: async (data: {
    productOriginId: number;
    productDestinationId: number;
    quantity: number;
  }) => {
    const { productOriginId, productDestinationId, quantity } = data;

    const productOrigin = await productRepository.findById(productOriginId);
    const productDestination = await productRepository.findById(
      productDestinationId
    );

    if (!productOrigin || !productDestination) {
      throw new Error("Produto de origem ou destino não encontrado");
    }

    if (productOrigin.stock < quantity) {
      throw new Error("Estoque insuficiente no produto de origem");
    }

    productOrigin.stock -= quantity;
    productDestination.stock += quantity;

    await productRepository.update(productOriginId, productOrigin);
    await productRepository.update(productDestinationId, productDestination);

    return {
      message: "Transferência realizada com sucesso",
      productOrigin,
      productDestination,
    };
  },
  getProductsData: async () => {
    const {totalProducts, totalInStock} = await productRepository.getProductsData();
    return {
      totalProducts,
      totalInStock: totalInStock._sum.stock || 0,
    };
  }
  

};
