import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { vehicleService } from '@/services/vehicleService';
import { updateVehicleAction } from '@/actions/manageVehicles';

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  // 1. Buscamos el vehículo en la base de datos
  const vehicle = await vehicleService.getVehicleDetails(params.id);

  if (!vehicle) {
    redirect('/admin/vehicles?error=not-found');
  }

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/vehicles"
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mb-6 transition duration-150 font-semibold uppercase tracking-wider"
        >
          ← Volver al Inventario
        </Link>

        <div className="bg-[#111c40] rounded-xl shadow-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-3">
            Editar Vehículo: {vehicle.plate}
          </h2>

          <form action={async (formData) => {
            'use server';
            await updateVehicleAction(vehicle.id, formData);
          }} className="space-y-5" encType="multipart/form-data">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Marca</label>
              <input type="text" name="make" defaultValue={vehicle.make} required className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Modelo</label>
              <input type="text" name="model" defaultValue={vehicle.model} required className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Patente</label>
              <input type="text" name="plate" defaultValue={vehicle.plate} required className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white font-mono" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Actualizar Fotografía (Opcional)</label>
              <input type="file" name="image" accept="image/*" className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-gray-400 cursor-pointer" />
              <p className="text-xs text-slate-500 mt-2">Si no seleccionas un archivo, se mantendrá la foto original.</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg text-sm">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}