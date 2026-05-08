/**
 * VehicleService
 * Capa: Lógica de Negocio
 * 
 * Responsabilidad: Aplicar reglas de negocio, cálculos y validaciones
 * NO depende de UI ni de Supabase directamente (usa Repository)
 */

import { vehicleRepository } from '@/repositories/vehicleRepository';
import { Vehicle, VehicleSearchFilters, VehicleSearchResult } from '@/types/vehicle';

export class VehicleService {
  /**
   * Obtiene vehículos disponibles en un rango de fechas
   * @param startDate Fecha de inicio (ISO string)
   * @param endDate Fecha de fin (ISO string)
   * @returns Array de vehículos disponibles
   */
  async getAvailableVehicles(startDate?: string, endDate?: string): Promise<Vehicle[]> {
    try {
      if (startDate && endDate) {
        return await vehicleRepository.getAvailableVehiclesInDateRange(startDate, endDate);
      }
      return await vehicleRepository.getAvailableVehicles();
    } catch (error) {
      console.error('VehicleService: Error getting available vehicles', error);
      throw error;
    }
  }

  /**
   * Busca vehículos con filtros y aplica reglas de negocio
   * @param filters Criterios de búsqueda
   * @returns Array de resultados de búsqueda con precios calculados
   */
  async searchVehicles(filters: VehicleSearchFilters): Promise<VehicleSearchResult[]> {
    try {
      // Obtener vehículos del repositorio
      let vehicles = await vehicleRepository.searchVehicles(filters);

      // Aplicar filtro de disponibilidad por fechas si se proporciona
      if (filters.start_date && filters.end_date) {
        vehicles = await this.filterByDateAvailability(vehicles, filters.start_date, filters.end_date);
      }

      // Convertir a resultados con precios calculados
      const results: VehicleSearchResult[] = vehicles.map((vehicle) => ({
        vehicle,
        available: true,
        final_price: vehicle.daily_price, // Precio base (descuentos se aplican en reserva)
      }));

      return results;
    } catch (error) {
      console.error('VehicleService: Error searching vehicles', error);
      throw error;
    }
  }

  /**
   * Filtra vehículos por disponibilidad en un rango de fechas
   * @param vehicles Array de vehículos
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Vehículos disponibles en el rango
   */
  private async filterByDateAvailability(
    vehicles: Vehicle[],
    startDate: string,
    endDate: string
  ): Promise<Vehicle[]> {
    try {
      const availableInRange = await vehicleRepository.getAvailableVehiclesInDateRange(
        startDate,
        endDate
      );
      const availableIds = new Set(availableInRange.map((v) => v.id));
      return vehicles.filter((v) => availableIds.has(v.id));
    } catch (error) {
      console.error('VehicleService: Error filtering by date availability', error);
      throw error;
    }
  }

  /**
   * Obtiene un vehículo específico con validaciones
   * @param vehicleId ID del vehículo
   * @returns Datos del vehículo o null
   */
  async getVehicleDetails(vehicleId: string): Promise<Vehicle | null> {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      return await vehicleRepository.getVehicleById(vehicleId);
    } catch (error) {
      console.error('VehicleService: Error getting vehicle details', error);
      throw error;
    }
  }

  /**
   * Obtiene opciones de filtro (tipos de vehículos y rango de precios)
   * @returns Objeto con tipos y rango de precios
   */
  async getFilterOptions(): Promise<{
    types: string[];
    priceRange: { min: number; max: number };
  }> {
    try {
      const [types, priceRange] = await Promise.all([
        vehicleRepository.getVehicleTypes(),
        vehicleRepository.getPriceRange(),
      ]);

      return {
        types,
        priceRange: {
          min: priceRange.min_price,
          max: priceRange.max_price,
        },
      };
    } catch (error) {
      console.error('VehicleService: Error getting filter options', error);
      throw error;
    }
  }

  /**
   * Calcula el costo total de un alquiler
   * @param dailyRate Tarifa diaria del vehículo
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param discountPercentage Porcentaje de descuento (opcional)
   * @returns Costo total calculado
   */
  calculateRentalCost(
    dailyRate: number,
    startDate: string,
    endDate: string,
    discountPercentage: number = 0
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    let totalCost = dailyRate * daysCount;

    // Aplicar descuento si existe
    if (discountPercentage > 0) {
      totalCost = totalCost * (1 - discountPercentage / 100);
    }

    return Math.round(totalCost * 100) / 100; // Redondear a 2 decimales
  }
}

// Singleton instance
export const vehicleService = new VehicleService();
