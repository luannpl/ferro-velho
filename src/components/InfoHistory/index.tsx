import { Calendar } from "lucide-react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface InfoHistoryProps {
    dataAbertura: string;
    dataFechamento: string | null;
    numTransacoes: number;
    lucro: number;
    receita: number;
    despesa: number;
}

export default function InfoHistory({
    dataAbertura,
    dataFechamento,
    numTransacoes,
    lucro,
    receita,
    despesa
}: InfoHistoryProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="rounded-xl border border-gray-100 p-4 flex flex-col w-full mb-3">
            <div className="flex items-center flex-wrap gap-4">
                <div className="rounded-xl bg-gray-50 text-gray-500 p-2"><Calendar /></div>
                <div className="ml-2">
                    <div className="font-medium">
                        {formatDate(dataAbertura)} - {dataFechamento ? formatDate(dataFechamento) : 'Aberto'}
                    </div>
                    <p className={`text-xs text-muted-foreground`}>
                        <span className={`w-2 h-2 rounded-full mr-1 inline-block bg-gray-300`}></span>
                        {numTransacoes} transações
                    </p>
                </div>

                <div className="ml-auto flex items-end justify-between gap-6 flex-wrap">
                    <div className="flex flex-col items-end">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp size={14} /> Receita</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(receita)}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown size={14} /> Despesas</p>
                        <p className="text-sm font-semibold text-red-600">{formatCurrency(despesa)}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Wallet size={14} /> Lucro</p>
                        <p className={`text-sm font-semibold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(lucro)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}