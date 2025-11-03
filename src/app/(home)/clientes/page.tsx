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
    })

    const handlerCreateClient = async () => {
        const clientToSend = {
            ...newClient,
            idade: Number(newClient.idade) || 0
        }

        const response = await fetch("api/client", {
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
                            className='border rounded px-3 py-2'
                            value={newClient.telefone}
                            onChange={(e) =>
                                setNewClient({ ...newClient, telefone: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder='Cpf do cliente'
                            className='border rounded px-3 py-2'
                            value={newClient.cpf}
                            onChange={(e) =>
                                setNewClient({ ...newClient, cpf: e.target.value })
                            }
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
        </div>
    );
}