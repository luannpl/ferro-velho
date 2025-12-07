'use client'
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CardInfo from "@/components/CardInfo";
import { TrendingUp } from "lucide-react";

export default function Caixa() {
    const [open, setOpen] = useState(false);
    return (
        <main>
            <section className="flex flex-col gap-6 p-6 bg-white/30 border border-white/20 rounded-xl backdrop-blur-lg shadow-lg">
                <div>
                    <div className="text-lg font-semibold">Histórico de Caixas</div>
                    <p className="text-muted-foreground text-sm">x caixas anteriores</p>
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
                <div className="justify-between">
                    <CardInfo title="Receita Total" valor={1000} icon={<TrendingUp />} bgColor="bg-green-500/30" />
                    <CardInfo title="Receita Total" valor={1000} icon={<TrendingUp />} bgColor="bg-green-500/30" />
                    <CardInfo title="Receita Total" valor={1000} icon={<TrendingUp />} bgColor="bg-green-500/30" />
                </div>
                
            </section>
        </main>
    )
}