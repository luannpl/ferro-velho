import React from "react";

interface Compra {
  id: number;
  fornecedor: {
    name: string;
  };
  dataCompra: string;
  totalItens: number;
  valorTotal: number;
}

interface PurchaseHistoryProps {
  compras: Compra[];
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ compras }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Histórico de Compras</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fornecedor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Itens
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valor Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {compras.map((compra) => (
              <tr key={compra.id}>
                <td className="px-4 py-3">{compra.fornecedor.name}</td>
                <td className="px-4 py-3">
                  {new Date(compra.dataCompra).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{compra.totalItens}</td>
                <td className="px-4 py-3 font-bold text-blue-600">
                  R$ {compra.valorTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseHistory;
