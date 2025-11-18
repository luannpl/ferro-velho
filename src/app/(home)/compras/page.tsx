"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Input, Select } from "antd";

import { CompraDataResponse, FornecedorData } from "@/types";

interface CupomItem {
  nome: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

interface CupomData {
  ferroVelho: string;
  dataCompra: string;
  totalItens: number;
  valorTotal: number;
  fornecedor: { nome: string; telefone?: string };
  itens: CupomItem[];
}

interface PurchaseItem {
  productName: string;
  category: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  weight?: number;
  pricePerKg: number;
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
    pricePerKg: "",
  });

  const [fornecedores, setFornecedores] = useState<FornecedorData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, fornecedoresRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/fornecedores"),
        ]);

        if (!productsRes.ok || !fornecedoresRes.ok) {
          console.error("Erro carregando produtos ou fornecedores.");
          return;
        }

        const [productsData, fornecedoresData] = await Promise.all([
          productsRes.json(),
          fornecedoresRes.json(),
        ]);

        setProducts(productsData);
        setFornecedores(fornecedoresData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    fetchData();
  }, []);

  const addPurchaseItem = () => {
    if (
      !purchaseForm.productName ||
      !purchaseForm.weight ||
      !purchaseForm.pricePerKg
    ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const weight = parseFloat(purchaseForm.weight);
    const pricePerKg = parseFloat(purchaseForm.pricePerKg);

    if (isNaN(weight) || isNaN(pricePerKg)) {
      alert("Peso ou preço inválido");
      return;
    }

    const newItem: PurchaseItem = {
      productName: purchaseForm.productName,
      category: purchaseForm.category || "Sem categoria",
      weight,
      pricePerKg,
      subtotal: +(weight * pricePerKg).toFixed(2),
    };

    setPurchaseItems((prev) => [...prev, newItem]);

    setPurchaseForm({
      productName: "",
      category: "",
      weight: "",
      pricePerKg: "",
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
    // Alteração: Substituído 'alert()' por 'console.error()' ou implementação de modal UI customizado, conforme as boas práticas do ambiente Canvas.
    const customAlert = (message: string) => console.error("Aviso:", message);

    if (purchaseItems.length === 0) {
      customAlert("Adicione itens à compra!");
      return;
    }

    if (!selectedSupplier) {
      customAlert("Selecione um fornecedor para a nota antes de finalizar.");
      return;
    }

    const fornecedor = fornecedores.find((f) => f.name === selectedSupplier);
    if (!fornecedor) {
      customAlert("Fornecedor selecionado inválido.");
      return;
    }

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
        precoKg: item.pricePerKg,
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
      fornecedorId: fornecedor.id,
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
        fornecedor: {
          nome: fornecedor.name,
          telefone: fornecedor.telefone,
        },
        itens: purchaseItems.map((i) => ({
          nome: i.productName,
          quantidade: i.weight,
          precoUnitario: i.pricePerKg,
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
        console.error("Pop-up bloqueado! Permita pop-ups para imprimir.");
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
      console.error("Erro ao imprimir:", err);
      console.error("Erro ao imprimir a compra.");
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold mb-6">Nova Compra</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Adicionar Item</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produto (Select do AntD) */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto *
              </label>

              <Select
                showSearch
                placeholder="Selecione o produto"
                style={{ width: "100%" }}
                value={purchaseForm.productName || undefined}
                onChange={(value: string) => {
                  const selected = products.find((p) => p.name === value);
                  setPurchaseForm((prev) => ({
                    ...prev,
                    productName: value,
                    category: selected?.category || "",
                    pricePerKg: selected
                      ? String(selected.pricePerKg)
                      : prev.pricePerKg,
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
                  label: `${product.name}`,
                }))}
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <Input
                value={purchaseForm.category}
                readOnly
                placeholder="Categoria"
                className="!bg-gray-100"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg) *
              </label>
              <Input
                type="number"
                value={purchaseForm.weight}
                onChange={(e) =>
                  setPurchaseForm({ ...purchaseForm, weight: e.target.value })
                }
                placeholder="0.00"
                min={0}
                step="0.1"
              />
            </div>

            {/* Preço por KG */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço por kg *
              </label>
              <Input
                type="number"
                value={purchaseForm.pricePerKg}
                onChange={(e) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    pricePerKg: e.target.value,
                  })
                }
                placeholder="0.00"
                min={0}
                step="0.01"
              />
            </div>
          </div>

          <button
            onClick={addPurchaseItem}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 cursor-pointer"
          >
            <Plus size={20} />
            <span>Adicionar à Compra</span>
          </button>
        </div>

        {/* Tabela de Itens */}
        {purchaseItems.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Itens da Compra</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Peso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Preço/kg
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">{item.weight} kg</td>
                      <td className="px-4 py-3">
                        R$ {item.pricePerKg.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        R$ {item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removePurchaseItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
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

      {/* Resumo da Compra (fornecedor) */}
      <div className="lg:col-span-1 mt-[60px]">
        <div className="bg-white rounded-lg shadow p-6 sticky top-6">
          <h3 className="text-xl font-bold mb-4">Resumo da Compra</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fornecedor *
            </label>
            <Select
              showSearch
              placeholder="Selecione o fornecedor"
              style={{ width: "100%" }}
              value={selectedSupplier || undefined}
              onChange={(value) => setSelectedSupplier(value)}
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
          </div>

          {purchaseItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500">Nenhum item adicionado</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de itens:</span>
                  <span className="font-semibold">{purchaseItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Peso total:</span>
                  <span className="font-semibold">
                    {purchaseItems
                      .reduce((sum, i) => sum + i.weight, 0)
                      .toFixed(2)}{" "}
                    kg
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {getTotalPurchase().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={finalizePurchase}
                className={`w-full py-3 rounded-lg font-bold ${
                  selectedSupplier
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-700 cursor-not-allowed"
                }`}
                disabled={!selectedSupplier}
              >
                Finalizar Compra
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                O estoque será atualizado automaticamente
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}