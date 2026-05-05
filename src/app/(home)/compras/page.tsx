"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Package, TrendingDown } from "lucide-react";
import { Input, Select } from "antd";

import { CompraDataResponse, ClientData } from "@/types";
import { toast } from "sonner";

interface PurchaseItem {
  productName: string;
  category: string;
  weight: number;
  pricePerKgCompra: number;
  subtotal: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  weight?: number;
  pricePerKgCompra: number;
  stock?: number;
}

/** Tipo simples para as options do AntD */
type OptionType = {
  label?: string;
  value?: string;
};

export default function ComprasPage() {
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [purchaseForm, setPurchaseForm] = useState({
    productName: "",
    category: "",
    weight: "",
    pricePerKgCompra: "",
  });

  const [fornecedores, setFornecedores] = useState<ClientData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, clientsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/client"),
        ]);

        if (!productsRes.ok || !clientsRes.ok) {

          return;
        }

        const [productsData, clientsData] = await Promise.all([
          productsRes.json(),
          clientsRes.json(),
        ]);

        setProducts(productsData);
        setFornecedores(clientsData);
      } catch (error) {

      }
    }

    fetchData();
  }, []);

  const addPurchaseItem = () => {
    if (
      !purchaseForm.productName ||
      !purchaseForm.weight ||
      !purchaseForm.pricePerKgCompra
    ) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const weight = parseFloat(purchaseForm.weight);
    const pricePerKgCompra = parseFloat(purchaseForm.pricePerKgCompra);

    if (isNaN(weight) || isNaN(pricePerKgCompra)) {
      toast.error("Peso ou preço inválido");
      return;
    }

    const newItem: PurchaseItem = {
      productName: purchaseForm.productName,
      category: purchaseForm.category || "Sem categoria",
      weight,
      pricePerKgCompra,
      subtotal: +(weight * pricePerKgCompra).toFixed(2),
    };

    setPurchaseItems((prev) => [...prev, newItem]);

    setPurchaseForm({
      productName: "",
      category: "",
      weight: "",
      pricePerKgCompra: "",
    });
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalPurchase = () => {
    return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const finalizePurchase = async () => {
    // -------------------------------------------------------------------
    // --- 1. VALIDAÇÕES E ENCONTRAR FORNECEDOR ---
    // -------------------------------------------------------------------
    if (purchaseItems.length === 0) {
      toast.error("Adicione itens à compra!");
      return;
    }

    // Fornecedor agora é OPCIONAL
    const fornecedor = selectedSupplier 
      ? fornecedores.find((f) => f.name === selectedSupplier)
      : null;

    const itensCompraData = purchaseItems.map((item) => {
      const productFound = products.find((p) => p.name === item.productName);

      if (!productFound) {
        throw new Error(
          `Produto "${item.productName}" não encontrado para mapeamento de ID.`
        );
      }

      return {
        produtoId: productFound.id, // ESSENCIAL: ID do produto
        peso: item.weight,
        precoKg: item.pricePerKgCompra,
        subtotal: item.subtotal,
      };
    });

    // -------------------------------------------------------------------
    // --- 2. CÁLCULOS E DADOS DE IMPRESSÃO ---
    // -------------------------------------------------------------------
    const totalPeso = purchaseItems.reduce((sum, i) => sum + i.weight, 0);
    const totalValor = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);
    const mockDataCompra = new Date().toLocaleString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Formato 24h
    }).replace(',', ''); // Remoção da vírgula para simular o formato da imagem

    const payload = {
      fornecedorId: fornecedor?.id || null,
      totalItens: itensCompraData.length,
      pesoTotal: totalPeso,
      valorTotal: totalValor,
      dataCompra: new Date(),
      // NOVO: Adicione o array de itens mapeados
      itens: itensCompraData,
    };

    try {
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: CompraDataResponse = await res.json();
      if (!res.ok) {
        throw new Error("Erro ao finalizar compra:");
      }

      //
      // Estrutura de dados para o cupom
      const printPayload = {
        ferroVelho: "OSVALDO RECICLAGENS", 
        dataCompra: mockDataCompra,
        totalItens: purchaseItems.length,
        valorTotal: totalValor,
        pedidoId: result.compra.id,
        fornecedor: fornecedor ? {
          nome: fornecedor.name,
          telefone: fornecedor.telefone,
        } : {
          nome: "COMPRA AVULSA",
          telefone: "-",
        },
        itens: purchaseItems.map((i) => ({
          nome: i.productName,
          quantidade: i.weight,
          precoUnitario: i.pricePerKgCompra,
          precoTotal: i.subtotal,
        })),
      };

      // -------------------------------------------------------------------
      // --- 3. GERAÇÃO DO HTML COM CSS (REQUER DRIVER EPSON OFICIAL) ---
      // -------------------------------------------------------------------
      
      const cupomHTML = `
<html>
  <head>
    <meta charset="utf-8"> 
    <title>Cupom</title>

    <style>
      @page { 
        size: 80mm auto; 
        margin: 0; 
      }

      body {
        font-family: 'Courier New', monospace;
        width: 80mm; 
        margin: 0;
        padding: 12px 10px;
        color: #000;
        font-size: 12px;
        line-height: 1.4;
        font-weight: bold;
      }

      .center { text-align: center; }
      .bold { font-weight: bold; }

      /* Logo e cabeçalho */
      .logo-box {
        border: 2px solid #000;
        padding: 6px 10px;
        margin: 0 auto 12px auto;
        width: fit-content;
        display: inline-block;
        border-radius: 4px;
      }

      .recycle-icon {
        font-size: 28px;
        display: block;
        margin-bottom: 3px;
        font-weight: bold;
      }

      .titulo-loja { 
        font-size: 14px; 
        font-weight: bold;
        margin: 0;
      }

      .endereco { 
        font-size: 11px; 
        line-height: 1.3;
        margin: 3px 0;
        font-weight: bold;
      }

      /* Box mensagem */
      .box-mensagem {
        border: 1px solid #000;
        background: #f3f3f3;
        padding: 10px 6px;
        margin: 12px 0;
        font-size: 12px;
        line-height: 1.4;
        font-weight: bold;
        border-radius: 4px;
      }

      /* Informações */
      .info-pedido {
        font-size: 12px;
        margin: 12px 0;
        font-weight: bold;
        padding-left: 6px;
      }

      .info-linha {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }

      /* Tabela */
      table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 11px;
        margin: 12px 0;
        font-weight: bold;
        table-layout: fixed; /* Essencial para o ellipsis funcionar */
      }

      th { 
        text-align: center;
        border-bottom: 2px solid #000;
        border-top: 2px solid #000;
        padding: 5px 2px;
        font-weight: bold;
        font-size: 12px;
      }

      td { 
        text-align: center;
        padding: 5px 2px;
        font-size: 12px;
      }
      
      /* NOVO: Estilo para cortar e adicionar "..." */
      .ellipsis-cell {
        text-align: left; /* Alinha o texto do produto à esquerda */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-left: 5px;
      }
      /* FIM NOVO */

      /* Linha separadora */
      .linha-separadora {
        border-top: 2px solid #000;
        margin: 12px 0;
      }

      .valores {
        padding-left: 5px;
      }

      .total-linha {
        display: flex;
        margin: 5px 0;
        font-size: 12px;
        font-weight: bold;
      }

      .total-principal {
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0;
      }

      /* Rodapé */
      .footer { 
        margin-top: 18px; 
        font-size: 11px;
        line-height: 1.4;
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <!-- Cabeçalho com Logo -->
    <div class="center">
      <div class="logo-box">
        <span class="recycle-icon">♻</span>
        <div class="titulo-loja">OR OSVALDO RECICLAGENS LTDA</div>
      </div>
      <div class="endereco">Rua Tenente João Albano N° 106</div>
      <div class="endereco">Aerolândia - Fortaleza</div>
      <div class="endereco">CEP: 60850-710 / Fone: (85)99156-6566</div>
    </div>

    <!-- Box Mensagem -->
    <div class="box-mensagem center">
      <div class="bold">DEUS é bom o tempo todo, todo o</div>
      <div class="bold">tempo DEUS é bom!</div>
    </div>

    <!-- Info Pedido -->
    <div class="info-pedido">
      <div class="info-linha">
        <span class="bold">Pedido: ${printPayload.pedidoId}</span>
      </div>

      <div class="info-linha">
        <span>Usuário: ${printPayload.fornecedor.nome}</span>
      </div>
      <div class="info-linha">
        <span>${printPayload.dataCompra}</span>
      </div>
    </div>

    <!-- Tabela -->
    <table>
      <thead>
        <tr>
          <th width="35%">Descrição</th>
          <th width="20%">Vlr.KG</th>
          <th width="20%">KG</th>
          <th width="25%">Valor</th>
        </tr>
      </thead>

      <tbody>
        ${printPayload.itens.map(i => `
          <tr>
            <td class="ellipsis-cell">${i.nome}</td> <!-- AQUI: Nova classe aplicada -->
            <td>${i.precoUnitario.toFixed(2)}</td>
            <td>${i.quantidade.toFixed(3)}</td>
            <td>${i.precoTotal.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="linha-separadora"></div>

    <!-- Totais -->
    <div class="valores">
      <div class="total-linha">
        <span>Total Peso Kg:</span>
        <span>${totalPeso.toFixed(3)}</span>
      </div>

      <div class="total-linha total-principal">
        <span>TOTAL R$</span>
        <span>${printPayload.valorTotal.toFixed(2)}</span>
      </div>

      <div class="total-linha">
        <span>Dinheiro R$</span>
        <span>${printPayload.valorTotal.toFixed(2)}</span>
      </div>
    </div>

    <div class="linha-separadora"></div>

    <!-- Rodapé -->
    <div class="footer center">
      <div class="bold">Ⓒ PRSystem Solutions</div>
      <div>Precisa de um sistema? Entre em contato:</div>
      <div>(85)92164-4075 | @prsystemsolution</div>
    </div>

  </body>
</html>
`;

      // -------------------------------------------------------------------
      // --- 4. EXIBIÇÃO E IMPRESSÃO ---
      // -------------------------------------------------------------------

      const win = window.open("", "_blank", "width=400,height=600");
      if (!win) {

        return; 
      }

      win.document.open();
      win.document.write(cupomHTML);
      win.document.close();
      
      // Um pequeno atraso para garantir que o navegador renderizou todos os estilos antes de imprimir
      setTimeout(() => {
        win.focus();
        win.print();
        // win.close(); // Comentado para permitir que você ajuste as configurações no diálogo de impressão
      }, 300);

    } catch (err) {


    }
  };
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Entrada de Materiais</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Registre a compra de sucatas e materiais recicláveis</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 items-center px-4 h-12">
          <TrendingDown className="text-red-500 mr-2" size={20} />
          <span className="text-sm font-bold text-gray-700">Fluxo de Entrada</span>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        {/* Formulário e Tabela Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
               <h3 className="font-bold text-gray-900">Adicionar Novo Item</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Produto Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Produto / Material *
                  </label>
                  <Select
                    showSearch
                    placeholder="Selecione o produto"
                    className="w-full h-11"
                    variant="borderless"
                    style={{ background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6' }}
                    value={purchaseForm.productName || undefined}
                    onChange={(value: string) => {
                      const selected = products.find((p) => p.name === value);
                      setPurchaseForm((prev) => ({
                        ...prev,
                        productName: value,
                        category: selected?.category || "",
                        pricePerKgCompra: selected
                          ? String(selected.pricePerKgCompra)
                          : prev.pricePerKgCompra,
                      }));
                    }}
                    filterOption={(input: string, option?: OptionType) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={products.map((product) => ({
                      value: product.name,
                      label: product.name,
                    }))}
                  />
                </div>

                {/* Categoria (Read Only) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Categoria
                  </label>
                  <Input
                    value={purchaseForm.category}
                    readOnly
                    placeholder="Auto-preenchido"
                    className="h-11 rounded-xl bg-gray-50 border-gray-100 text-gray-500 font-medium"
                  />
                </div>

                {/* Peso */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Peso (kg) *
                  </label>
                  <Input
                    type="number"
                    value={purchaseForm.weight}
                    onChange={(e) =>
                      setPurchaseForm({ ...purchaseForm, weight: e.target.value })
                    }
                    placeholder="0.00"
                    className="h-11 rounded-xl bg-white border-gray-200 focus:border-blue-500 font-bold"
                  />
                </div>

                {/* Preço por KG */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Preço de Compra (R$/kg) *
                  </label>
                  <Input
                    type="number"
                    value={purchaseForm.pricePerKgCompra}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        pricePerKgCompra: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="h-11 rounded-xl bg-white border-gray-200 focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <button
                onClick={addPurchaseItem}
                className="mt-8 h-12 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-50 active:scale-95 w-full md:w-auto"
              >
                <Plus size={20} />
                <span>Incluir no Lote</span>
              </button>
            </div>
          </div>

          {/* Tabela de Itens */}
          {purchaseItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <Package className="text-blue-500" size={20} />
                <h3 className="font-bold text-gray-900">Materiais Incluídos</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/30">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Peso</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço/kg</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {purchaseItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <p className="font-bold text-gray-900">{item.productName}</p>
                           <p className="text-[10px] text-gray-400">{item.category}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">{item.weight.toLocaleString('pt-BR')} kg</td>
                        <td className="px-6 py-4 font-medium text-gray-700">R$ {item.pricePerKgCompra.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-black text-blue-600">R$ {item.subtotal.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => removePurchaseItem(index)}
                            className="h-8 w-8 inline-flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Resumo da Compra Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden lg:sticky lg:top-8 animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
               <h3 className="font-bold text-gray-900 flex items-center gap-2">
                 Resumo do Lote
               </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Fornecedor Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Fornecedor (Opcional)
                </label>
                <Select
                  showSearch
                  placeholder="Selecione o fornecedor"
                  className="w-full h-11"
                  variant="borderless"
                  style={{ background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6' }}
                  value={selectedSupplier || undefined}
                  onChange={(value) => setSelectedSupplier(value)}
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={fornecedores.map((f) => ({
                    value: f.name,
                    label: f.name,
                  }))}
                />
                {!selectedSupplier && (
                  <div className="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                      ⚠️ Compra Avulsa
                    </p>
                    <p className="text-[11px] leading-relaxed">Nenhum fornecedor selecionado. A transação será registrada como balcão.</p>
                  </div>
                )}
              </div>

              {/* Dynamic Totals */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Total Itens</span>
                  <span className="font-black text-gray-900">{purchaseItems.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Peso Total</span>
                  <span className="font-black text-gray-900">
                    {purchaseItems.reduce((sum, i) => sum + i.weight, 0).toLocaleString('pt-BR')} kg
                  </span>
                </div>
                
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-green-50/50 rounded-2xl border border-green-100/50">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Valor Total à Pagar</span>
                    <span className="text-4xl font-black text-green-700">
                      R$ {getTotalPurchase().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={finalizePurchase}
                    disabled={purchaseItems.length === 0}
                    className={`w-full h-14 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                      purchaseItems.length > 0
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Finalizar e Imprimir
                  </button>
                  <p className="text-[10px] text-gray-400 text-center font-bold">
                    O ESTOQUE SERÁ INCREMENTADO AUTOMATICAMENTE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}