"use client";
import { useEffect, useState } from "react";
import { ArrowRightLeft, Package } from "lucide-react";
import { Combobox } from "@headlessui/react";

interface TransferItem {
  productOrigin: string;
  productDestination: string;
  weight: number;
  categoryOrigin: string;
  categoryDestination: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  weight?: number;
  pricePerKg: number;
  stock?: number;
}

export default function TransferenciaPage() {
  const [transferForm, setTransferForm] = useState({
    productOrigin: "",
    categoryOrigin: "",
    productDestination: "",
    categoryDestination: "",
    weight: "",
  });

  const [currentTransferItem, setCurrentTransferItem] =
    useState<TransferItem | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productOriginQuery, setProductOriginQuery] = useState("");
  const [productDestinationQuery, setProductDestinationQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const productsRes = await fetch("/api/products");

        if (!productsRes.ok) {
          console.error("Erro carregando produtos");
          return;
        }

        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    fetchData();
  }, []);

  const filteredProductsOrigin =
    productOriginQuery === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(productOriginQuery.toLowerCase())
        );

  const filteredProductsDestination =
    productDestinationQuery === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(productDestinationQuery.toLowerCase())
        );

  // 🔵 Abrir modal com resumo
  const openSummaryModal = () => {
    if (
      !transferForm.productOrigin ||
      !transferForm.productDestination ||
      !transferForm.weight
    ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const weight = parseFloat(transferForm.weight);

    if (isNaN(weight)) {
      alert("Peso inválido");
      return;
    }

    if (transferForm.productOrigin === transferForm.productDestination) {
      alert("Os produtos de origem e destino devem ser diferentes!");
      return;
    }

    const item: TransferItem = {
      productOrigin: transferForm.productOrigin,
      productDestination: transferForm.productDestination,
      weight,
      categoryOrigin: transferForm.categoryOrigin || "Sem categoria",
      categoryDestination: transferForm.categoryDestination || "Sem categoria",
    };

    setCurrentTransferItem(item);
    setModalOpen(true);
  };

  // 🔵 Finalizar transferência
  const finalizeTransfer = async () => {
    if (!currentTransferItem) return;

    const { productOrigin, productDestination, weight } = currentTransferItem;

    // 💡 Payload simplificado para enviar apenas os 3 campos
    const payload = {
      productOriginId: products.find((p) => p.name === productOrigin)?.id,
      productDestinationId: products.find((p) => p.name === productDestination)
        ?.id,
      quantity: weight,
    };

    try {
      // Enviando para a rota que você especificou
      const res = await fetch("/api/products/transferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Transferência registrada com sucesso!");

        setTransferForm({
          productOrigin: "",
          categoryOrigin: "",
          productDestination: "",
          categoryDestination: "",
          weight: "",
        });

        setCurrentTransferItem(null);
        setModalOpen(false);
      } else {
        alert("Erro ao salvar: " + (result?.error || "Erro desconhecido"));
      }
    } catch (err) {
      alert("Erro ao salvar a transferência.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário */}
      {/* AQUI A MUDANÇA: lg:col-span-2 foi alterado para lg:col-span-3 */}
      <div className="lg:col-span-3">
        <h2 className="text-3xl font-bold mb-6">Nova Transferência</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Informações</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produto Origem */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Produto de Origem *
              </label>

              <Combobox
                value={transferForm.productOrigin}
                onChange={(value) => {
                  const selected = products.find((p) => p.name === value);
                  setTransferForm((prev) => ({
                    ...prev,
                    productOrigin: value || "",
                    categoryOrigin: selected?.category || "",
                  }));
                }}
              >
                <div className="relative">
                  <Combobox.Input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Selecione"
                    displayValue={(v: string) => v}
                    onChange={(e) => setProductOriginQuery(e.target.value)}
                  />
                  {filteredProductsOrigin.length > 0 && (
                    <Combobox.Options className="absolute bg-white border rounded mt-1 max-h-60 overflow-auto w-full z-10">
                      {filteredProductsOrigin.map((product) => (
                        <Combobox.Option
                          key={product.id}
                          value={product.name}
                          className={({ active }) =>
                            `cursor-pointer px-3 py-2 ${
                              active ? "bg-blue-100" : ""
                            }`
                          }
                        >
                          <div className="flex justify-between">
                            <span>{product.name}</span>
                            <span className="text-gray-500 text-sm">
                              {product.category}
                            </span>
                          </div>
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            </div>

            {/* Categoria Origem */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categoria Origem
              </label>
              <input
                type="text"
                value={transferForm.categoryOrigin}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Produto Destino */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Produto de Destino *
              </label>

              <Combobox
                value={transferForm.productDestination}
                onChange={(value) => {
                  const selected = products.find((p) => p.name === value);
                  setTransferForm((prev) => ({
                    ...prev,
                    productDestination: value || "",
                    categoryDestination: selected?.category || "",
                  }));
                }}
              >
                <div className="relative">
                  <Combobox.Input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Selecione"
                    displayValue={(v: string) => v}
                    onChange={(e) => setProductDestinationQuery(e.target.value)}
                  />
                  {filteredProductsDestination.length > 0 && (
                    <Combobox.Options className="absolute bg-white border rounded mt-1 max-h-60 overflow-auto w-full z-10">
                      {filteredProductsDestination.map((product) => (
                        <Combobox.Option
                          key={product.id}
                          value={product.name}
                          className={({ active }) =>
                            `cursor-pointer px-3 py-2 ${
                              active ? "bg-blue-100" : ""
                            }`
                          }
                        >
                          <div className="flex justify-between">
                            <span>{product.name}</span>
                            <span className="text-gray-500 text-sm">
                              {product.category}
                            </span>
                          </div>
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            </div>

            {/* Categoria Destino */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categoria Destino
              </label>
              <input
                type="text"
                value={transferForm.categoryDestination}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Peso */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Peso (kg) *
              </label>
              <input
                type="number"
                value={transferForm.weight}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, weight: e.target.value })
                }
                placeholder="0.00"
                step="0.1"
                min="0"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Botão Finalizar */}
          <button
            onClick={openSummaryModal}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 cursor-pointer"
          >
            <ArrowRightLeft size={20} />
            <span>Finalizar Transferência</span>
          </button>
        </div>
      </div>

      {/* 🔵 MODAL */}
      {modalOpen && currentTransferItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirmar Transferência</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Origem:</strong> {currentTransferItem.productOrigin}
              </p>
              <p>
                <strong>Categoria Origem:</strong>{" "}
                {currentTransferItem.categoryOrigin}
              </p>
              <p>
                <strong>Destino:</strong>{" "}
                {currentTransferItem.productDestination}
              </p>
              <p>
                <strong>Categoria Destino:</strong>{" "}
                {currentTransferItem.categoryDestination}
              </p>
              <p>
                <strong>Peso:</strong> {currentTransferItem.weight} kg
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={finalizeTransfer}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
