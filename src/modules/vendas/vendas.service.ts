import { vendaRepository } from './vendas.repository';
import { VendaData } from '@/types';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const vendasService = {
    findAll: async () => {
        const vendas = await vendaRepository.findAll();
        return vendas;
    },
    create: async (data: VendaData) => {
        // Cliente agora é OPCIONAL
        if (!data.itens || data.itens.length === 0)
            throw new Error("A venda deve ter pelo menos um item");

        const pesoTotal = data.itens.reduce((sum, item) => sum + item.peso, 0);
        const valorTotal = data.itens.reduce((sum, item) => sum + item.subtotal, 0);
        const totalItens = data.itens.length;

        // ✔️ Transação Prisma
        const result = await prisma.$transaction(async (tx) => {

            // ✔️ Cria a venda
            const novaVenda = await tx.venda.create({
                data: {
                    clientId: data.clientId,
                    totalItens,
                    pesoTotal: new Prisma.Decimal(pesoTotal),
                    valorTotal: new Prisma.Decimal(valorTotal),
                    dataVenda: data.dataVenda || new Date(),
                    itens: {
                        create: data.itens.map((item) => ({
                            produtoId: item.produtoId,
                            peso: new Prisma.Decimal(item.peso),
                            precoKg: new Prisma.Decimal(item.precoKg),
                            subtotal: new Prisma.Decimal(item.subtotal),
                        })),
                    },
                },
            });

            // ✔️ Atualiza estoque de cada produto vendido
            for (const item of data.itens) {
                await tx.product.update({
                    where: { id: item.produtoId },
                    data: {
                        stock: {
                            decrement: item.peso, // diminui o estoque
                        },
                    },
                });
            }

            return novaVenda;
        });

        return {
            message: "Venda criada com sucesso",
            venda: result,
        };
    },

    getTotalVendasToday: async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return await vendaRepository.countSalesBetweenDates(startOfDay, endOfDay);
    },
};