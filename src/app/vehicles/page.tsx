/**
 * Página: /vehicles
 * Capa: Presentación (App Router)
 * 
 * Página principal para búsqueda y visualización de vehículos
 */

import React from 'react';
import { VehicleGrid } from '@/components/vehicle/VehicleGrid';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const metadata = {
  title: 'Vehículos Disponibles | TurismoSur',
  description: 'Busca y filtra vehículos disponibles para alquiler en TurismoSur',
};

interface VehiclesPageProps {
  searchParams: Promise<{
    start_date?: string;
    end_date?: string;
  }>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const startDate = params.start_date;
  const endDate = params.end_date;

  return (
    <main>
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Nuestros Vehículos</h1>
              <p className="text-blue-100 text-lg">
                Encuentra el vehículo perfecto para tu viaje
              </p>
            </div>

            <LogoutButton className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70" />
          </div>
        </div>
      </div>

      {/* Grid de vehículos con filtros */}
      <VehicleGrid startDate={startDate} endDate={endDate} />
    </main>
  );
}
