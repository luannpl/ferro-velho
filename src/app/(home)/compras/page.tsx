"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Combobox } from "@headlessui/react";
import { FornecedorData } from "@/types";

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

  // fornecedor escolhido para a nota (resumo)
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  // queries para autocompletes
  const [productQuery, setProductQuery] = useState("");
  const [supplierQuery, setSupplierQuery] = useState("");

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

  const filteredProducts =
    productQuery === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(productQuery.toLowerCase())
        );

  const filteredSuppliers =
    supplierQuery === ""
      ? fornecedores
      : fornecedores.filter((s) =>
          s.name.toLowerCase().includes(supplierQuery.toLowerCase())
        );

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

    // limpa apenas os campos do item (mantemos selectedSupplier)
    setPurchaseForm({
      productName: "",
      category: "",
      weight: "",
      pricePerKg: "",
    });
    setProductQuery("");
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

    const totalPeso = purchaseItems.reduce((sum, i) => sum + i.weight, 0);
    const totalValor = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

    const payload = {
      fornecedorId: fornecedor.id,
      totalItens: purchaseItems.length,
      pesoTotal: totalPeso,
      valorTotal: totalValor,
      dataCompra: new Date(),
      // itens: purchaseItems.map((item) => ({
      //   produtoId: products.find((p) => p.name === item.productName)?.id,
      //   peso: item.weight,
      //   precoKg: item.pricePerKg,
      //   subtotal: item.subtotal,
      // })),
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
        alert("Compra registrada com sucesso!");
        // limpa tudo
        setPurchaseItems([]);
        setSelectedSupplier("");
        setPurchaseForm({
          productName: "",
          category: "",
          weight: "",
          pricePerKg: "",
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
      {/* Formulário de Compra (itens) */}
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold mb-6">Nova Compra</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Adicionar Item</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produto (autocomplete) */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto *
              </label>
              <Combobox
                value={purchaseForm.productName}
                onChange={(value) => {
                  const selected = products.find((p) => p.name === value);
                  setPurchaseForm((prev) => ({
                    ...prev,
                    productName: value || "",
                    category: selected?.category || "",
                    pricePerKg: selected
                      ? String(selected.pricePerKg)
                      : prev.pricePerKg,
                  }));
                }}
              >
                <div className="relative">
                  <Combobox.Input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Selecione o produto"
                    displayValue={(v: string) => v}
                    onChange={(e) => setProductQuery(e.target.value)}
                  />
                  {filteredProducts.length > 0 && (
                    <Combobox.Options className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredProducts.map((product) => (
                        <Combobox.Option
                          key={product.id}
                          value={product.name}
                          className={({ active }) =>
                            `cursor-pointer select-none px-3 py-2 ${
                              active ? "bg-blue-100" : ""
                            }`
                          }
                        >
                          <div className="flex justify-between">
                            <span>{product.name}</span>
                            <span className="text-sm text-gray-500">
                              R$ {product.pricePerKg}
                            </span>
                          </div>
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            </div>

            {/* Categoria (apenas visual, preenchida automaticamente) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={purchaseForm.category}
                onChange={(e) =>
                  setPurchaseForm({ ...purchaseForm, category: e.target.value })
                }
                placeholder="Categoria"
                className="w-full border rounded-lg px-3 py-2 bg-white"
                readOnly
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg) *
              </label>
              <input
                type="number"
                value={purchaseForm.weight}
                onChange={(e) =>
                  setPurchaseForm({ ...purchaseForm, weight: e.target.value })
                }
                placeholder="0.00"
                step="0.1"
                min="0"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Preço por KG */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço por kg *
              </label>
              <input
                type="number"
                value={purchaseForm.pricePerKg}
                onChange={(e) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    pricePerKg: e.target.value,
                  })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2"
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

        {/* Tabela de Itens (sem fornecedor por item) */}
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

      {/* Resumo da Compra (aqui escolhe o fornecedor) */}
      <div className="lg:col-span-1 mt-[60px]">
        <div className="bg-white rounded-lg shadow p-6 sticky top-6">
          <h3 className="text-xl font-bold mb-4">Resumo da Compra</h3>

          {/* Combobox do Fornecedor (no resumo) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fornecedor *
            </label>
            <Combobox
              value={selectedSupplier}
              onChange={(v) => setSelectedSupplier(v || "")}
            >
              <div className="relative">
                <Combobox.Input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Selecione o fornecedor"
                  displayValue={(v: string) => v}
                  onChange={(e) => setSupplierQuery(e.target.value)}
                />
                {filteredSuppliers.length > 0 && (
                  <Combobox.Options className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredSuppliers.map((s) => (
                      <Combobox.Option
                        key={s.id}
                        value={s.name}
                        className={({ active }) =>
                          `cursor-pointer select-none px-3 py-2 ${
                            active ? "bg-blue-100" : ""
                          }`
                        }
                      >
                        {s.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
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
