/**
 * VehicleCard Component
 * Capa: Presentación (UI)
 * 
 * Responsabilidad ÚNICA: Renderizar tarjeta de vehículo
 * CERO lógica de negocio
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Vehicle } from '@/types/vehicle';
import { getVehicleImageSrc } from '@/lib/vehicleImages';

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

  const imageSrc = getVehicleImageSrc(vehicle);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Imagen del vehículo */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
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

          <button
            onClick={handleSelect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Seleccionar vehículo
          </button>
        </div>
      </div>

      {/* Badge de estado */}
      <div className="absolute top-2 right-2">
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' : vehicle.status === 'rented' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
          {vehicle.status === 'available' ? 'Disponible' : vehicle.status === 'rented' ? 'Arrendado' : vehicle.status}
        </span>
      </div>
    </div>
  );
}
