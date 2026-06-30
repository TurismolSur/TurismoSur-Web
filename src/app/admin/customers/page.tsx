import React from 'react';
import { customerService } from '@/services/customerService';

export default async function AdminCustomersPage() {
  const customers = await customerService.getAllCustomers();

  return (
    <div className="text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Panel Administrativo
            </p>
            <h1 className="text-3xl font-bold text-white mt-1">
              Historial de Clientes
            </h1>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="bg-[#111c40] rounded-xl shadow-2xl overflow-hidden border border-slate-800">
          {customers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Aún no hay clientes registrados en el sistema.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-4 font-semibold">ID Usuario</th>
                  <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                  <th className="px-6 py-4 font-semibold">Fecha de Registro</th>
                  <th className="px-6 py-4 font-semibold">Estado (KYC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-slate-900/20 transition duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-xs">
                      {customer.id.slice(0, 8).toUpperCase()}...
                    </td>
                    <td className="px-6 py-4 text-gray-200">
                      {customer.email || 'Sin correo'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {/* Asumimos que usan un campo de estado o rol. Si es pending se muestra amarillo, sino verde */}
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        customer.kyc_status === 'pending' || customer.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {customer.kyc_status || customer.status || 'ACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}