import { prisma } from "@/lib/prisma";
import { VendaData } from "@/types";

export const vendaRepository = {
    findAll: () => prisma.venda.findMany(),
    create: (data: VendaData) =>
        prisma.venda.create({
            data: {
                clientId: data.clientId,
                totalItens: data.totalItens,
                pesoTotal: data.pesoTotal,
                valorTotal: data.valorTotal,
                dataVenda: data.dataVenda,
                itens: {
                    create: data.itens.map((item) => ({
                        produtoId: item.produtoId,
                        peso: item.peso,
                        precoKg: item.precoKg,
                        subtotal: item.subtotal,
                    })),
                },
            },
        }),
    countSalesBetweenDates: (startDate: Date, endDate: Date) =>
        prisma.venda.count({
            where: {
                dataVenda: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        }),
}