import {prisma} from "@/lib/prisma";
import {CaixaData} from "@/types";
import {Caixa} from "@prisma/client";

export const caixaRepository = {
    findAll: () => prisma.caixa.findMany(),
    findById: (id: number) => prisma.caixa.findUnique({where: {id}}),
    create: (data: CaixaData) => prisma.caixa.create({data}),
    update: (id: number, data: Partial<Caixa>) => 
        prisma.caixa.update({where: {id}, data}),
    delete: (id: number) => prisma.caixa.delete({where: {id}}),
}