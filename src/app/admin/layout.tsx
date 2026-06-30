import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Contenedor principal que ocupa toda la pantalla y distribuye el menú y el contenido
    <div className="h-screen flex flex-col md:flex-row bg-[#0b132b] text-slate-100 overflow-hidden">
      
      {/* BARRA LATERAL (Sidebar compacta y fija) */}
      <aside className="w-full md:w-60 shrink-0 bg-[#111c40] border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          {/* Encabezado del Panel */}
          <div className="mb-8 border-b border-slate-800 pb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              TurismoSur
            </p>
            <h2 className="text-xl font-bold text-white mt-1">
              Panel Admin
            </h2>
          </div>

          {/* Menú de Navegación Completo */}
          <nav className="space-y-2">
            <Link
              href="/admin/kyc"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-slate-900/50 hover:text-cyan-400 transition duration-150"
            >
              <span>📋</span> Revisión de Cuentas
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-slate-900/50 hover:text-cyan-400 transition duration-150"
            >
              <span>👥</span> Historial de Clientes
            </Link>
            
            <Link
              href="/admin/vehicles"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-slate-900/50 hover:text-cyan-400 transition duration-150"
            >
              <span>🚗</span> Gestión de Vehículos
            </Link>

            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-slate-900/50 hover:text-cyan-400 transition duration-150"
            >
              <span>📅</span> Historial de Reservas
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-slate-900/50 hover:text-cyan-400 transition duration-150"
            >
              <span>📊</span> Generar Reportes
            </Link>
          </nav>
        </div>

        {/* Sección inferior */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-rose-400 transition duration-150"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>

    </div>
  );
}