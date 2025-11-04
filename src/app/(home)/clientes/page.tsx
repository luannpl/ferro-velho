'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(clientToSend)
        })

        if (response.ok) {
            fetchClient();
            setShowClientForm(false)
            setNewClient({
                name: "",
                idade: "",
                email: "",
                telefone: "",
                cpf: "",
            })
        }
    }

    const handleDeleteClient = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar este cliente?")) return;

        const response = await fetch(`/api/client/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Cliente deletado com sucesso!");
            fetchClient(); // atualiza a lista
        } else {
            const error = await response.json();
            alert("Erro ao deletar: " + error.message);
        }
    };

    return (
        <div>
            <div className='flex justify-between items-center mb-6'>
                <h2 className="text-3xl font-bold">Clientes</h2>
                <button
                    onClick={() => setShowClientForm(true)}
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700'
                >
                    <Plus size={20} />
                    <span>Novo Cliente</span>
                </button>
            </div>

            {showClientForm && (
                <div className='bg-white p-6 rounded-lg shadow mb-6'>
                    <h3 className='text-x1 font-bold mb-4'>Cadastrar Cliente</h3>
                    <div className='grid grid-cols-2 gap-4'>
                        <input
                            type="text"
                            placeholder='Nome do Cliente'
                            className='border rounded px-3 py-2'
                            value={newClient.name}
                            onChange={(e) =>
                                setNewClient({ ...newClient, name: e.target.value })
                            }
                        />
                        <input
                            type='number'
                            placeholder='Idade'
                            className='border rounded px-3 py-2'
                            value={newClient.idade}
                            onChange={(e) =>
                                setNewClient({ ...newClient, idade: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Telefone do cliente"
                            className="border rounded px-3 py-2"
                            value={newClient.telefone}
                            maxLength={15} // limita ao tamanho máximo (ex: (99) 99999-9999)
                            onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

                                // aplica a máscara passo a passo
                                if (value.length > 2) {
                                    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
                                }
                                if (value.length > 7) {
                                    value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");
                                }

                                setNewClient({ ...newClient, telefone: value });
                            }}
                        />
                        <input
                            type="text"
                            placeholder="CPF do cliente"
                            className="border rounded px-3 py-2"
                            value={newClient.cpf}
                            maxLength={14} // limite máximo (ex: 999.999.999-99)
                            onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

                                // aplica a máscara
                                value = value.replace(/(\d{3})(\d)/, "$1.$2");
                                value = value.replace(/(\d{3})(\d)/, "$1.$2");
                                value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

                                setNewClient({ ...newClient, cpf: value });
                            }}
                        />

                        <input
                            type="text"
                            placeholder='Email do cliente'
                            className='border rounded px-3 py-2 col-span-2'
                            value={newClient.email}
                            onChange={(e) =>
                                setNewClient({ ...newClient, email: e.target.value })
                            }
                        />
                    </div>
                    <div className='flex w-full justify-end space-x-3 mt-4'>
                        <button
                            onClick={handlerCreateClient}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                        >
                            Criar
                        </button>
                        <button
                            onClick={() => setShowClientForm(false)}
                            className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className='w-full'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Idade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Telefone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Cpf
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {client.map((client) => (
                            <tr key={client.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {client.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {client.idade}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {client.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {client.telefone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {client.cpf}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client.id)}
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
        </div>
    );
}