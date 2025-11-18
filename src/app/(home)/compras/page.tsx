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

    // --- Cálculos corretos ---
    const totalPeso = purchaseItems.reduce((sum, i) => sum + i.weight, 0);
    const totalValor = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

    // --- DADOS MOCKADOS PARA TESTE ---
    const mockPedidoId = 8092; // ID do pedido falso
    // ----------------------------------

    try {
      // --- Preparar dados para impressão (com mock) ---
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

      // --- Início da Geração de Texto Puro ---

      // --- Definição das Colunas (em caracteres) ---
      const COL_DESC = 18; // Descrição
      const COL_VLR = 8;   // Vlr/KG
      const COL_KG = 8;    // KG
      const COL_VAL = 8;   // Valor
      // Largura total em caracteres
      const TOTAL_WIDTH = COL_DESC + COL_VLR + COL_KG + COL_VAL; // 42

      // --- Funções Auxiliares de Padding ---
      const padRight = (str: string, len: number) =>
        (String(str) + " ".repeat(len)).substring(0, len);
        
      const padLeft = (str: string, len: number) =>
        (" ".repeat(len) + String(str)).slice(-len);

      const center = (str: string) => {
        const padding = Math.floor((TOTAL_WIDTH - str.length) / 2);
        return padLeft(str, str.length + padding).padEnd(TOTAL_WIDTH);
      }

      // --- Montagem do Cupom (Linha por Linha) ---
      let cupomTexto = "";
      // const linha = "-".repeat(TOTAL_WIDTH) + "\n";
      const linhaTracejada = "- ".repeat(TOTAL_WIDTH / 2).trim() + "\n";

      // Cabeçalho com bordas
      cupomTexto += center("OR OSVALDO RECICLAGENS") + "\n";
      cupomTexto += "\n";
      cupomTexto += "\n";
      cupomTexto += center("Rua Tenente Joao Abano N 106") + "\n";
      cupomTexto += center("Aerolandia - Fortaleza") + "\n";
      cupomTexto += center("CEP: 60850710 / Fone: 85991566566") + "\n";
      cupomTexto += "\n";
      cupomTexto += linhaTracejada;
      cupomTexto += center("DEUS lhe guarde e proteja") + "\n";
      cupomTexto += center("Jesus e o caminho, a verdade e a vida!") + "\n";
      cupomTexto += linhaTracejada;

      // Informações do pedido
      cupomTexto += padRight(`Pedido: ${mockPedidoId}`, TOTAL_WIDTH) + "\n";
      cupomTexto += padRight(`Usuario: ${printPayload.fornecedor.nome}`, TOTAL_WIDTH) + "\n";
      cupomTexto += padRight(`${printPayload.dataCompra}`, TOTAL_WIDTH) + "\n";
      cupomTexto += "\n";
      cupomTexto += linhaTracejada;

      // Cabeçalho da Tabela
      const header =
        padRight("Descrição", COL_DESC) +
        padLeft("Vlr. KG", COL_VLR) +
        padLeft("KG", COL_KG) +
        padLeft("Valor", COL_VAL);
      cupomTexto += header + "\n";

      // Itens (LOOP)
      printPayload.itens.forEach((i) => {
        const nome = padRight(i.nome.substring(0, COL_DESC), COL_DESC); 
        const vlr = padLeft(i.precoUnitario.toFixed(2), COL_VLR);
        const kg = padLeft(i.quantidade.toFixed(3), COL_KG);
        const val = padLeft(i.precoTotal.toFixed(2), COL_VAL);
        cupomTexto += `${nome}${vlr}${kg}${val}` + "\n";
      });

      cupomTexto += "\n";
      cupomTexto += linhaTracejada;

      // Totais
      const totalPesoStr = `Total Peso Kg: ${totalPeso.toFixed(3)}`;
      cupomTexto += padLeft(totalPesoStr, TOTAL_WIDTH) + "\n";
      cupomTexto += "\n";

      const totalValorStr = `Total R$ ${printPayload.valorTotal.toFixed(2)}`;
      cupomTexto += padLeft(totalValorStr, TOTAL_WIDTH) + "\n";

      const dinheiroStr = `Dinheiro R$ ${printPayload.valorTotal.toFixed(2)}`;
      cupomTexto += padLeft(dinheiroStr, TOTAL_WIDTH) + "\n";
      cupomTexto += "\n";

      cupomTexto += linhaTracejada;
      cupomTexto += center("PRSystem Solutions") + "\n";
      cupomTexto += center("Precisando de solucoes em tecnologia?") + "\n";
      cupomTexto += center("Entre em contato conosco!") + "\n";
      cupomTexto += center("(85) 984141305 - @prsystemsolution") + "\n";
      cupomTexto += "\n";
      cupomTexto += center(new Date().toLocaleString("pt-BR")) + "\n";
      cupomTexto += "\n";
      cupomTexto += "\n\n\n";
      cupomTexto += "\n"
      cupomTexto += "\n"
      cupomTexto += "\n"
      cupomTexto += "\n"
      cupomTexto += "\n";    // Linha em branco
      cupomTexto += ".\n";   // Avança 1
      cupomTexto += ".\n";   // Avança 2
      cupomTexto += ".\n";   // Avança 3
      cupomTexto += ".\n";   // Avança 4
      cupomTexto += ".\n";   // Avança 5
      cupomTexto += ".\n";   // Avança 6
      cupomTexto += ".\n";   // Avança 7


      // --- Fim da Geração de Texto Puro ---

      const cupomHTML = `
<html>
  <head>
    <title>Cupom - ${printPayload.ferroVelho}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      body {
        font-family: 'Courier New', monospace;
        font-size: 10px;
        width: 80mm;
        margin: 0;
        padding: 5px;
        color: #000;
        box-sizing: border-box; 
      }
      pre {
        font-family: 'Courier New', monospace;
        font-size: 10px;
        margin: 0;
        padding: 0;
        white-space: pre; 
        word-wrap: normal;
        padding-bottom: 100px;
      }
    </style>
  </head>
  <body>
    <pre>${cupomTexto}</pre>
  </body>
</html>
`;

      const win = window.open("", "_blank", "width=400,height=600");
      if (!win) return alert("Pop-up bloqueado! Permita pop-ups para imprimir.");

      win.document.open();
      win.document.write(cupomHTML);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    } catch (err) {
      console.error("Erro ao imprimir (mock):", err);
      alert("Erro ao imprimir a compra.");
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