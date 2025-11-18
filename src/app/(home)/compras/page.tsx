"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Input, Select } from "antd";

import { FornecedorData } from "@/types";

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
          console.error("Erro carregando produtos ou fornecedores");
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

  // --- NOVA FUNÇÃO imprimirCupom usando window.print() em nova janela ---
  async function imprimirCupom(dados: CupomData) {
    // monta HTML do cupom otimizado para 80mm
    const cupomHTML = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Cupom - ${dados.ferroVelho}</title>
        <style>
          /* Página e dimensões para bobina 80mm */
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
          }

          body {
            width: 80mm;
            margin: 0;
            padding: 6px 8px;
            font-family: "Courier New", monospace;
            font-size: 12px;
            color: #000;
          }

          .titulo {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 6px;
          }

          .subtitulo {
            text-align: center;
            font-size: 11px;
            margin-bottom: 6px;
          }

          .linha {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }

          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            word-break: break-word;
          }

          .item-left {
            max-width: 58mm;
          }

          .totais {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 8px;
          }

          .small {
            font-size: 11px;
          }

          .center {
            text-align: center;
          }

          /* Remove elementos indesejáveis quando imprimir via browser */
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>

      <body>
        <div class="titulo">${dados.ferroVelho}</div>

        <div class="subtitulo small">
          Data: ${dados.dataCompra} <br/>
          Fornecedor: ${dados.fornecedor.nome}
        </div>

        <div class="linha"></div>

        <div><strong>Itens</strong></div>

        ${dados.itens
          .map(
            (i) => `
          <div class="item">
            <div class="item-left">
              ${i.nome} (${i.quantidade}kg)
            </div>
            <div class="item-right">
              R$ ${i.precoTotal.toFixed(2)}
            </div>
          </div>
        `
          )
          .join("")}

        <div class="linha"></div>

        <div class="totais">
          <div>Total de itens: ${dados.totalItens}</div>
          <div>R$ ${dados.valorTotal.toFixed(2)}</div>
        </div>

        <div class="linha"></div>

        <div class="center small" style="margin-top:8px;">
          Obrigado pela preferência!
        </div>
      </body>
    </html>
  `;

    // abre nova janela e escreve o HTML
    const win = window.open("", "_blank", "width=400,height=600");

    if (!win) {
      alert("Pop-up bloqueado! Permita pop-ups para imprimir.");
      return;
    }

    win.document.open();
    win.document.write(cupomHTML);
    win.document.close();

    // aguarda carregar e dispara impressão
    // adiciona timeout curto caso onload não seja confiável
    const tryPrint = () => {
      try {
        win.focus();
        win.print();
        // fecha a janela 1s depois para garantir que a impressão foi iniciada
        setTimeout(() => {
          try {
            win.close();
          } catch (e) {
            /* ignore */
          }
        }, 1000);
      } catch (err) {
        console.error("Erro ao imprimir cupom:", err);
        alert("Erro ao imprimir cupom: " + (err as any).toString());
      }
    };

    // se evento onload estiver disponível, usa; senão, tenta após 500ms
    if (win.document.readyState === "complete") {
      tryPrint();
    } else {
      win.onload = tryPrint;
      // fallback
      setTimeout(() => {
        if (!win.closed) tryPrint();
      }, 700);
    }
  }
  // --- FIM imprimirCupom ---

  const finalizePurchase = async () => {
    if (purchaseItems.length === 0) {
      alert("Adicione itens à compra!");
      return;
    }

    if (!selectedSupplier) {
      alert("Selecione um fornecedor para a nota antes de finalizar.");
      return;
    }

    const fornecedor = fornecedores.find((f) => f.name === selectedSupplier);
    if (!fornecedor) {
      alert("Fornecedor selecionado inválido.");
      return;
    }

    // 1. Mapear purchaseItems para o formato de ItemCompraData, buscando o ID
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

    // 2. Calcular Totais
    const totalPeso = itensCompraData.reduce((sum, i) => sum + i.peso, 0);
    const totalValor = itensCompraData.reduce((sum, i) => sum + i.subtotal, 0);

    // 3. Montar o Payload COMPLETO, incluindo 'itens'
    const payload = {
      fornecedorId: fornecedor.id,
      totalItens: itensCompraData.length,
      pesoTotal: totalPeso,
      valorTotal: totalValor,
      dataCompra: new Date(),
      // NOVO: Adicione o array de itens mapeados
      itens: itensCompraData,
    };

    console.log("Payload da compra:", payload);

    try {
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        const printPayload: CupomData = {
          ferroVelho: "Oswaldo Reciclagens",
          dataCompra: new Date().toLocaleString("pt-BR"),
          totalItens: purchaseItems.length,
          valorTotal: totalValor,
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

        // chama a função de impressão (abre a caixa de diálogo do navegador)
        await fetch("/api/imprimir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(printPayload),
        });
      } else {
        console.error("Erro ao salvar compra:", result);
        alert("Erro ao salvar: " + (result?.error || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("Erro ao salvar compra:", err);
      alert("Erro ao salvar a compra.");
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
