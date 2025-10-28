import { ClientData } from "@/types";
import { clientRepository } from "./client.repository";

export const clientService = {
  getAll: async () => {
    return await clientRepository.findAll();
  },

  getById: async (id: number) => {
    const client = await clientRepository.findById(id);
    if (!client) throw new Error("Cliente não encontrado");
    return client;
  },

  create: async (data: ClientData) => {
    if (!data.name) throw new Error("Dados inválidos");
    const client = await clientRepository.create(data);
    return {
      message: "Cliente criado com sucesso",
      client,
    };
  },

  update: async (id: number, data: ClientData) => {
    return await clientRepository.update(id, data);
  },

  delete: async (id: number) => {
    return await clientRepository.delete(id);
  }, 
};
