"use client";

import React, { useState } from "react";
import {
  Home,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Settings,
  LucideIcon,
  CircleArrowLeft,
  Menu,
} from "lucide-react";

import { useRouter, usePathname } from "next/navigation";

// Definição do item do menu
interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

// Array com os itens do menu
const menuItems: MenuItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
  { id: "produtos", icon: Package, label: "Produtos", path: "/produtos" },
  { id: "compras", icon: DollarSign, label: "Compras", path: "/compras" },
  { id: "vendas", icon: ShoppingCart, label: "Vendas", path: "/vendas" },
  { id: "clientes", icon: Users, label: "Clientes", path: "/clientes" },
  {
    id: "configuracao",
    icon: Settings,
    label: "Configurações",
    path: "/configuracao",
  },
];

// Componente da Sidebar
const Sidebar = ({
  sidebarOpen,
  activePath,
  navigateTo,
}: {
  sidebarOpen: boolean;
  activePath: string;
  navigateTo: (path: string) => void;
}) => {
  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } bg-gray-900 text-white transition-all duration-300 overflow-hidden h-screen`}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">Ferro Velho</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activePath === item.path ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Componente de Layout
export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // pega o path atual da URL

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activePath={pathname}
        navigateTo={navigateTo}
      />

      <div className="flex-1 overflow-auto bg-gray-100">
        {/* Botão para abrir/fechar a sidebar */}
        <div className="p-4 bg-white shadow flex items-center justify-between">
          <button
            className="text-gray-700 hover:text-black"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <CircleArrowLeft /> : <Menu />}
          </button>
        </div>

        {/* Conteúdo da página */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
