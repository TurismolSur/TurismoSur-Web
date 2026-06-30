import React from 'react';
import { reportService } from '@/services/reportService';

export default async function AdminReportsPage() {
  // Obtenemos los cálculos desde nuestro nuevo servicio
  const metrics = await reportService.getDashboardMetrics();

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
              Reportes y Estadísticas
            </h1>
          </div>
          
          {/* Botón para imprimir/guardar como PDF (Usa la función nativa del navegador) */}
          <button 
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-lg text-sm border border-slate-700 flex items-center gap-2"
          >
            🖨️ Imprimir / PDF
          </button>
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Ingresos */}
          <div className="bg-[#111c40] rounded-xl shadow-lg p-6 border border-slate-800 border-l-4 border-l-green-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Ingresos Estimados</h3>
            <p className="text-3xl font-bold text-white">${metrics.totalRevenue.toLocaleString('es-CL')}</p>
          </div>

          {/* Reservas Totales */}
          <div className="bg-[#111c40] rounded-xl shadow-lg p-6 border border-slate-800 border-l-4 border-l-blue-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Reservas</h3>
            <p className="text-3xl font-bold text-white">{metrics.totalReservations}</p>
          </div>

          {/* Flota Activa */}
          <div className="bg-[#111c40] rounded-xl shadow-lg p-6 border border-slate-800 border-l-4 border-l-cyan-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Vehículos en Flota</h3>
            <p className="text-3xl font-bold text-white">{metrics.totalVehicles}</p>
          </div>

          {/* Atenciones Pendientes */}
          <div className="bg-[#111c40] rounded-xl shadow-lg p-6 border border-slate-800 border-l-4 border-l-amber-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Reservas Pendientes</h3>
            <p className="text-3xl font-bold text-white">{metrics.pendingReservations}</p>
          </div>

        </div>

        {/* Mensaje de estado */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-sm text-gray-400">
          <p>📊 <strong>Nota sobre el reporte:</strong> Estos datos se calculan en tiempo real basándose en el registro actual de la base de datos de TurismoSur. Para descargar este informe, utiliza el botón superior de "Imprimir / PDF" y selecciona "Guardar como PDF" en tu sistema operativo.</p>
        </div>

      </div>
    </div>
  );
}