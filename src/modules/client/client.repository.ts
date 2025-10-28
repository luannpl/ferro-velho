import { prisma } from "@/lib/prisma";
import { ClientData } from "@/types";
import { Client } from "@prisma/client";

export const clientRepository = {
  findAll: () => prisma.client.findMany(),
  findById: (id: number) => prisma.client.findUnique({ where: { id } }),
  create: (data: ClientData) => prisma.product.create({ data }),
  update: (id: number, data: Partial<Client>) =>
    prisma.product.update({ where: { id }, data }),
  delete: (id: number) => prisma.product.delete({ where: { id } }),
};
