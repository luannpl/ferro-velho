'use client'
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CardInfo from "@/components/CardInfo";
import { Archive, ArrowUpRight, ArrowDownRight, History, TrendingDown, TrendingUp, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import InfoTransacao from "@/components/InfoTransacao";
import InfoHistory from "@/components/InfoHistory";
import CardInfoPeso from "@/components/CardInfoPeso";

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

    const fetchHistorico = async () => {
        try {
            const response = await fetch("/api/caixa");
            if (response.ok) {
                const data = await response.json();
                // Ordenar por data de abertura (mais recente primeiro)
                const sorted = data.sort((a: any, b: any) => new Date(b.dataCaixaAbertura).getTime() - new Date(a.dataCaixaAbertura).getTime());

                // Filtrar apenas caixas fechados para o histórico
                const fechados = sorted.filter((c: any) => c.dataCaixaFechamento !== null);

                setHistorico(fechados);
            }
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        }
    };

    useEffect(() => {
        fetchCaixaStatus();
        fetchHistorico();
    }, []);

    const handleOpenCaixa = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/caixa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ /* data inicial, se houver */ }),
            });

            if (response.ok) {
                alert("Caixa aberto com sucesso!");
                await fetchCaixaStatus(); // Atualiza o estado
            } else {
                const error = await response.json();
                alert(`Erro ao abrir caixa: ${error.error}`);
            }
        } catch (error) {
            console.error("Erro ao abrir caixa:", error);
            alert("Erro de comunicação ao abrir caixa.");
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

                alert(`Caixa fechado com sucesso! Total de Transações: ${data.caixa.numTransacoes}. Lucro final: R$ ${lucroFechamento.toFixed(2)}`);
                setCaixaAberto(null); // Define como fechado
                fetchHistorico(); // Atualiza o histórico
            } else {
                const error = await response.json();
                alert(`Erro ao fechar caixa: ${error.error}`);
            }
        } catch (error) {
            console.error("Erro ao fechar caixa:", error);
            alert("Erro de comunicação ao fechar caixa.");
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
    const totalPages = Math.ceil(historico.length / itemsPerPage);
    const currentHistorico = historico.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <main>
            <section className="flex flex-col gap-6 p-6 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-gray-100 text-gray-500 p-2"><Archive /></div>
                    <div>
                        <div className="text-lg font-semibold">Histórico de Caixas</div>
                        <p className="text-muted-foreground text-sm">{historico.length} caixas anteriores</p>
                    </div>
                </div>
                <div className="">
                    {currentHistorico.length > 0 ? (
                        <>
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

                            {/* Controles de Paginação */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-muted-foreground">
                                    Página {currentPage} de {totalPages || 1}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        Próximo
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-sm p-4">Nenhum histórico disponível.</p>
                    )}
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
                        <Button
                            className={`${isOpen ? "bg-red-600 hover:bg-red-700" : "bg-green-500 hover:bg-green-600"}`}
                            onClick={isOpen ? handleCloseCaixa : handleOpenCaixa}
                            disabled={isLoading}
                        >
                            {isOpen ? "Fechar Caixa" : "Abrir Caixa"}
                        </Button>
                    </div>
                </div>
                <div className="p-2">
                    <p className={`text-xs ${isOpen ? "text-green-500" : "text-muted-foreground"}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 inline-block ${isOpen ? "bg-green-500" : "bg-gray-500"}`}></span>
                        {isOpen ? `Caixa Aberto desde: ${dataAberturaFormatada}` : "Caixa Fechado"}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <CardInfo
                            title="Receita Total"
                            valor={receitaAtual} // Total de Vendas
                            icon={<TrendingUp />}
                            bgColor="bg-green-300/30"
                            borderColor="border-green-300"
                            textColor="text-green-600"
                        />
                    </div>
                    <div className="flex-1">
                        <CardInfo
                            title="Despesas"
                            valor={despesaAtual} // Total de Compras
                            icon={<TrendingDown />}
                            bgColor="bg-red-300/30"
                            borderColor="border-red-300"
                            textColor="text-red-600"
                        />
                    </div>
                    <div className="flex-1">
                        <CardInfo
                            title="Lucro"
                            valor={lucroAtual} // Lucro Líquido (Receita - Despesa)
                            icon={<Wallet />}
                            bgColor="bg-green-300/30"
                            borderColor="border-green-300"
                            textColor="text-green-600"
                        />
                    </div>
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                        <CardInfoPeso title="Peso Total Comprado" valor={pesoCompradoAtual} bgColor="bg-green-300/30" borderColor="border-green-300" textColor="text-green-600" />
                    </div>
                    <div className="flex-1">
                        <CardInfoPeso title="Peso Total Vendido" valor={pesoVendidoAtual} bgColor="bg-blue-300/30" borderColor="border-blue-300" textColor="text-blue-600" />
                    </div>
                </div>
            </section>

            {/* Seção Histórico de Transações */}
            <section className="mt-3">
                <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600"><History /></div>
                        <div>
                            <div className="text-lg font-semibold">Histórico de Transações</div>
                            <p className="text-muted-foreground text-sm">{numTransacoes} transações registradas</p>
                        </div>
                    </div>
                    {/* Aqui você faria um .map das transações que ocorreram no período do caixa aberto */}
                    {/* Lista de Transações Dinâmica */}
                    <div className="mt-4 flex flex-col gap-3">
                        {currentTransacoes.length > 0 ? (
                            <>
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
                                            bgColorIcon={isVenda ? "bg-green-100" : "bg-red-100"}
                                            textColorIcon={isVenda ? "text-green-600" : "text-red-600"}
                                            textColorValue={isVenda ? "text-green-600" : "text-red-600"}
                                            isNegative={!isVenda}
                                        />
                                    );
                                })}

                                {/* Controles de Paginação de Transações */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-muted-foreground">
                                        Página {currentTransacaoPage} de {totalTransacaoPages || 1}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreviousTransacaoPage}
                                            disabled={currentTransacaoPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextTransacaoPage}
                                            disabled={currentTransacaoPage === totalTransacaoPages || totalTransacaoPages === 0}
                                        >
                                            Próximo
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm p-4 text-center">Nenhuma transação registrada neste período.</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}