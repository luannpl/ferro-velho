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
      fetchClient();
    } else {
      const error = await response.json();
      alert("Erro ao deletar: " + error.message);
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
      fetchClient();
      setEditClient(null);
    } else {
      const error = await response.json();
      alert("Erro ao atualizar: " + error.message);
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className="text-3xl font-bold">Clientes</h2>
        <button
          onClick={() => setShowClientForm(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg'
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      {showClientForm && (
        <div className='bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100'>
          <h3 className='text-xl font-bold mb-4 text-gray-800'>Cadastrar Cliente</h3>
          <div className='grid grid-cols-2 gap-4'>
            <input type="text" placeholder='Nome' className='border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
              value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
            <input type='number' placeholder='Idade' className='border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
              value={newClient.idade} onChange={(e) => setNewClient({ ...newClient, idade: e.target.value })} />
            <input type="text" placeholder="Telefone" className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={newClient.telefone} onChange={(e) => setNewClient({ ...newClient, telefone: e.target.value })} />
            <input type="text" placeholder="CPF" className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={newClient.cpf} onChange={(e) => setNewClient({ ...newClient, cpf: e.target.value })} />
            <input type="text" placeholder='Email' className='border rounded px-3 py-2 col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
              value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
          </div>
          <div className='flex justify-end space-x-3 mt-4'>
            <button onClick={handlerCreateClient}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all duration-200 hover:shadow-md">Criar</button>
            <button onClick={() => setShowClientForm(false)}
              className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition-all duration-200 hover:shadow-md">Cancelar</button>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Idade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {client.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.idade}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.telefone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.cpf}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditClient(client)} // abre o dialog
                    className="text-blue-600 hover:text-blue-800 mr-3 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteClientId(client.id)}
                    className="text-red-600 hover:text-red-800 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DIALOG DE EDIÇÃO */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Altere as informações e clique em “Salvar”.</DialogDescription>
          </DialogHeader>

          {editClient && (
            <div className='grid grid-cols-2 gap-4'>
              <input type="text" placeholder="Nome" className="border rounded px-3 py-2"
                value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} />
              <input type="number" placeholder="Idade" className="border rounded px-3 py-2"
                value={editClient.idade} onChange={(e) => setEditClient({ ...editClient, idade: Number(e.target.value) })} />
              <input type="text" placeholder="Telefone" className="border rounded px-3 py-2"
                value={editClient.telefone} onChange={(e) => setEditClient({ ...editClient, telefone: e.target.value })} />
              <input type="text" placeholder="CPF" className="border rounded px-3 py-2"
                value={editClient.cpf} onChange={(e) => setEditClient({ ...editClient, cpf: e.target.value })} />
              <input type="text" placeholder="Email" className="border rounded px-3 py-2 col-span-2"
                value={editClient.email} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setEditClient(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            <button
              onClick={handleUpdateClient}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG */}
      <AlertDialog open={deleteClientId !== null} onOpenChange={(open) => !open && setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O cliente será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteClientId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
