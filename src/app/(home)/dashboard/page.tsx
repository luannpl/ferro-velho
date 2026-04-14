"use client";
import React, { useEffect, useState } from "react";
import {
    Package,
    DollarSign,
} from "lucide-react";
import { Dashboard } from "@/types";
import { SalesChart } from "@/components/dashboard/SalesChart";


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
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Total em Estoque</p>
                            <p className="text-3xl font-bold mt-1 text-gray-900">
                               {dashboardData.totalInStock.toLocaleString()} <span className="text-lg font-normal text-gray-500">kg</span>
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Package className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Produtos Cadastrados</p>
                            <p className="text-3xl font-bold mt-1 text-gray-900">{dashboardData.totalProducts}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <Package className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Vendas de Hoje</p>
                            <p className="text-3xl font-bold mt-1 text-gray-900">{dashboardData.salesToday}</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Compras de Hoje</p>
                            <p className="text-3xl font-bold mt-1 text-gray-900">{dashboardData.purchasesToday}</p>
                        </div>
                        <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <SalesChart />
        </div>
    );
}