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
import { toast } from "sonner";


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
        toast.success("Produto deletado com sucesso!");
      fetchProducts();
    } else {
      const error = await response.json();
      toast.error("Erro ao deletar: " + error.message);
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
        toast.success("Produto atualizado com sucesso!");
      fetchProducts();
      setEditProduct(null);
    } else {
      const error = await response.json();
      toast.error("Erro ao atualizar: " + error.message);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestão de Estoque</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Controle de materiais, categorias e precificação</p>
        </div>
        <button
          onClick={() => setShowProductForm(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-50 active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span>Cadastrar Novo</span>
        </button>
      </div>

      {showProductForm && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
             <h3 className="text-xl font-black text-gray-900">Novo Material</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nome */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Nome do Material</label>
                <input
                  type="text"
                  placeholder="Ex: Alumínio Grosso"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Metais"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
              </div>

              {/* Estoque Inicial */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Estoque Inicial (kg)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>

              {/* Preço Compra */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-red-500 uppercase tracking-widest">Preço Compra (R$/kg)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full h-12 bg-red-50/30 border border-red-100 rounded-xl px-4 text-sm font-bold focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                  value={newProduct.pricePerKgCompra}
                  onChange={(e) => setNewProduct({ ...newProduct, pricePerKgCompra: e.target.value })}
                />
              </div>

              {/* Preço Venda */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-green-500 uppercase tracking-widest">Preço Venda (R$/kg)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full h-12 bg-green-50/30 border border-green-100 rounded-xl px-4 text-sm font-bold focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all"
                  value={newProduct.pricePerKgVenda}
                  onChange={(e) => setNewProduct({ ...newProduct, pricePerKgVenda: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button
                onClick={() => setShowProductForm(false)}
                className="h-12 px-6 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
              >
                Descartar
              </button>
              <button
                onClick={handleCreateProduct}
                className="h-12 px-8 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-50"
              >
                Salvar Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Inventário de Materiais</h3>
          <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-black text-gray-500">
            {products.length} ITENS CADASTRADOS
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque Atual</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço Compra</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço Venda</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{product.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {product.stock.toLocaleString('pt-BR')} kg
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">
                    R$ {(product.pricePerKgCompra ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    R$ {(product.pricePerKgVenda ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="h-9 w-9 inline-flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteProductId(product.id)}
                        className="h-9 w-9 inline-flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG DE EDIÇÃO */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-none">
          <div className="p-8 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Editar Material</h3>
              <p className="text-sm font-medium text-gray-500">Atualize os parâmetros e preços do item</p>
            </div>

            {editProduct && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome</label>
                  <input
                    type="text"
                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
                  <input
                    type="text"
                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">P. Compra (R$/kg)</label>
                  <input
                    type="number"
                    className="w-full h-12 bg-red-50/30 border border-red-100 rounded-xl px-4 text-sm font-bold focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                    value={editProduct.pricePerKgCompra}
                    onChange={(e) => setEditProduct({ ...editProduct, pricePerKgCompra: Number(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-500 uppercase tracking-widest">P. Venda (R$/kg)</label>
                  <input
                    type="number"
                    className="w-full h-12 bg-green-50/30 border border-green-100 rounded-xl px-4 text-sm font-bold focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all"
                    value={editProduct.pricePerKgVenda}
                    onChange={(e) => setEditProduct({ ...editProduct, pricePerKgVenda: Number(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque em KG</label>
                  <input
                    type="number"
                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setEditProduct(null)}
                className="flex-1 h-14 rounded-2xl font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleUpdateProduct}
                className="flex-1 h-14 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE ALERT */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent className="rounded-3xl p-8 border-none scroll-m-0 overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-2xl font-black text-gray-900">Excluir Material?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 font-medium">
                Esta ação é irreversível. O material será removido permanentemente de todos os registros e inventários.
              </AlertDialogDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl border-gray-100 font-bold hover:bg-gray-50" onClick={() => setDeleteProductId(null)}>
              Manter Produto
            </AlertDialogCancel>
            <AlertDialogAction 
              className="h-14 flex-1 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-xl shadow-red-50"
              onClick={confirmDeleteProduct}
            >
              Sim, Excluir
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}