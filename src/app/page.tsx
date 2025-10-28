import { CardNav } from '@/components/card-nav'
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Settings
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <div className='min-h-screen flex flex-col items-center justify-center p-6'>
        <h1 className="text-5xl font-black mb-10 text-white tracking-wider drop-shadow-lg">
          Ferro Velho
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl w-full">
          <CardNav href="/dashboard" icon={TrendingUp} title="Dashboard" />
          <CardNav href="/categoria" icon={Package} title="Categoria" />
          <CardNav href="/produtos" icon={Package} title="Produtos" />
          <CardNav href="/compras" icon={DollarSign} title="Compras" />
          <CardNav href="/vendas" icon={ShoppingCart} title="Vendas" />
          <CardNav href="/clientes" icon={Users} title="Clientes" />
          <CardNav href="/fornecedor" icon={Users} title="Fornecedor" />
          <CardNav href="/configuracao" icon={Settings} title="Configurações" />
        </div>
      </div>
    </div>
  );
}