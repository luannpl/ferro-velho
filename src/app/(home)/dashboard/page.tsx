"use client";
import React, { useEffect, useState } from "react";
import {
    Package,
    DollarSign,
} from "lucide-react";
import { Dashboard } from "@/types";


export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<Dashboard | null>(null);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch("/api/dashboard");
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
            }
        };
        fetchDashboardData();
    }, []);
    if (!dashboardData) {
        return <div>Carregando...</div>;
    }
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total em Estoque</p>
                            <p className="text-2xl font-bold">
                               {dashboardData.totalInStock} kg
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
                            <p className="text-2xl font-bold">{dashboardData.totalProducts}</p>
                        </div>
                        <Package className="text-green-600" size={40} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total de vendas do dia</p>
                            <p className="text-2xl font-bold">{dashboardData.salesToday}</p>
                        </div>
                        <DollarSign className="text-yellow-600" size={40} />
                    </div>
                </div>
            </div>
        </div >
    );
}