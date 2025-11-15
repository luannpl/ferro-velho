'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
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

interface Compra {
  id: number;
  dataCompra: string;
  totalItens: number;
  pesoTotal: number;
  valorTotal: number;
  fornecedorId: number;
}

interface Fornecedor {
  id: number;
  name: string;
  email?: string | null;
  telefone?: string | null;
  createdAt: string;
  updatedAt: string;
  compras: Compra[];
}

export default function FornecedoresPage() {
  const [showForm, setShowForm] = useState(false)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editFornecedor, setEditFornecedor] = useState<Fornecedor | null>(null)

  const [newFornecedor, setNewFornecedor] = useState({
    name: "",
    email: "",
    telefone: "",
  })

  const fetchFornecedores = async () => {
    const response = await fetch('/api/fornecedores')
    const data = await response.json()
    setFornecedores(data)
  }

  useEffect(() => {
    fetchFornecedores()
  }, [])

  // 👉 FORMATAÇÃO DE TELEFONE
  const formatTelefone = (value: string): string => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    if (value.length > 10) {
      return value.replace(/(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    }
    if (value.length > 6) {
      return value.replace(/(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    }
    if (value.length > 2) {
      return value.replace(/(\d{2})(\d{0,5}).*/, "($1) $2");
    }
    return value.replace(/(\d{0,2}).*/, "($1");
  };

  // 👉 CRIAÇÃO
  const handlerCreateFornecedor = async () => {
    const response = await fetch("/api/fornecedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFornecedor)
    })

    if (response.ok) {
      fetchFornecedores()
      setShowForm(false)
      setNewFornecedor({ name: "", email: "", telefone: "" })
    }
  }

  // 👉 DELETE
  const confirmDeleteFornecedor = async () => {
    if (!deleteId) return

    const response = await fetch(`/api/fornecedores/${deleteId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      alert("Erro ao deletar: " + error.message)
    }

    fetchFornecedores()
    setDeleteId(null)
  }

  // 👉 UPDATE
  const handleUpdateFornecedor = async () => {
    if (!editFornecedor) return;

    const payload = {
      name: editFornecedor.name,
      email: editFornecedor.email,
      telefone: editFornecedor.telefone,
    };

    const response = await fetch(`/api/fornecedores/${editFornecedor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      fetchFornecedores();
      setEditFornecedor(null);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className="text-3xl font-bold">Fornecedores</h2>

        <button
          onClick={() => setShowForm(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700'
        >
          <Plus size={20} />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      {showForm && (
        <div className='bg-white p-6 rounded-lg shadow mb-6'>
          <h3 className='text-xl font-bold mb-4'>Cadastrar Fornecedor</h3>
          <div className='grid grid-cols-2 gap-4'>
            <input type="text" placeholder='Nome' className='border rounded px-3 py-2'
              value={newFornecedor.name}
              onChange={(e) => setNewFornecedor({ ...newFornecedor, name: e.target.value })}
            />

            <input type="text" placeholder="Telefone" className="border rounded px-3 py-2"
              value={newFornecedor.telefone}
              onChange={(e) => setNewFornecedor({
                ...newFornecedor,
                telefone: formatTelefone(e.target.value)
              })}
            />

            <input type="text" placeholder='Email' className='border rounded px-3 py-2 col-span-2'
              value={newFornecedor.email}
              onChange={(e) => setNewFornecedor({ ...newFornecedor, email: e.target.value })}
            />
          </div>

          <div className='flex justify-end space-x-3 mt-4'>
            <button onClick={handlerCreateFornecedor}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Criar</button>

            <button onClick={() => setShowForm(false)}
              className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500">Cancelar</button>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {fornecedores.map((f) => (
              <tr key={f.id}>
                <td className="px-6 py-4 whitespace-nowrap">{f.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{f.telefone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{f.email}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditFornecedor(f)}
                    className="text-blue-600 hover:text-blue-800 mr-3">
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => setDeleteId(f.id)}
                    className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={!!editFornecedor} onOpenChange={(open) => !open && setEditFornecedor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
            <DialogDescription>Altere as informações e clique em “Salvar”.</DialogDescription>
          </DialogHeader>

          {editFornecedor && (
            <div className='grid grid-cols-2 gap-4'>
              <input
                type="text"
                placeholder="Nome"
                className="border rounded px-3 py-2"
                value={editFornecedor.name}
                onChange={(e) =>
                  setEditFornecedor({ ...editFornecedor, name: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Telefone"
                className="border rounded px-3 py-2"
                value={editFornecedor.telefone || ""}
                onChange={(e) =>
                  setEditFornecedor({
                    ...editFornecedor,
                    telefone: formatTelefone(e.target.value)
                  })
                }
              />

              <input
                type="text"
                placeholder="Email"
                className="border rounded px-3 py-2 col-span-2"
                value={editFornecedor.email || ""}
                onChange={(e) =>
                  setEditFornecedor({ ...editFornecedor, email: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setEditFornecedor(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              Cancelar
            </button>

            <button
              onClick={handleUpdateFornecedor}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAR DELETE */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O fornecedor será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFornecedor}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
