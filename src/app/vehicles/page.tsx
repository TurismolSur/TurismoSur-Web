/**
 * Página: /vehicles
 * Capa: Presentación (App Router)
 * 
 * Página principal para búsqueda y visualización de vehículos
 */

import React from 'react';
import { VehicleGrid } from '@/components/vehicle/VehicleGrid';

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
          <h1 className="text-4xl font-bold mb-2">Nuestros Vehículos</h1>
          <p className="text-blue-100 text-lg">
            Encuentra el vehículo perfecto para tu viaje
          </p>
        </div>
      </div>

      {/* Grid de vehículos con filtros */}
      <VehicleGrid startDate={startDate} endDate={endDate} />
    </main>
  );
}
