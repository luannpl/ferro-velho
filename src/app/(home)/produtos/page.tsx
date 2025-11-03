"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
  stock: number;
}

export default function ProdutosPage() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    pricePerKg: "" as string | number, // Mudar para string inicialmente
    stock: "" as string | number, // Mudar para string inicialmente
  });

  const fetchProducts = async () => {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    // Converter para número antes de enviar
    const productToSend = {
      ...newProduct,
      pricePerKg: Number(newProduct.pricePerKg) || 0,
      stock: Number(newProduct.stock) || 0,
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productToSend),
    });

    if (response.ok) {
      fetchProducts();
      setShowProductForm(false);
      setNewProduct({
        name: "",
        category: "",
        pricePerKg: "", // Resetar para string vazia
        stock: "", // Resetar para string vazia
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Produtos</h2>
        <button
          onClick={() => setShowProductForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      {showProductForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-bold mb-4">Cadastrar Produto</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do produto"
              className="border rounded px-3 py-2"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Categoria"
              className="border rounded px-3 py-2"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Preço por kg"
              className="border rounded px-3 py-2"
              value={newProduct.pricePerKg}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  pricePerKg: e.target.value, // Manter como string
                })
              }
            />
            <input
              type="number"
              placeholder="Estoque"
              className="border rounded px-3 py-2"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock: e.target.value, // Manter como string
                })
              }
            />
          </div>
          <div className="flex w-full justify-end space-x-3 mt-4">
            <button
              onClick={handleCreateProduct}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
            >
              Criar
            </button>
            <button
              onClick={() => setShowProductForm(false)}
              className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estoque (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Preço/kg
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.stock} kg
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {product.pricePerKg.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">
                    <Edit2 size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}