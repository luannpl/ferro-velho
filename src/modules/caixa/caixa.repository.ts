import {prisma} from "@/lib/prisma";
import {CaixaData} from "@/types";
import {Caixa} from "@prisma/client";

export const caixaRepository = {
    findAll: () => prisma.caixa.findMany(),
    findHistory: (page: number = 1, limit: number = 5) => prisma.caixa.findMany({
        where: { dataCaixaFechamento: { not: null } },
        orderBy: { dataCaixaFechamento: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
    }),

    countHistory: () => prisma.caixa.count({
        where: { dataCaixaFechamento: { not: null } }
    }),
    findById: (id: number) => prisma.caixa.findUnique({where: {id}}),
    create: (data: CaixaData) => prisma.caixa.create({data}),
    update: (id: number, data: Partial<Caixa>) => 
        prisma.caixa.update({where: {id}, data}),
    delete: (id: number) => prisma.caixa.delete({where: {id}}),
}