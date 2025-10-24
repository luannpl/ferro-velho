"use client";
import React, { useState } from "react";
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
  const [products, setProducts] = useState<Product[]>([
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
            />
            <input
              type="text"
              placeholder="Categoria"
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Preço por kg"
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex w-full justify-end space-x-3 mt-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
              Salvar
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
