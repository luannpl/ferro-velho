"use client";
import { Search, Trash2, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { VendaData } from "@/types";
import { toast } from "sonner";

// --- Interfaces Atualizadas ---

interface Product {
  id: number;
  name: string;
  category: string;
  pricePerKgVenda: number | null;
  stock: number;
}

interface Client {
  id: number;
  name: string;
  cpf: string;
  telefone: string;
}

interface SaleItem {
  product: Product;
  weight: number;
  price: number;
  subtotal: number;
}

export default function VendasPage() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  // Novos estados para Cliente
  const [clients, setClients] = useState<Client[]>([]);
  // O cliente ID 0 pode ser usado para 'Venda Avulsa', mas precisa existir no seu DB ou ser tratado
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // --------------------------------------------------------
  // 1. Efeitos para buscar Produtos e Clientes na inicialização
  // --------------------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      // Lógica de busca de produtos (já estava correta)
      try {
        const response = await fetch("/api/products");
        if (!response.ok)
          throw new Error("Falha ao carregar produtos do servidor.");
        const data: Product[] = await response.json();

        const productsFormatted: Product[] = data.map((p) => ({
          ...p,
          pricePerKgVenda: p.pricePerKgVenda ?? 0,
          stock: p.stock ?? 0,
        }));
        setProducts(productsFormatted);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    const fetchClients = async () => {
      // Lógica de busca de clientes
      try {
        const response = await fetch("/api/client"); // Endpoint criado no Passo 1
        if (!response.ok) throw new Error("Falha ao carregar clientes.");
        const data: Client[] = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchProducts();
    fetchClients();
  }, []);

  // --------------------------------------------------------
  // 2. Lógica de Venda
  // --------------------------------------------------------
  const addToSale = (product: Product) => {
    const initialWeight = 0.1;
    const price = product.pricePerKgVenda ?? 0;

    const existing = saleItems.find((item) => item.product.id === product.id);

    if (existing) {
      setSaleItems(
        saleItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                weight: item.weight + initialWeight,
                subtotal: (item.weight + initialWeight) * item.price,
              }
            : item,
        ),
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product,
          weight: initialWeight,
          price: price,
          subtotal: initialWeight * price,
        },
      ]);
    }
  };

  const getTotalSale = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Adicionando as tipagens nos parâmetros da função
  const imprimirCupomVenda = (
    vendaId: number | string,
    dadosVenda: SaleItem[],
    cliente: Client | undefined | null,
  ) => {
    const dataFormatada = new Date()
      .toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");

    const cupomHTML = `
<html>
  <head>
    <meta charset="utf-8">
    <style>
      @page { 
        size: 80mm auto; 
        margin: 0; 
      }
      body { 
        font-family: 'Courier New', monospace; 
        width: 72mm; 
        margin: 0 auto; 
        padding: 10px 0 30px 0; 
        color: #000; 
        font-size: 13px; /* Aumentado levemente */
        line-height: 1.3; 
        font-weight: bold; 
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .logo-box { border: 2px solid #000; padding: 6px 10px; margin: 0 auto 12px auto; width: fit-content; display: inline-block; border-radius: 4px; }
      .recycle-icon { font-size: 24px; display: block; margin-bottom: 2px; }
      .titulo-loja { font-size: 14px; font-weight: bold; margin: 0; }
      .box-mensagem { border: 1px solid #000; background: #f3f3f3; padding: 8px 4px; margin: 10px 0; font-size: 12px; border-radius: 4px; }
      
      .info-linha { display: flex; justify-content: space-between; margin: 3px 0; }
      
      table { width: 100%; border-collapse: collapse; margin: 10px 0; table-layout: fixed; }
      th { border-bottom: 2px solid #000; border-top: 2px solid #000; padding: 5px 0; font-size: 12px; }
      
      td { 
        padding: 6px 0; 
        vertical-align: top; /* Mantém os números no topo se o nome quebrar linha */
        word-wrap: break-word;
        font-size: 13px;
      }

      /* Larguras ajustadas para dar prioridade ao KG e Total */
      .col-desc  { width: 38%; text-align: left; padding-right: 3px; }
      .col-preco { width: 18%; text-align: center; }
      .col-kg    { width: 22%; text-align: center; } /* Coluna KG maior */
      .col-total { width: 22%; text-align: right; }

      .linha-separadora { border-top: 2px solid #000; margin: 8px 0; }
      .total-principal { font-size: 20px; margin: 10px 0; display: flex; justify-content: space-between; }
      .footer { margin-top: 25px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="center">
      <div class="logo-box">
        <span class="recycle-icon">♻</span>
        <div class="titulo-loja">OR OSVALDO RECICLAGENS LTDA</div>
      </div>
      <div style="font-size: 11px;">Rua Tenente João Albano N° 106 - Aerolândia</div>
      <div style="font-size: 11px;">Fone: (85) 99156-6566</div>
    </div>

    <div class="box-mensagem center">
      <div class="bold">COMPROVANTE DE VENDA</div>
    </div>

    <div class="info-pedido">
      <div class="info-linha"><span>Pedido:</span> <span>#${vendaId}</span></div>
      <div class="info-linha"><span>Cliente:</span> <span>${cliente?.name || "VENDA AVULSA"}</span></div>
      <div class="info-linha"><span>Data:</span> <span>${dataFormatada}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="col-desc">Desc.</th>
          <th class="col-preco">Preço</th>
          <th class="col-kg">KG</th>
          <th class="col-total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${dadosVenda
          .map(
            (item: SaleItem) => `
          <tr>
            <td class="col-desc">${item.product.name}</td>
            <td class="col-preco">${(item.price || 0).toFixed(2)}</td>
            <td class="col-kg">${item.weight.toFixed(3)}</td>
            <td class="col-total">${item.subtotal.toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="linha-separadora"></div>
    <div class="total-linha total-principal">
      <span>TOTAL</span>
      <span>R$ ${dadosVenda.reduce((acc: number, i: SaleItem) => acc + i.subtotal, 0).toFixed(2)}</span>
    </div>

    <div class="center footer">
      <div class="bold">Ⓒ PRSystem Solutions</div>
      <div>(85) 92164-4075</div>
    </div>
  </body>
</html>`;

    const win = window.open("", "_blank", "width=400,height=600");
    if (win) {
      win.document.write(cupomHTML);
      win.document.close();
      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  const finalizeSale = async () => {
    if (saleItems.length === 0) return;

    const vendaData: VendaData = {
      clientId: selectedClientId,
      dataVenda: new Date(),
      totalItens: saleItems.length,
      pesoTotal: saleItems.reduce((sum, item) => sum + item.weight, 0),
      valorTotal: getTotalSale(),
      itens: saleItems.map((item) => ({
        produtoId: item.product.id,
        peso: item.weight,
        precoKg: item.price,
        subtotal: item.subtotal,
      })),
    };

    try {
      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendaData),
      });

      const result = await response.json();

      if (response.ok) {
        // AJUSTE AQUI: Verifique se o ID vem em result.id ou result.venda.id
        const idFinal = result.venda?.id || result.id || "N/A";

        const clienteSelecionado = clients.find(
          (c) => c.id === selectedClientId,
        );

        // Dispara a impressão
        imprimirCupomVenda(idFinal, saleItems, clienteSelecionado);

        toast.success("Venda registrada com sucesso!");
        setSaleItems([]);
        setSelectedClientId(null);
      } else {
        toast.error(
          `Erro ao finalizar venda: ${result.error || "Erro desconhecido"}`,
        );
      }
    } catch (error) {
      console.error("Erro na comunicação com a API:", error);
      toast.error("Erro de comunicação ao finalizar venda.");
    }
  };

  const removeFromSale = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.product.id !== productId));
  };

  const updateSaleItemWeight = (productId: number, newWeight: number) => {
    setSaleItems(
      saleItems.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            weight: newWeight,
            subtotal: newWeight * item.price,
          };
        }
        return item;
      }),
    );
  };

  const updateSaleItemPrice = (productId: number, newPrice: number) => {
    setSaleItems(
      saleItems.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            price: newPrice,
            subtotal: item.weight * newPrice,
          };
        }
        return item;
      }),
    );
  };

  // --------------------------------------------------------
  // 4. Renderização com Seletor de Cliente Único na Comanda
  // --------------------------------------------------------
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vendas</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Registre as vendas de materiais</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 items-center px-4 h-12">
          <Package className="text-blue-500 mr-2" size={20} />
          <span className="text-sm font-bold text-gray-700">{products.length} Produtos em Estoque</span>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        {/* Lista de Produtos Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Pesquisar por nome ou categoria de material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl transition-all outline-none text-gray-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.length === 0 ? (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-400 font-medium">Sincronizando estoque...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
               <div className="col-span-2 py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200">
                <Search size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">Nenhum produto encontrado para "{searchTerm}"</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-right">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {product.stock.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Preço Unitário</p>
                      <span className="text-2xl font-black text-gray-900">
                        R$ {(product.pricePerKgVenda ?? 0).toFixed(2)}
                        <span className="text-xs font-medium text-gray-400 ml-1">/kg</span>
                      </span>
                    </div>
                    <button
                      onClick={() => addToSale(product)}
                      disabled={product.stock <= 0}
                      className={`h-10 px-5 rounded-xl font-bold transition-all active:scale-95 ${
                        product.stock > 0 
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Selecionar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comanda / Carrinho Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden lg:sticky lg:top-8">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
               <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                 <Package className="text-blue-600" size={24} />
                 Carrinho
               </h3>
               <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 border border-blue-100">
                 {saleItems.length} itens
               </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Cliente (Opcional)
                </label>
                <div className="relative">
                  <select
                    value={selectedClientId ?? ""}
                    onChange={(e) =>
                      setSelectedClientId(Number(e.target.value) || null)
                    }
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 appearance-none outline-none transition-all"
                  >
                    <option value="">Venda Direta / Balcão</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {!selectedClientId && (
                  <p className="text-[10px] text-amber-600 font-bold bg-amber-50 rounded-lg p-2 mt-1">
                     Modo: Venda de Balcão (Sem cliente identificado)
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {saleItems.length === 0 ? (
                  <div className="py-10 text-center text-gray-300">
                    <Trash2 size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Carrinho vazio</p>
                  </div>
                ) : (
                  saleItems.map((item) => (
                    <div key={item.product.id} className="group p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                           <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.product.name}</p>
                           <p className="text-[10px] text-gray-400 font-medium">R$ {(item.product.pricePerKgVenda ?? 0).toFixed(2)} /kg</p>
                        </div>
                        <button
                          onClick={() => removeFromSale(item.product.id)}
                          className="h-8 w-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center bg-white border border-gray-100 rounded-xl px-2 py-1.5 shadow-sm flex-1">
                            <span className="text-[10px] font-black text-gray-400 ml-1">KG</span>
                             <input
                              type="number"
                              value={item.weight}
                              onChange={(e) =>
                                updateSaleItemWeight(
                                  item.product.id,
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-gray-900 p-0"
                              min="0.001"
                              step="0.1"
                            />
                          </div>

                          <div className="flex items-center bg-white border border-gray-100 rounded-xl px-2 py-1.5 shadow-sm flex-1">
                            <span className="text-[10px] font-black text-gray-400 ml-1">R$</span>
                             <input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                updateSaleItemPrice(
                                  item.product.id,
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-gray-900 p-0"
                              min="0.01"
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                          <p className="font-black text-gray-900">R$ {item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary & Actions */}
              {saleItems.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Geral</span>
                    <span className="text-3xl font-black text-green-600">
                      R$ {getTotalSale().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={finalizeSale}
                    className="w-full h-14 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-black text-lg transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Finalizar e Imprimir
                  </button>
                  <p className="text-[10px] text-gray-400 text-center font-bold">
                    ESTOQUE SERÁ DEDUZIDO AUTOMATICAMENTE
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
