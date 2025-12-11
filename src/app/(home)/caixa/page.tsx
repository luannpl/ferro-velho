'use client'
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CardInfo from "@/components/CardInfo";
import { Archive, ArrowUpRight, History, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import InfoTransacao from "@/components/InfoTransacao";
import InfoHistory from "@/components/InfoHistory";
import CardInfoPeso from "@/components/CardInfoPeso";

export default function Caixa() {
    const [open, setOpen] = useState(false);
    return (
        <main>
            <section className="flex flex-col gap-6 p-6 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-gray-100 text-gray-500 p-2"><Archive /></div>
                    <div>
                        <div className="text-lg font-semibold">Histórico de Caixas</div>
                        <p className="text-muted-foreground text-sm">x caixas anteriores</p>
                    </div>
                </div>
                <div className="">
                    <InfoHistory />
                </div>
            </section>

            <section className="mt-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            Controle de Caixa
                        </h3>
                        <p className="text-muted-foreground text-sm">Gerencie suas transações e acompanhe o fluxo de caixa</p>
                    </div>
                    <div>
                        <Button className={`${open ? "bg-red-600 hover:bg-red-600" : "bg-green-500 hover:bg-green-500"}`} onClick={() => setOpen(!open)}>{open ? "Fechar Caixa" : "Abrir Caixa"}</Button>
                    </div>
                </div>
                <div className="p-2">
                    <p className={`text-xs ${open ? "text-green-500" : "text-muted-foreground"}`}><span className={`w-2 h-2 rounded-full mr-1 inline-block ${open ? "bg-green-500" : "bg-gray-500"}`}></span>{open ? "Caixa Aberto" : "Caixa Fechado"}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <CardInfo title="Receita Total" valor={1000} icon={<TrendingUp />} bgColor="bg-green-300/30" borderColor="border-green-300" textColor="text-green-600" />
                    </div>
                    <div className="flex-1">
                        <CardInfo title="Despesas" valor={1000} icon={<TrendingDown />} bgColor="bg-red-300/30" borderColor="border-red-300" textColor="text-red-600" />
                    </div>
                    <div className="flex-1">
                        <CardInfo title="Lucro" valor={1000} icon={<Wallet />} bgColor="bg-green-300/30" borderColor="border-green-300" textColor="text-green-600" />
                    </div>
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                        <CardInfoPeso title="Peso Total Comprado" valor={1000} bgColor="bg-green-300/30" borderColor="border-green-300" textColor="text-green-600" />
                    </div>
                    <div className="flex-1">
                        <CardInfoPeso title="Peso Total Vendido" valor={1000} bgColor="bg-blue-300/30" borderColor="border-blue-300" textColor="text-blue-600" />
                    </div>
                </div>
            </section>

            <section className="mt-3">
                <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600"><History /></div>
                        <div>
                            <div className="text-lg font-semibold">Histórico de Transações</div>
                            <p className="text-muted-foreground text-sm">x transações registradas</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <InfoTransacao title="Venda de produto eletrônico" valor={1250} tipo="Venda" data="07 dez, 17:42" icon={<ArrowUpRight />} bgColorIcon="bg-green-100" textColorIcon="text-green-600" textColorValue="text-green-600"/>
                    </div>
                </div>
            </section>
        </main>
    )
}