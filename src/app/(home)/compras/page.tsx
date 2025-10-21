'use client";'
import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";

interface PurchaseItem {
    productName: string;
    category: string;
    weight: number;
    pricePerKg: number;
    subtotal: number;
    supplier: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
  stock: number;
}

export default function ComprasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
    const [purchaseForm, setPurchaseForm] = useState({
        productName: "",
        category: "",
        weight: "",
        pricePerKg: "",
        supplier: "",
    });
    const [products, setProducts] = useState<Product[]>([
        {
            id: 1,
            name: "Ferro",
            category: "Metais",
            weight: 150,
            pricePerKg: 2.5,
            stock: 150,
        },
        {
            id: 2,
            name: "Alumínio",
            category: "Metais",
            weight: 80,
            pricePerKg: 5.8,
            stock: 80,
        },
        {
            id: 3,
            name: "Cobre",
            category: "Metais",
            weight: 45,
            pricePerKg: 25.0,
            stock: 45,
        },
    ]);

    const addPurchaseItem = () => {
        if (
            !purchaseForm.productName ||
            !purchaseForm.weight ||
            !purchaseForm.pricePerKg
        ) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const newItem: PurchaseItem = {
            productName: purchaseForm.productName,
            category: purchaseForm.category || "Sem categoria",
            weight: parseFloat(purchaseForm.weight),
            pricePerKg: parseFloat(purchaseForm.pricePerKg),
            subtotal:
                parseFloat(purchaseForm.weight) * parseFloat(purchaseForm.pricePerKg),
            supplier: purchaseForm.supplier || "Não informado",
        };

        setPurchaseItems([...purchaseItems, newItem]);
        setPurchaseForm({
            productName: "",
            category: "",
            weight: "",
            pricePerKg: "",
            supplier: "",
        });
    };

    const removePurchaseItem = (index: number) => {
        setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    };

    const getTotalPurchase = () => {
        return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const finalizePurchase = () => {
        if (purchaseItems.length === 0) {
            alert("Adicione itens à compra!");
            return;
        }
        alert(
            `Compra finalizada! Total: R$ ${getTotalPurchase().toFixed(
                2
            )}\nEstoque será atualizado.`
        );
        setPurchaseItems([]);
    };

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de Compra */}
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-6">Nova Compra</h2>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Adicionar Item</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Produto *
                            </label>
                            <input
                                type="text"
                                value={purchaseForm.productName}
                                onChange={(e) =>
                                    setPurchaseForm({
                                        ...purchaseForm,
                                        productName: e.target.value,
                                    })
                                }
                                placeholder="Nome do produto"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoria
                            </label>
                            <input
                                type="text"
                                value={purchaseForm.category}
                                onChange={(e) =>
                                    setPurchaseForm({
                                        ...purchaseForm,
                                        category: e.target.value,
                                    })
                                }
                                placeholder="Ex: Metais, Plásticos"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fornecedor
                            </label>
                            <input
                                type="text"
                                value={purchaseForm.supplier}
                                onChange={(e) =>
                                    setPurchaseForm({
                                        ...purchaseForm,
                                        supplier: e.target.value,
                                    })
                                }
                                placeholder="Nome do fornecedor"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Peso (kg) *
                            </label>
                            <input
                                type="number"
                                value={purchaseForm.weight}
                                onChange={(e) =>
                                    setPurchaseForm({
                                        ...purchaseForm,
                                        weight: e.target.value,
                                    })
                                }
                                placeholder="0.00"
                                step="0.1"
                                min="0"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
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
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Adicionar à Compra</span>
                    </button>
                </div>

                {/* Lista de Itens da Compra */}
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
                                            Fornecedor
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
                                            <td className="px-4 py-3">{item.supplier}</td>
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

            {/* Resumo da Compra */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                    <h3 className="text-xl font-bold mb-4">Resumo da Compra</h3>

                    {purchaseItems.length === 0 ? (
                        <div className="text-center py-8">
                            <Package
                                className="mx-auto text-gray-400 mb-3"
                                size={48}
                            />
                            <p className="text-gray-500">Nenhum item adicionado</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total de itens:</span>
                                    <span className="font-semibold">
                                        {purchaseItems.length}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Peso total:</span>
                                    <span className="font-semibold">
                                        {purchaseItems
                                            .reduce((sum, item) => sum + item.weight, 0)
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
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold"
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