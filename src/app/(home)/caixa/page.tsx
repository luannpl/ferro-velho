'use client'
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CardInfo from "@/components/CardInfo";
import { Archive, ArrowUpRight, ArrowDownRight, History, TrendingDown, TrendingUp, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import InfoTransacao from "@/components/InfoTransacao";
import InfoHistory from "@/components/InfoHistory";
import CardInfoPeso from "@/components/CardInfoPeso";
import { toast } from "sonner";

// Adapte a interface Caixa para o frontend
interface Caixa {
    id: number;
    dataCaixaAbertura: string;
    dataCaixaFechamento: string | null;
    lucro: number;
    despesa: number;
    receita: number;
    numTransacoes: number;
    pesoVendido: number;
    pesoComprado: number;
    transacoes: {
        id: number;
        tipo: string;
        valor: number;
        data: string;
        descricao: string;
    }[];
}

export default function Caixa() {
    const [caixaAberto, setCaixaAberto] = useState<Caixa | null>(null);
    const [historico, setHistorico] = useState<Caixa[]>([]);
    const [totalHistorico, setTotalHistorico] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [currentTransacaoPage, setCurrentTransacaoPage] = useState(1);
    const itemsPerPage = 5;

    // Função para buscar o status atual do caixa
    const fetchCaixaStatus = async () => {
        try {
            // Buscando o último caixa aberto (endpoint /api/caixas/aberto)
            const response = await fetch("/api/caixa/aberto");

            if (response.ok) {
                const data = await response.json();

                // Conversão de Decimal (String/Object do Prisma) para Number no frontend
                const caixaData = {
                    ...data.caixa,
                    lucro: parseFloat(data.caixa.lucro),
                    despesa: parseFloat(data.caixa.despesa),
                    receita: parseFloat(data.caixa.receita),
                    pesoVendido: parseFloat(data.caixa.pesoVendido || 0),
                    pesoComprado: parseFloat(data.caixa.pesoComprado || 0),
                    transacoes: data.caixa.transacoes || [],
                };

                setCaixaAberto(caixaData);
            } else if (response.status === 404) {
                setCaixaAberto(null); // Nenhum caixa aberto
            } else {
                console.error("Erro ao buscar status do caixa:", response.statusText);
            }
        } catch (error) {
            console.error("Erro de comunicação ao buscar status do caixa:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistorico = async (page: number = 1) => {
        try {
            const response = await fetch(`/api/caixa?page=${page}&limit=${itemsPerPage}`);
            if (response.ok) {
                const data = await response.json();
                setHistorico(data.history);
                setTotalHistorico(data.total);
            }
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        }
    };

    useEffect(() => {
        fetchCaixaStatus();
        fetchHistorico(currentPage);
    }, [currentPage]);


    const handleOpenCaixa = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/caixa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ /* data inicial, se houver */ }),
            });

            if (response.ok) {
                toast.success("Caixa aberto com sucesso!");
                await fetchCaixaStatus(); // Atualiza o estado
            } else {
                const error = await response.json();
                toast.error(`Erro ao abrir caixa: ${error.error}`);
            }
        } catch (error) {
            console.error("Erro ao abrir caixa:", error);
            toast.error("Erro de comunicação ao abrir caixa.");
        } finally {
            setIsLoading(false);
        }
    };

    // Função para Fechar o Caixa (PATCH/PUT)
    const handleCloseCaixa = async () => {
        if (!caixaAberto) return;

        if (!confirm("Tem certeza que deseja fechar o caixa? Isso calculará o lucro, despesa e receita do período.")) {
            return;
        }

        setIsLoading(true);
        try {
            // PATCH para atualizar/fechar o caixa
            const response = await fetch(`/api/caixa/${caixaAberto.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();

                const lucroFechamento = parseFloat(data.caixa.lucro);

                toast.success(`Caixa fechado com sucesso! Total de Transações: ${data.caixa.numTransacoes}. Lucro final: R$ ${lucroFechamento.toFixed(2)}`);
                setCaixaAberto(null); // Define como fechado
                fetchHistorico(); // Atualiza o histórico
            } else {
                const error = await response.json();
                toast.error(`Erro ao fechar caixa: ${error.error}`);
            }
        } catch (error) {
            console.error("Erro ao fechar caixa:", error);
            toast.error("Erro de comunicação ao fechar caixa.");
        } finally {
            setIsLoading(false);
        }
    };

    const isOpen = !!caixaAberto;
    const lucroAtual = caixaAberto?.lucro ?? 0;
    const receitaAtual = caixaAberto?.receita ?? 0;
    const despesaAtual = caixaAberto?.despesa ?? 0;
    const numTransacoes = caixaAberto?.numTransacoes ?? 0;
    const pesoVendidoAtual = caixaAberto?.pesoVendido ?? 0;
    const pesoCompradoAtual = caixaAberto?.pesoComprado ?? 0;

    const dataObj = new Date(caixaAberto?.dataCaixaAbertura || '');
    const isDateValid = !isNaN(dataObj.getTime());

    const dataAberturaFormatada = isOpen && isDateValid
        ? dataObj.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        })
        : 'Data de Abertura Desconhecida';

    // Lógica de Paginação
    const totalPages = Math.ceil(totalHistorico / itemsPerPage);
    const currentHistorico = historico;


    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Lógica de Paginação de Transações
    const transacoes = caixaAberto?.transacoes || [];
    const totalTransacaoPages = Math.ceil(transacoes.length / itemsPerPage);
    const currentTransacoes = transacoes.slice((currentTransacaoPage - 1) * itemsPerPage, currentTransacaoPage * itemsPerPage);

    const handlePreviousTransacaoPage = () => {
        if (currentTransacaoPage > 1) {
            setCurrentTransacaoPage(currentTransacaoPage - 1);
        }
    };

    const handleNextTransacaoPage = () => {
        if (currentTransacaoPage < totalTransacaoPages) {
            setCurrentTransacaoPage(currentTransacaoPage + 1);
        }
    };

    if (isLoading) {
        return (
            <main className="p-6">
                <div className="p-2">
                    <p className={`text-xs ${isOpen ? "text-green-500" : "text-muted-foreground"}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 inline-block ${isOpen ? "bg-green-500" : "bg-gray-500"}`}></span>
                        {isOpen ? `Caixa Aberto desde: ${dataAberturaFormatada}` : "Caixa Fechado"}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fluxo de Caixa</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`relative flex h-3 w-3`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? "bg-green-400" : "bg-red-400"}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
                        </span>
                        <span className="text-sm font-semibold text-gray-500">
                            {isOpen ? `Sessão aberta: ${dataAberturaFormatada}` : "Caixa atualmente fechado"}
                        </span>
                    </div>
                </div>
                <Button
                    size="lg"
                    className={`h-12 px-8 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                        isOpen 
                        ? "bg-red-500 hover:bg-red-600 shadow-red-100 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white"
                    }`}
                    onClick={isOpen ? handleCloseCaixa : handleOpenCaixa}
                    disabled={isLoading}
                >
                    {isOpen ? "Encerrar Caixa" : "Iniciar Novo Caixa"}
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                        <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receita (Vendas)</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">R$ {receitaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                        <TrendingDown className="text-red-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Despesas (Compras)</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">R$ {despesaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                        <Wallet className="text-blue-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lucro Líquido</p>
                    <p className={`text-2xl font-black mt-1 ${lucroAtual >= 0 ? "text-green-600" : "text-red-600"}`}>
                        R$ {lucroAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                        <Archive className="text-amber-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peso Comprado</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{pesoCompradoAtual.toLocaleString('pt-BR')} <span className="text-sm font-normal text-gray-400">kg</span></p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-2 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                        <History className="text-indigo-600" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peso Vendido</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{pesoVendidoAtual.toLocaleString('pt-BR')} <span className="text-sm font-normal text-gray-400">kg</span></p>
                </div>
            </div>

            {/* Main Content: Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Active Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <History className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Transações Atuais</h3>
                                    <p className="text-xs text-gray-500">{numTransacoes} operações registradas no caixa aberto</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {currentTransacoes.length > 0 ? (
                                <div className="space-y-3">
                                    {currentTransacoes.map((transacao) => {
                                        const isVenda = transacao.tipo === 'Venda';
                                        return (
                                            <InfoTransacao
                                                key={`${transacao.tipo}-${transacao.id}`}
                                                title={transacao.descricao}
                                                valor={transacao.valor}
                                                tipo={transacao.tipo}
                                                data={new Date(transacao.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                                icon={isVenda ? <ArrowUpRight /> : <ArrowDownRight />}
                                                bgColorIcon={isVenda ? "bg-green-50" : "bg-red-50"}
                                                textColorIcon={isVenda ? "text-green-600" : "text-red-600"}
                                                textColorValue={isVenda ? "text-green-600" : "text-red-600"}
                                                isNegative={!isVenda}
                                            />
                                        );
                                    })}

                                    {/* Pagination for Transactions */}
                                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-50">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Página {currentTransacaoPage} de {totalTransacaoPages || 1}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg h-8 w-8 p-0"
                                                onClick={handlePreviousTransacaoPage}
                                                disabled={currentTransacaoPage === 1}
                                            >
                                                <ChevronLeft size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg h-8 w-8 p-0"
                                                onClick={handleNextTransacaoPage}
                                                disabled={currentTransacaoPage === totalTransacaoPages || totalTransacaoPages === 0}
                                            >
                                                <ChevronRight size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                    <Archive size={48} className="mb-4 text-gray-400" />
                                    <p className="font-medium">Nenhuma transação no período</p>
                                    <p className="text-sm">As vendas e compras aparecerão aqui após serem registradas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Data */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Archive className="text-amber-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Caixas Anteriores</h3>
                                    <p className="text-xs text-gray-500">{totalHistorico} fechamentos no total</p>

                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {currentHistorico.length > 0 ? (
                                <div className="space-y-4">
                                    {currentHistorico.map((caixa) => (
                                        <InfoHistory
                                            key={caixa.id}
                                            dataAbertura={caixa.dataCaixaAbertura}
                                            dataFechamento={caixa.dataCaixaFechamento}
                                            numTransacoes={caixa.numTransacoes}
                                            lucro={Number(caixa.lucro)}
                                            receita={Number(caixa.receita)}
                                            despesa={Number(caixa.despesa)}
                                        />
                                    ))}

                                    {/* Pagination for History */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                        <div className="flex gap-2 w-full justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl flex-1 text-xs"
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft size={16} className="mr-1" />
                                                Anterior
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl flex-1 text-xs"
                                                onClick={handleNextPage}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                            >
                                                Próximo
                                                <ChevronRight size={16} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-center text-gray-400 py-8">Sem histórico disponível.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}