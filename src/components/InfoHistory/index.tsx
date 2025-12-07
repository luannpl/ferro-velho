import { Calendar } from "lucide-react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

export default function InfoHistory() {
    return (
        <div className="rounded-xl border border-gray-100 p-4 flex flex-col w-full">
            <div className="flex items-center">
                <div className="rounded-xl bg-gray-50 text-gray-500 p-2"><Calendar /></div>
                <div className="ml-2">
                    <div>Data do caixa</div>
                    <p className={`text-xs text-muted-foreground`}><span className={`w-2 h-2 rounded-full mr-1 inline-block bg-gray-300`}></span>x transações</p>
                </div>

                <div className="ml-auto flex items-end justify-between gap-6">
                    <p className="text-sm text-green-600 flex items-center gap-2"><TrendingUp /> Lucro</p>
                    <p className="text-sm text-red-600 flex items-center gap-2"><TrendingDown /> despesas</p>
                    <p className="text-sm text-green-600 flex items-center gap-2"><Wallet /> receita</p>
                </div>
            </div>
        </div>
    )
}