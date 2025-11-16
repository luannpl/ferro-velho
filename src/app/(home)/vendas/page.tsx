"use client";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";

interface SaleItem {
  product: Product;
  quantity: number;
  weight: number;
  subtotal: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
  stock: number;
}

export default function VendasPage() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Ferro",
      category: "Metais",
      weight: 150,
      pricePerKg: 2.5,
      stock: 150,
    },
    {
      id: 2,
      name: "Alumínio",
      category: "Metais",
      weight: 80,
      pricePerKg: 5.8,
      stock: 80,
    },
    {
      id: 3,
      name: "Cobre",
      category: "Metais",
      weight: 45,
      pricePerKg: 25.0,
      stock: 45,
    },
  ]);

  const addToSale = (product: Product) => {
    const existing = saleItems.find((item) => item.product.id === product.id);
    if (existing) {
      setSaleItems(
        saleItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                weight: item.weight + 1,
                quantity: item.quantity + 1,
                subtotal: (item.weight + 1) * product.pricePerKg,
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product,
          quantity: 1,
          weight: 1,
          subtotal: product.pricePerKg,
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

  const finalizeSale = () => {
    alert(`Venda finalizada! Total: R$ ${getTotalSale().toFixed(2)}`);
    setSaleItems([]);
  };
  const removeFromSale = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.product.id !== productId));
  };
  const updateSaleItemWeight = (productId: number, newWeight: number) => {
    setSaleItems(
      saleItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              weight: newWeight,
              subtotal: newWeight * item.product.pricePerKg,
            }
          : item
      )
    );
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Produtos */}
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold mb-6">Nova Venda</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {product.stock} kg
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xl font-bold text-blue-600">
                  R$ {product.pricePerKg.toFixed(2)}/kg
                </span>
                <button
                  onClick={() => addToSale(product)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
        <div className="bg-white rounded-lg shadow p-4 sticky top-6">
          <h3 className="text-xl font-bold mb-4">Comanda</h3>
          {saleItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum item adicionado
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-96 overflow-auto">
                {saleItems.map((item) => (
                  <div key={item.product.id} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{item.product.name}</span>
                      <button
                        onClick={() => removeFromSale(item.product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
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
                        kg × R$ {item.product.pricePerKg.toFixed(2)}
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
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold"
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
