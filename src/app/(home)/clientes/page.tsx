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
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  idade: number;
  email: string;
  telefone: string;
  cpf: string;
}

export default function ClientePage() {
  const [showClientForm, setShowClientForm] = useState(false)
  const [client, setClient] = useState<Client[]>([])
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)

  const [newClient, setNewClient] = useState({
    name: "",
    idade: "" as string | number,
    email: "",
    telefone: "",
    cpf: ""
  })

  const fetchClient = async () => {
    const response = await fetch('/api/client');
    const data = await response.json()
    setClient(data)
  }

  useEffect(() => {
    fetchClient()
  }, [])

  const handlerCreateClient = async () => {
    const clientToSend = {
      ...newClient,
      idade: Number(newClient.idade) || 0
    }

    const response = await fetch("/api/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientToSend)
    })

    if (response.ok) {
      fetchClient();
      setShowClientForm(false)
      setNewClient({ name: "", idade: "", email: "", telefone: "", cpf: "" })
    }
  }

  const confirmDeleteClient = async () => {
    if (!deleteClientId) return;

    const response = await fetch(`/api/client/${deleteClientId}`, {
      method: "DELETE",
    });

    if (response.ok) {
        toast.success("Cliente deletado com sucesso!");
      fetchClient();
    } else {
      const error = await response.json();
      toast.error("Erro ao deletar: " + error.message);
    }

    setDeleteClientId(null);
  };

  const handleUpdateClient = async () => {
    if (!editClient) return;

    const response = await fetch(`/api/client/${editClient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editClient),
    });

    if (response.ok) {
        toast.success("Cliente atualizado com sucesso!");
      fetchClient();
      setEditClient(null);
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Base de Clientes</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Gerenciamento de fornecedores e compradores</p>
        </div>
        <button
          onClick={() => setShowClientForm(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-50 active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      {showClientForm && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
             <h3 className="text-xl font-black text-gray-900">Cadastrar Cliente/Fornecedor</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Completo</label>
                <input type="text" placeholder="Nome" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Idade</label>
                <input type="number" placeholder="Idade" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newClient.idade} onChange={(e) => setNewClient({ ...newClient, idade: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                <input type="text" placeholder="(85) 9..." className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newClient.telefone} onChange={(e) => setNewClient({ ...newClient, telefone: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF / CNPJ</label>
                <input type="text" placeholder="000.000.000-00" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newClient.cpf} onChange={(e) => setNewClient({ ...newClient, cpf: e.target.value })} />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
                <input type="text" placeholder="cliente@exemplo.com" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
              <button onClick={() => setShowClientForm(false)}
                className="h-12 px-6 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">Cancelar</button>
              <button onClick={handlerCreateClient}
                className="h-12 px-10 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-50">Salvar Cadastro</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Lista Geral</h3>
          <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-black text-gray-500 uppercase tracking-widest">
            {client.length} Clientes
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contato</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {client.map((clientItem) => (
                <tr key={clientItem.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{clientItem.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{clientItem.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-600">{clientItem.cpf}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{clientItem.telefone}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <button
                        onClick={() => setEditClient(clientItem)}
                        className="h-9 w-9 inline-flex items-center justify-center hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteClientId(clientItem.id)}
                        className="h-9 w-9 inline-flex items-center justify-center hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
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
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-none">
          <div className="p-8 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Editar Cadastro</h3>
              <p className="text-sm font-medium text-gray-500">Atualize os dados pessoais do cliente</p>
            </div>

            {editClient && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome</label>
                  <input type="text" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Idade</label>
                  <input type="number" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editClient.idade} onChange={(e) => setEditClient({ ...editClient, idade: Number(e.target.value) })} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone</label>
                  <input type="text" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editClient.telefone} onChange={(e) => setEditClient({ ...editClient, telefone: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPF</label>
                  <input type="text" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editClient.cpf} onChange={(e) => setEditClient({ ...editClient, cpf: e.target.value })} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
                  <input type="text" className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    value={editClient.email} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setEditClient(null)}
                className="flex-1 h-14 rounded-2xl font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all">Cancelar</button>
              <button
                onClick={handleUpdateClient}
                className="flex-1 h-14 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95">Salvar Alterações</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG */}
      <AlertDialog open={deleteClientId !== null} onOpenChange={(open) => !open && setDeleteClientId(null)}>
        <AlertDialogContent className="rounded-3xl p-8 border-none scroll-m-0 overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-2xl font-black text-gray-900">Remover Cliente?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 font-medium">
                Esta ação enviará o registro para o arquivo permanente. O cliente perderá acesso a créditos e históricos vinculados.
              </AlertDialogDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl border-gray-100 font-bold hover:bg-gray-50" onClick={() => setDeleteClientId(null)}>Manter Registro</AlertDialogCancel>
            <AlertDialogAction 
              className="h-14 flex-1 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-xl shadow-red-50"
              onClick={confirmDeleteClient}>Sim, Remover</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
