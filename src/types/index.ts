export type ProductData = {
  id: number;
  name: string;
  category: string;
  pricePerKgCompra: number;
  pricePerKgVenda: number;
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

export type ItemCompraData = {
  produtoId: number;
  peso: number;
  precoKg: number;
  subtotal: number;
}

export type CompraData = {
  fornecedorId: number;
  totalItens: number;
  pesoTotal: number;
  valorTotal: number;
  dataCompra: Date;
  itens: ItemCompraData[];
};

export interface CompraResponseItem {
  id: number;
  fornecedorId: number;
  dataCompra: string; // vem como string no JSON
  totalItens: number;
  pesoTotal: string;  // vem como string no JSON
  valorTotal: string; // vem como string no JSON
}

export interface CompraDataResponse {
  message: string;
  compra: CompraResponseItem;
}


export type VendaData = {
  clientId: number;
  dataVenda: Date;
  totalItens: number;
  pesoTotal: number;
  valorTotal: number;
  itens: ItemVendaData[];
}

export type ItemVendaData = {
  produtoId: number;
  peso: number;
  precoKg: number;
  subtotal: number;
}

export type Dashboard = {
  totalProducts: number;
  totalInStock: number;
  salesToday: number;
}