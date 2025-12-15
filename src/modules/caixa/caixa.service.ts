import { Prisma } from '@prisma/client';
import { prisma } from "@/lib/prisma";
import { CaixaData } from "@/types";
import { caixaRepository } from "./caixa.repository";

export const caixaService = {
    getAll: async () => {
        return await caixaRepository.findAll();
    },
    getById: async (id: number) => {
        const caixa = await caixaRepository.findById(id);
        if (!caixa) throw new Error("Caixa nao encontrado");
        return caixa;
    },
    create: async (data: CaixaData) => {
        const caixa = await caixaRepository.create(data);
        return {
            message: "Caixa criado com sucesso",
            caixa,
        }
    },
    update: async (id: number, data: CaixaData) => {
        const dataToUpdate: any = { ...data };
        if (data.lucro !== undefined) dataToUpdate.lucro = new Prisma.Decimal(data.lucro);
        if (data.receita !== undefined) dataToUpdate.receita = new Prisma.Decimal(data.receita);
        if (data.despesa !== undefined) dataToUpdate.despesa = new Prisma.Decimal(data.despesa);

        return await caixaRepository.update(id, dataToUpdate);
    },

    delete: async (id: number) => {
        return await caixaRepository.delete(id);
    },

    findCaixaAberto: async () => {
        const caixa = await prisma.caixa.findFirst({
            where: {
                dataCaixaFechamento: null, // O caixa está aberto se o fechamento for NULL
            },
            orderBy: { dataCaixaAbertura: 'desc' }, // Pega o último aberto
        });

        if (!caixa) return null;

        // Calcular métricas em tempo real
        const dataAbertura = caixa.dataCaixaAbertura;

        // 1. Receita (Vendas) e Peso Vendido
        const vendas = await prisma.venda.aggregate({
            _sum: {
                valorTotal: true,
                pesoTotal: true
            },
            where: {
                dataVenda: {
                    gte: dataAbertura,
                }
            }
        });
        const receitaTotal = vendas._sum.valorTotal?.toNumber() ?? 0;
        const pesoVendido = vendas._sum.pesoTotal ?? 0;

        // 2. Despesa (Compras) e Peso Comprado
        const compras = await prisma.compra.aggregate({
            _sum: {
                valorTotal: true,
                pesoTotal: true
            },
            where: {
                dataCompra: {
                    gte: dataAbertura,
                }
            }
        });
        const despesaTotal = compras._sum.valorTotal?.toNumber() ?? 0;
        const pesoComprado = compras._sum.pesoTotal ?? 0;

        // 3. Lucro
        const lucroTotal = receitaTotal - despesaTotal;

        // 4. Buscar Transações (Vendas e Compras)
        const listaVendas = await prisma.venda.findMany({
            where: {
                dataVenda: { gte: dataAbertura }
            },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            },
            orderBy: { dataVenda: 'desc' }
        });

        const listaCompras = await prisma.compra.findMany({
            where: {
                dataCompra: { gte: dataAbertura }
            },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            },
            orderBy: { dataCompra: 'desc' }
        });

        // Unificar e formatar transações
        const transacoes = [
            ...listaVendas.map(v => {
                const produtoNome = v.itens.length > 0 ? v.itens[0].produto.name : 'Produto desconhecido';
                const maisItens = v.itens.length > 1 ? ` + ${v.itens.length - 1} outros` : '';
                return {
                    id: v.id,
                    tipo: 'Venda',
                    valor: v.valorTotal.toNumber(),
                    data: v.dataVenda,
                    descricao: `${produtoNome}${maisItens}`
                };
            }),
            ...listaCompras.map(c => {
                const produtoNome = c.itens.length > 0 ? c.itens[0].produto.name : 'Produto desconhecido';
                const maisItens = c.itens.length > 1 ? ` + ${c.itens.length - 1} outros` : '';
                return {
                    id: c.id,
                    tipo: 'Compra',
                    valor: c.valorTotal.toNumber(),
                    data: c.dataCompra,
                    descricao: `${produtoNome}${maisItens}`
                };
            })
        ].sort((a, b) => b.data.getTime() - a.data.getTime());

        // Retornar o caixa com os valores calculados
        return {
            ...caixa,
            receita: receitaTotal,
            despesa: despesaTotal,
            lucro: lucroTotal,
            pesoVendido,
            pesoComprado,
            transacoes,
            numTransacoes: listaVendas.length + listaCompras.length,
        };
    },

    // Função para fechar o caixa, calcular transações entre abertura e fechamento
    fecharCaixa: async (caixaId: number) => {
        const caixa = await caixaRepository.findById(caixaId);
        if (!caixa) {
            throw new Error("Caixa não encontrado.");
        }

        const dataFechamento = new Date();
        const dataAbertura = caixa.dataCaixaAbertura;

        // 1. Calcular a Receita (Vendas)
        const vendas = await prisma.venda.aggregate({
            _sum: { valorTotal: true },
            _count: true,
            where: {
                dataVenda: {
                    gte: dataAbertura,
                    lte: dataFechamento,
                }
            }
        });

        const receitaTotal = vendas._sum.valorTotal?.toNumber() ?? 0;
        const numVendas = vendas._count;

        // 2. Calcular a Despesa (Compras)
        const compras = await prisma.compra.aggregate({
            _sum: { valorTotal: true },
            _count: true,
            where: {
                dataCompra: {
                    gte: dataAbertura,
                    lte: dataFechamento,
                }
            }
        });

        const despesaTotal = compras._sum.valorTotal?.toNumber() ?? 0;
        const numCompras = compras._count;

        // 3. Calcular Lucro e Transações
        const lucroTotal = receitaTotal - despesaTotal;
        const numTransacoes = numVendas + numCompras;

        // 4. Atualizar o caixa no DB (Fechamento)
        const caixaFechado = await caixaRepository.update(caixaId, {
            dataCaixaFechamento: dataFechamento,
            receita: new Prisma.Decimal(receitaTotal),
            despesa: new Prisma.Decimal(despesaTotal),
            lucro: new Prisma.Decimal(lucroTotal),
            numTransacoes: numTransacoes,
        });

        return {
            message: "Caixa fechado com sucesso.",
            caixa: caixaFechado,
        };
    }
}