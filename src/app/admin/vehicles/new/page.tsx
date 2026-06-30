import React from 'react';
import Link from 'next/link';
import { addVehicleAction } from '@/actions/manageVehicles';

export default function NewVehiclePage() {
  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Enlace para regresar */}
        <Link
          href="/admin/vehicles"
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mb-6 transition duration-150 font-semibold uppercase tracking-wider"
        >
          ← Volver al Inventario
        </Link>

        {/* Contenedor del Formulario */}
        <div className="bg-[#111c40] rounded-xl shadow-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-3">
            Registrar Nuevo Vehículo
          </h2>

          {/* El atributo encType es vital para permitir el envío de archivos de imagen */}
          <form action={async (formData) => {
  'use server';
  await addVehicleAction(formData);
}} className="space-y-5" encType="multipart/form-data">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Marca del Vehículo
              </label>
              <input
                type="text"
                name="make"
                required
                placeholder="Ej: Toyota"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Modelo
              </label>
              <input
                type="text"
                name="model"
                required
                placeholder="Ej: Rav4"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Patente / Placa
              </label>
              <input
                type="text"
                name="plate"
                required
                placeholder="Ej: AB-CD-12"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition duration-150 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Fotografía del Automóvil
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                required
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition duration-150"
              />
            </div>

            {/* Acciones de envío */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <Link
                href="/admin/vehicles"
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 font-semibold py-2 px-5 rounded-lg transition duration-200 text-sm"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-lg text-sm"
              >
                Guardar e Incorporar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}