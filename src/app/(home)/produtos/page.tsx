"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


interface Product {
  id: number;
  name: string;
  category: string;
  weight: number;
  pricePerKgCompra: number;
  pricePerKgVenda: number;
  stock: number;
}

export default function ProdutosPage() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    pricePerKgCompra: "" as string | number, 
    pricePerKgVenda: "" as string | number, 
    stock: "" as string | number, 
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
      pricePerKgCompra: Number(newProduct.pricePerKgCompra) || 0,
      pricePerKgVenda: Number(newProduct.pricePerKgVenda) || 0,
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
        pricePerKgCompra: "", // Resetar para string vazia
        pricePerKgVenda: "", // Resetar para string vazia
        stock: "", // Resetar para string vazia
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;

    const response = await fetch(`/api/products/${deleteProductId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchProducts();
    } else {
      const error = await response.json();
      alert("Erro ao deletar: " + error.message);
    }

    setDeleteProductId(null);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    const response = await fetch(`/api/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editProduct),
    });

    if (response.ok) {
      fetchProducts();
      setEditProduct(null);
    } else {
      const error = await response.json();
      alert("Erro ao atualizar: " + error.message);
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
            {/* Nome do produto */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Nome do produto
              </label>
              <input
                type="text"
                placeholder="Ex: Geladeira"
                className="border rounded px-3 py-2"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>

            {/* Categoria */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                placeholder="Ex: Metal"
                className="border rounded px-3 py-2"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
            </div>

            {/* Preço por kg */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Preço por kg compra (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 9.90"
                className="border rounded px-3 py-2"
                value={newProduct.pricePerKgCompra}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    pricePerKgCompra: e.target.value, // Mantém como string
                  })
                }
              />
            </div>

            {/* Preço por kg */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Preço por kg venda (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 9.90"
                className="border rounded px-3 py-2"
                value={newProduct.pricePerKgVenda}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    pricePerKgVenda: e.target.value, // Mantém como string
                  })
                }
              />
            </div>

            {/* Estoque */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Estoque (kg)
              </label>
              <input
                type="number"
                placeholder="Ex: 50"
                className="border rounded px-3 py-2"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: e.target.value, // Mantém como string
                  })
                }
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex w-full justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowProductForm(false)}
              className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateProduct}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
            >
              Cadastrar
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
                Preço/kg compra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Preço/kg venda
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
                  R$ {(product.pricePerKgCompra ?? 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {(product.pricePerKgVenda ?? 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditProduct(product)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteProductId(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* DIALOG DE EDIÇÃO */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Altere as informações e clique em “Salvar”.</DialogDescription>
          </DialogHeader>

          {editProduct && (
            <div className='grid grid-cols-2 gap-4'>
              <div>Nome: </div>
              <input type="text" placeholder="Nome" className="border rounded px-3 py-2"
                value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
              
              <div>Categoria: </div>
              <input type="text" placeholder="Categoria" className="border rounded px-3 py-2"
                value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} />
              
              <div>Preço por kg compra: </div>
              <input type="number" placeholder="Preço por kg compra" className="border rounded px-3 py-2"
                value={editProduct.pricePerKgCompra} onChange={(e) => setEditProduct({ ...editProduct, pricePerKgCompra: Number(e.target.value) })} />
              
              <div>Preço por kg venda: </div>
              <input type="number" placeholder="Preço por kg venda" className="border rounded px-3 py-2"
                value={editProduct.pricePerKgVenda} onChange={(e) => setEditProduct({ ...editProduct, pricePerKgVenda: Number(e.target.value) })} />
              
              <div>Quantidade no Estoque: </div>
              <input type="number" placeholder="Quantidade no Estoque" className="border rounded px-3 py-2"
                value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setEditProduct(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            <button
              onClick={handleUpdateProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O produto será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteProductId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}