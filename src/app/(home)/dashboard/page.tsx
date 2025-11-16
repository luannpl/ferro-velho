"use client";
import React, { useState } from "react";
import {
    Package,
    DollarSign,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
  stock: number;
}

export default function DashboardPage() {
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
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total em Estoque</p>
                            <p className="text-2xl font-bold">
                                {products.reduce((sum, p) => sum + p.stock, 0)} kg
                            </p>
                        </div>
                        <Package className="text-blue-600" size={40} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">
                                Produtos Cadastrados
                            </p>
                            <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                        <Package className="text-green-600" size={40} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Vendas Hoje</p>
                            <p className="text-2xl font-bold">R$ 0,00</p>
                        </div>
                        <DollarSign className="text-yellow-600" size={40} />
                    </div>
                </div>
            </div>
        </div >
    );
}