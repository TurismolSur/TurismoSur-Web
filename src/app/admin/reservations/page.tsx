import React from 'react';
import { reservationService } from '@/services/reservationService';

export default async function AdminReservationsPage() {
  const reservations = await reservationService.getAllReservations();

  return (
    <div className="text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Panel Administrativo
            </p>
            <h1 className="text-3xl font-bold text-white mt-1">
              Historial de Reservas
            </h1>
          </div>
        </div>

        <div className="bg-[#111c40] rounded-xl shadow-2xl overflow-hidden border border-slate-800">
          {reservations.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Aún no hay reservas registradas en el sistema.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-4 font-semibold">ID Reserva</th>
                  <th className="px-6 py-4 font-semibold">ID Vehículo</th>
                  <th className="px-6 py-4 font-semibold">Fechas de Arriendo</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {reservations.map((res: any) => (
                  <tr key={res.id} className="hover:bg-slate-900/20 transition duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-xs">
                      {res.id.slice(0, 8).toUpperCase()}...
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-mono text-xs">
                      {res.vehicle_id}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(res.start_date).toLocaleDateString()} al {new Date(res.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-semibold">
                      ${res.total_price}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        res.status === 'confirmed' || res.status === 'active' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : res.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {res.status.toUpperCase()}
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