"use client";

import React, { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";

interface ChartData {
    label: string;
    total: number;
}

export function SalesChart() {
    const [data, setData] = useState<ChartData[]>([]);
    const [period, setPeriod] = useState<"week" | "month" | "year">("month");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/dashboard/chart?period=${period}`);
                const result = await response.json();
                setData(result);
            } catch (error) {

            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [period]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="text-blue-500" size={20} />
                        Vendas por Período
                    </h3>
                    <p className="text-gray-500 text-sm">Acompanhe o desempenho comercial</p>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                    {(["week", "month", "year"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                period === p
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {p === "week" ? "Semana" : p === "month" ? "Mês" : "Ano"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                }}
                                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, "Total"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                        <p>Nenhuma venda registrada neste período</p>
                    </div>
                )}
            </div>
        </div>
    );
}
