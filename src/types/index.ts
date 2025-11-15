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

export type CompraItem = {
  productId: number;
  quantity: number;
  pricePerKg: number;
  subtotal: number;
};

export type CompraData = {
  fornecedorId: number;
  totalItens: number;
  pesoTotal: number;
  valorTotal: number;
  dataCompra: Date;
  items: CompraItem[];
};
