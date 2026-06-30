/**
 * VehicleGrid Component
 * Capa: Presentación (UI)
 * 
 * Responsabilidad: Mostrar grid de vehículos con filtros
 * CERO lógica de negocio - solo captura datos y llama a Server Actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleCard } from './VehicleCard';
import { VehicleSearchResult } from '@/types/vehicle';
import { searchVehicles, getFilterOptions, type SearchVehiclesInput } from '@/actions/searchVehicles';

interface FilterState {
  type: string;
  min_seats: string;
  max_seats: string;
  min_price: string;
  max_price: string;
  transmission: string;
  fuel_type: string;
}

interface VehicleGridProps {
  startDate?: string;
  endDate?: string;
}

export function VehicleGrid({ startDate, endDate }: VehicleGridProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    types: string[];
    priceRange: { min: number; max: number };
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    type: '',
    min_seats: '',
    max_seats: '',
    min_price: '',
    max_price: '',
    transmission: '',
    fuel_type: '',
  });

  // Cargar opciones de filtro al montar
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
        // Solo aplicar el rango cuando hay precios reales; 0-0 vacía la búsqueda.
        if (options.priceRange.max > 0) {
          setFilters((prev) => ({
            ...prev,
            min_price: options.priceRange.min.toString(),
            max_price: options.priceRange.max.toString(),
          }));
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('No se pudieron cargar las opciones de filtro');
      }
    };

    loadFilterOptions();
  }, []);

  // Buscar vehículos cuando cambian los filtros
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construir parámetros de búsqueda, filtrando undefined
        const searchParams = {
          ...(filters.type && {type: filters.type }),
          ...(filters.min_seats && { min_seats: parseInt(filters.min_seats) }),
          ...(filters.max_seats && { max_seats: parseInt(filters.max_seats) }),
          ...(filters.min_price && { min_price: parseFloat(filters.min_price) }),
          ...(filters.max_price && { max_price: parseFloat(filters.max_price) }),
          ...(filters.transmission && { transmission: filters.transmission }),
          ...(filters.fuel_type && { fuel_type: filters.fuel_type }),
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        } as SearchVehiclesInput;

        const results = await searchVehicles(searchParams);
        setVehicles(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timer);
  }, [filters, startDate, endDate]);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      min_seats: '',
      max_seats: '',
      min_price: '',
      max_price: '',
      transmission: '',
      fuel_type: '',
    });
  };

  const handleSelectVehicle = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panel de Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Filtros</h2>

              {/* Filtro: Tipo de Vehículo */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Vehículo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions?.types.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro: Asientos */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asientos
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Mín"
                    value={filters.min_seats}
                    onChange={(e) => handleFilterChange('min_seats', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Máx"
                    value={filters.max_seats}
                    onChange={(e) => handleFilterChange('max_seats', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filtro: Precio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio Diario ({filters.min_price || '$min'} - {filters.max_price || '$max'})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="10"
                    placeholder="Mín"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    step="10"
                    placeholder="Máx"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filtro: Transmisión */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transmisión
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automática</option>
                </select>
              </div>

              {/* Filtro: Combustible */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Combustible
                </label>
                <select
                  value={filters.fuel_type}
                  onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="diesel">Diésel</option>
                  <option value="electric">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>

              {/* Botón Limpiar Filtros */}
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Grid de Vehículos */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Vehículos Disponibles
              </h1>
              <p className="text-gray-600">
                {loading ? 'Buscando...' : `${vehicles.length} vehículos encontrados`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse p-4 h-96" />
                ))}
              </div>
            )}

            {/* Vehicles Grid */}
            {!loading && vehicles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((result) => (
                  <VehicleCard
                    key={result.vehicle.id}
                    vehicle={result.vehicle}
                    dailyRate={result.final_price}
                    onSelect={handleSelectVehicle}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && vehicles.length === 0 && !error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                <p className="text-yellow-800 font-semibold mb-2">
                  No se encontraron vehículos
                </p>
                <p className="text-yellow-700 text-sm">
                  Intenta ajustar tus filtros de búsqueda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
