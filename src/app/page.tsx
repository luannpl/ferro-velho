"use client";
import React, { useState } from "react";
import {
  Package,
  ShoppingCart,
  Home,
  Users,
  Settings,
  Menu,
  X,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  weight: number;
  pricePerKg: number;
  stock: number;
}

interface SaleItem {
  product: Product;
  quantity: number;
  weight: number;
  subtotal: number;
}

interface PurchaseItem {
  productName: string;
  category: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
  supplier: string;
}

const FerroVelhoSystem = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estados para formulário de compra
  const [purchaseForm, setPurchaseForm] = useState({
    productName: "",
    category: "",
    weight: "",
    pricePerKg: "",
    supplier: "",
  });

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "products", icon: Package, label: "Produtos" },
    { id: "purchases", icon: DollarSign, label: "Compras" },
    { id: "sales", icon: ShoppingCart, label: "Vendas" },
    { id: "customers", icon: Users, label: "Clientes" },
    { id: "settings", icon: Settings, label: "Configurações" },
  ];

  const addToSale = (product: Product) => {
    const existing = saleItems.find((item) => item.product.id === product.id);
    if (existing) {
      setSaleItems(
        saleItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                weight: item.weight + 1,
                quantity: item.quantity + 1,
                subtotal: (item.weight + 1) * product.pricePerKg,
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product,
          quantity: 1,
          weight: 1,
          subtotal: product.pricePerKg,
        },
      ]);
    }
  };

  const removeFromSale = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.product.id !== productId));
  };

  const updateSaleItemWeight = (productId: number, newWeight: number) => {
    setSaleItems(
      saleItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              weight: newWeight,
              subtotal: newWeight * item.product.pricePerKg,
            }
          : item
      )
    );
  };

  const getTotalSale = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const finalizeSale = () => {
    alert(`Venda finalizada! Total: R$ ${getTotalSale().toFixed(2)}`);
    setSaleItems([]);
  };

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-8">Ferro Velho</h1>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? "bg-blue-600" : "hover:bg-gray-800"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Usuário Admin</span>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total em Estoque</p>
                      <p className="text-2xl font-bold">
                        {products.reduce((sum, p) => sum + p.stock, 0)} kg
                      </p>
                    </div>
                    <Package className="text-blue-600" size={40} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">
                        Produtos Cadastrados
                      </p>
                      <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <Package className="text-green-600" size={40} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Vendas Hoje</p>
                      <p className="text-2xl font-bold">R$ 0,00</p>
                    </div>
                    <DollarSign className="text-yellow-600" size={40} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Produtos</h2>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                  <Plus size={20} />
                  <span>Novo Produto</span>
                </button>
              </div>

              {showProductForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h3 className="text-xl font-bold mb-4">Cadastrar Produto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome do produto"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Categoria"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Peso (kg)"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Preço por kg"
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estoque (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Preço/kg
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.stock} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          R$ {product.pricePerKg.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800 mr-3">
                            <Edit2 size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
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

          {activeTab === "purchases" && (
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
          )}

          {activeTab === "sales" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Produtos */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-6">Nova Venda</h2>
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {product.category}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {product.stock} kg
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xl font-bold text-blue-600">
                          R$ {product.pricePerKg.toFixed(2)}/kg
                        </span>
                        <button
                          onClick={() => addToSale(product)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comanda */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-4 sticky top-6">
                  <h3 className="text-xl font-bold mb-4">Comanda</h3>
                  {saleItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum item adicionado
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-96 overflow-auto">
                        {saleItems.map((item) => (
                          <div key={item.product.id} className="border-b pb-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold">
                                {item.product.name}
                              </span>
                              <button
                                onClick={() => removeFromSale(item.product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="number"
                                value={item.weight}
                                onChange={(e) =>
                                  updateSaleItemWeight(
                                    item.product.id,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 border rounded px-2 py-1 text-sm"
                                min="0"
                                step="0.1"
                              />
                              <span className="text-sm text-gray-600">
                                kg × R$ {item.product.pricePerKg.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-right font-bold text-blue-600">
                              R$ {item.subtotal.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {getTotalSale().toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={finalizeSale}
                          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold"
                        >
                          Finalizar Venda
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Clientes</h2>
              <p className="text-gray-600">
                Módulo de clientes em desenvolvimento...
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Configurações</h2>
              <p className="text-gray-600">
                Módulo de configurações em desenvolvimento...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FerroVelhoSystem;
