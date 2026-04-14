"use client";
import { useEffect, useState } from "react";
import { ArrowRightLeft} from "lucide-react";
import { Combobox } from "@headlessui/react";
import { toast } from "sonner";

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
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const weight = parseFloat(transferForm.weight);

    if (isNaN(weight)) {
      toast.error("Peso inválido");
      return;
    }

    if (transferForm.productOrigin === transferForm.productDestination) {
      toast.error("Os produtos de origem e destino devem ser diferentes!");
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

    // Enviando para a rota que você especificou
    const res = await fetch("/api/products/transferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (res.ok) {
      toast.success("Transferência registrada com sucesso!");

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
      toast.error("Erro ao salvar: " + (result?.error || "Erro desconhecido"));
    }

  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Movimentação Interna</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Transfira estoque entre diferentes tipos de materiais</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 items-center px-4 h-12">
          <ArrowRightLeft className="text-blue-500 mr-2" size={20} />
          <span className="text-sm font-bold text-gray-700">Ajuste de Estoque</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
             <h3 className="font-bold text-gray-900">Configurar Transferência</h3>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Seção de Origem */}
              <div className="space-y-6 p-6 bg-red-50/30 rounded-3xl border border-red-100/50">
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-8 w-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-black text-xs">A</div>
                   <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Material de Origem</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionar Material</label>
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
                          className="w-full h-12 bg-white border border-red-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-red-50 focus:border-red-400 outline-none transition-all shadow-sm"
                          placeholder="Pesquisar material..."
                          displayValue={(v: string) => v || ""}
                          onChange={(e) => setProductOriginQuery(e.target.value)}
                        />
                        <Combobox.Options className="absolute mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden outline-none">
                          {filteredProductsOrigin.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400">Nenhum material encontrado</div>
                          ) : (
                            filteredProductsOrigin.map((product) => (
                              <Combobox.Option
                                key={product.id}
                                value={product.name}
                                className={({ active }) =>
                                  `cursor-pointer px-4 py-3 text-sm font-medium transition-all ${
                                    active ? "bg-red-50 text-red-600" : "text-gray-700"
                                  }`
                                }
                              >
                                <div className="flex justify-between items-center">
                                  <span>{product.name}</span>
                                  <span className="text-[10px] font-black opacity-50 uppercase">{product.category}</span>
                                </div>
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </div>
                    </Combobox>
                  </div>

                  <div className="space-y-2 text-[10px] font-bold text-red-400 bg-white/50 p-3 rounded-xl border border-red-50">
                    CATEGORIA: {transferForm.categoryOrigin || "NENHUMA SELECIONADA"}
                  </div>
                </div>
              </div>

              {/* Seção de Destino */}
              <div className="space-y-6 p-6 bg-green-50/30 rounded-3xl border border-green-100/50">
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-black text-xs">B</div>
                   <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Material de Destino</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionar Material</label>
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
                          className="w-full h-12 bg-white border border-green-100 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-green-50 focus:border-green-400 outline-none transition-all shadow-sm"
                          placeholder="Pesquisar material..."
                          displayValue={(v: string) => v || ""}
                          onChange={(e) => setProductDestinationQuery(e.target.value)}
                        />
                        <Combobox.Options className="absolute mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden outline-none">
                          {filteredProductsDestination.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400">Nenhum material encontrado</div>
                          ) : (
                            filteredProductsDestination.map((product) => (
                              <Combobox.Option
                                key={product.id}
                                value={product.name}
                                className={({ active }) =>
                                  `cursor-pointer px-4 py-3 text-sm font-medium transition-all ${
                                    active ? "bg-green-50 text-green-600" : "text-gray-700"
                                  }`
                                }
                              >
                                <div className="flex justify-between items-center">
                                  <span>{product.name}</span>
                                  <span className="text-[10px] font-black opacity-50 uppercase">{product.category}</span>
                                </div>
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </div>
                    </Combobox>
                  </div>

                  <div className="space-y-2 text-[10px] font-bold text-green-500 bg-white/50 p-3 rounded-xl border border-green-50">
                    CATEGORIA: {transferForm.categoryDestination || "NENHUMA SELECIONADA"}
                  </div>
                </div>
              </div>

              {/* Peso da Transferência */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-center">Quantidade para Transferir (KG)</label>
                <div className="max-w-xs mx-auto relative group">
                  <input
                    type="number"
                    value={transferForm.weight}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, weight: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.1"
                    min="0"
                    className="w-full h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6 text-2xl font-black text-center text-blue-600 focus:bg-white focus:border-blue-500 focus:border-solid outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">KG</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8 border-t border-gray-50">
              <button
                onClick={openSummaryModal}
                className="h-16 px-12 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95"
              >
                <ArrowRightLeft size={24} />
                Confirmar Movimentação
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔵 MODAL DE RESUMO */}
      {modalOpen && currentTransferItem && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRightLeft size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Revisar Transferência</h2>
                <p className="text-sm font-medium text-gray-500">Confirme os detalhes antes de processar</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* De -> Para Visual */}
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Saída de Estoque</p>
                    <p className="font-bold text-gray-900">{currentTransferItem.productOrigin}</p>
                    <p className="text-xs text-red-500 font-medium">{currentTransferItem.categoryOrigin}</p>
                  </div>

                  <div className="flex justify-center relative h-4">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2"></div>
                    <div className="relative bg-white px-3 text-gray-300 font-black text-[10px] uppercase">Para</div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Entrada de Estoque</p>
                    <p className="font-bold text-gray-900">{currentTransferItem.productDestination}</p>
                    <p className="text-xs text-green-600 font-medium">{currentTransferItem.categoryDestination}</p>
                  </div>
                </div>

                <div className="mt-4 p-6 bg-gray-50 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume Total</p>
                  <p className="text-4xl font-black text-gray-900">{currentTransferItem.weight.toLocaleString('pt-BR')} <span className="text-lg opacity-30">KG</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 h-14 rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all order-2 sm:order-1"
                  onClick={() => setModalOpen(false)}
                >
                  Voltar e Ajustar
                </button>

                <button
                  className="flex-1 h-14 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 order-1 sm:order-2 active:scale-95"
                  onClick={finalizeTransfer}
                >
                  Processar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
