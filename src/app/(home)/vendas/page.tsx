"use client";
import { Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { VendaData } from "@/types"; 

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
        if (!response.ok) throw new Error("Falha ao carregar produtos do servidor.");
        const data: Product[] = await response.json();
        
        const productsFormatted: Product[] = data.map(p => ({
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
                subtotal: (item.weight + initialWeight) * price,
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product,
          weight: initialWeight,
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
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 3. Função de Finalização Atualizada para enviar ao Backend
  const finalizeSale = async () => {
    if (saleItems.length === 0) return;

    const vendaData: VendaData = {
        clientId: selectedClientId,
        dataVenda: new Date(),
        totalItens: saleItems.length,
        pesoTotal: saleItems.reduce((sum, item) => sum + item.weight, 0),
        valorTotal: getTotalSale(),
        itens: saleItems.map(item => ({
            produtoId: item.product.id,
            peso: item.weight,
            precoKg: item.product.pricePerKgVenda ?? 0,
            subtotal: item.subtotal
        }))
    };
    
    try {
        const response = await fetch("/api/vendas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vendaData),
        });

        if (response.ok) {
            alert("Venda registrada com sucesso!");
            setSaleItems([]);
            setSelectedClientId(null); // Limpa o cliente após a venda
            // Poderia recarregar os produtos aqui para atualizar o estoque
        } else {
            const error = await response.json();
            alert(`Erro ao finalizar venda: ${error.error}`);
        }
    } catch (error) {
        console.error("Erro na comunicação com a API:", error);
        alert("Erro de comunicação ao finalizar venda.");
    }
  };

  const removeFromSale = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.product.id !== productId));
  };
  
  const updateSaleItemWeight = (productId: number, newWeight: number) => {
    setSaleItems(
      saleItems.map((item) => {
          if (item.product.id === productId) {
              const price = item.product.pricePerKgVenda ?? 0;
              return {
                  ...item,
                  weight: newWeight,
                  subtotal: newWeight * price,
              };
          }
          return item;
      })
    );
  };

  // --------------------------------------------------------
  // 4. Renderização com Seletor de Cliente Único na Comanda
  // --------------------------------------------------------
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
      {/* Lista de Produtos */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Nova Venda</h2>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.length === 0 && (
              <p className="col-span-2 text-center text-gray-500">
                Carregando produtos ou nenhum produto encontrado.
              </p>
          )}
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {product.stock.toFixed(2)} kg
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xl font-bold text-blue-600">
                  R$ {(product.pricePerKgVenda ?? 0).toFixed(2)}/kg
                </span>
                <button
                  onClick={() => addToSale(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={product.stock <= 0}
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comanda */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-6">
          <h3 className="text-xl font-bold mb-4">Comanda</h3>
          {saleItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum item adicionado
            </p>
          ) : (
            <>
              {/* NOVO: SELECT DE CLIENTE ACIMA DOS ITENS */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Associar Cliente à Venda (Opcional)
                </label>
                <select
                    value={selectedClientId ?? ""}
                    onChange={(e) => setSelectedClientId(Number(e.target.value) || null)}
                    className="w-full border rounded px-3 py-2 text-sm"
                >
                    <option value="">Venda Avulsa (Sem Cliente)</option>
                    {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.name} ({client.cpf})
                    </option>
                    ))}
                </select>
                {!selectedClientId && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <span className="font-semibold">⚠️ Venda Avulsa:</span> Nenhum cliente associado
                  </p>
                )}
              </div>
              
              <div className="space-y-3 mb-4 max-h-96 overflow-auto">
                {saleItems.map((item) => (
                  <div key={item.product.id} className="border-b pb-3">
                    
                    {/* REMOVIDO: O select do cliente que estava aqui dentro do loop */}
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{item.product.name}</span>
                      <button
                        onClick={() => removeFromSale(item.product.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="number"
                        value={item.weight}
                        onChange={(e) =>
                          updateSaleItemWeight(
                            item.product.id,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 border rounded px-2 py-1 text-sm"
                        min="0"
                        step="0.1"
                      />
                      <span className="text-sm text-gray-600">
                        kg × R$ {(item.product.pricePerKgVenda ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right font-bold text-blue-600">
                      R$ {item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {getTotalSale().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={finalizeSale}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold transition-colors"
                  disabled={saleItems.length === 0}
                >
                  Finalizar Venda
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}