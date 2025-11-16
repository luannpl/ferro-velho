export type ProductData = {
  id: number;
  name: string;
  category: string;
  pricePerKg: number;
  stock: number;
};

export type ClientData = {
  id: number;
  name: string;
  idade: number;
  email: string;
  telefone: string;
  cpf: string;
};

export type FornecedorData = {
  id: number;
  name: string;
  telefone?: string;
  email?: string;
};

export type CompraData = {
  id: number;
  fornecedorId: number;
  totalItens: number;
  pesoTotal: number;
  valorTotal: number;
  dataCompra: Date;
  itens: {
    produtoId: number;
    peso: number;
    precoKg: number;
    subtotal: number;
  }[];
};
