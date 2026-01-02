import { CompraData} from "@/types";
import { compraRepository } from "./compra.repository";
import { clientService } from "../client/client.service";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const compraService = {
  findAll: async () => {
    const compras = await compraRepository.findAll();
    return compras;
  },
  create: async (data: CompraData) => {
    // Fornecedor agora é OPCIONAL
    if (!data.itens || data.itens.length === 0)
      throw new Error("A compra deve ter pelo menos um item");

    // Validar fornecedor apenas se foi fornecido
    if (data.fornecedorId) {
      const fornecedor = await clientService.getById(data.fornecedorId);
      if (!fornecedor) throw new Error("Fornecedor não encontrado");
    }

    const pesoTotal = data.itens.reduce(
      (sum, item) => sum + item.peso,
      0
    );
    const valorTotal = data.itens.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const totalItens = data.itens.length;

    const result = await prisma.$transaction(async (tx) => {
      const novaCompra = await tx.compra.create({
        data: {
          fornecedorId: data.fornecedorId,
          totalItens: totalItens,
          pesoTotal: new Prisma.Decimal(pesoTotal),
          valorTotal: new Prisma.Decimal(valorTotal),
          dataCompra: data.dataCompra || new Date(), // Use a data fornecida ou atual
          itens: {
            create: data.itens.map((item) => ({
              produtoId: item.produtoId,
              peso: new Prisma.Decimal(item.peso), // Use Prisma.Decimal
              precoKg: new Prisma.Decimal(item.precoKg),
              subtotal: new Prisma.Decimal(item.subtotal),
            })),
          },
        },
      });

      const updates = data.itens.map((item) =>
        tx.product.update({
          where: { id: item.produtoId },
          data: {
            stock: { increment: item.peso },
          },
        })
      );

      await Promise.all(updates);

      return novaCompra;
    });

    return {
      message: "Compra e estoque atualizados com sucesso",
      compra: result,
    };
  },
  getTotalSalesToday: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const salesToday = await compraRepository.countSalesBetweenDates(
      today,
      tomorrow
    );

    return salesToday;
  }
};