import React from 'react';
import Link from 'next/link';
import { vehicleService } from '@/services/vehicleService';
import { deleteVehicleAction } from '@/actions/manageVehicles';

export default async function AdminVehiclesPage() {
  const vehicles = await vehicleService.getAvailableVehicles();
  const activeVehicles = vehicles.filter((v) => v.status !== 'inactive');

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Panel Administrativo
            </p>
            <h1 className="text-3xl font-bold text-white mt-1">
              Gestión de Vehículos
            </h1>
          </div>
          <Link
            href="/admin/vehicles/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-lg text-sm"
          >
            + Agregar Vehículo
          </Link>
        </div>

        <div className="bg-[#111c40] rounded-xl shadow-2xl overflow-hidden border border-slate-800">
          {activeVehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No hay vehículos registrados en el inventario actual.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-4 font-semibold">Patente</th>
                  <th className="px-6 py-4 font-semibold">Vehículo</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {activeVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-900/20 transition duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">
                      {vehicle.plate}
                    </td>
                    <td className="px-6 py-4 text-gray-200">
                      <span className="font-semibold text-white">{vehicle.make}</span> {vehicle.model}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        vehicle.status === 'available' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {vehicle.status === 'available' ? 'Disponible' : 'Arrendado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-4">
                        
                        <Link 
                          href={`/admin/vehicles/edit/${vehicle.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium transition duration-150 text-sm"
                        >
                          Editar
                        </Link>

                        <form action={async () => {
                          'use server';
                          await deleteVehicleAction(vehicle.id);
                        }}>
                          <button
                            type="submit"
                            className="text-rose-400 hover:text-rose-300 font-medium transition duration-150 text-sm"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
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