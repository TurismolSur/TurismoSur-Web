/**
 * VehicleCard Component
 * Capa: Presentación (UI)
 * 
 * Responsabilidad ÚNICA: Renderizar tarjeta de vehículo
 * CERO lógica de negocio
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  dailyRate: number;
  onSelect?: (vehicleId: string) => void;
}

export function VehicleCard({ vehicle, dailyRate, onSelect }: VehicleCardProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(vehicle.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Imagen del vehículo (placeholder) */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <svg
          className="w-24 h-24 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 6a6 6 0 100 12 6 6 0 000-12zm0 0l6-6m-6 6v12"
          />
        </svg>
      </div>

      {/* Información del vehículo */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Placa y tipo */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {vehicle.type}
            </p>
            <h3 className="text-lg font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {vehicle.year}
          </span>
        </div>

        {/* Placa del vehículo */}
        <p className="text-sm font-mono text-gray-600 mb-3 border-b pb-2">
          Placa: <span className="font-bold">{vehicle.plate}</span>
        </p>

        {/* Características */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500 text-xs">Asientos</p>
            <p className="font-semibold text-gray-900">{vehicle.seats}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500 text-xs">Transmisión</p>
            <p className="font-semibold text-gray-900 capitalize">{vehicle.transmission}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500 text-xs">Combustible</p>
            <p className="font-semibold text-gray-900 capitalize">{vehicle.fuel_type}</p>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="flex justify-between text-xs text-gray-600 mb-4">
          <span>Color: <span className="font-semibold">{vehicle.color}</span></span>
          <span>Km: <span className="font-semibold">{vehicle.mileage.toLocaleString()}</span></span>
        </div>

        {/* Precio y botón */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-gray-500 text-xs">Tarifa diaria</p>
              <p className="text-2xl font-bold text-green-600">
                ${dailyRate.toFixed(2)}
              </p>
            </div>
          </div>

          <Link
            href={`/vehicles/${vehicle.id}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-center block"
          >
            Ver detalles
          </Link>

          <button
            onClick={handleSelect}
            className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Seleccionar
          </button>
        </div>
      </div>

      {/* Badge de estado */}
      <div className="absolute top-2 right-2">
        <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
          Disponible
        </span>
      </div>
    </div>
  );
}
