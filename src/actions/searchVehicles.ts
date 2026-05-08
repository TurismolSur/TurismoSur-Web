/**
 * Server Action: searchVehicles
 * Capa: Controladores (Server Actions de Next.js)
 * 
 * Responsabilidad: Validar entrada con Zod y llamar al Servicio
 * NO contiene lógica de negocio
 */

'use server';

import { z } from 'zod';
import { vehicleService } from '@/services/vehicleService';
import { VehicleSearchResult, Vehicle } from '@/types/vehicle';

/**
 * Schema de validación para parámetros de búsqueda
 */
const SearchVehiclesSchema = z.object({
  type: z.string().optional(),
  min_seats: z.number().int().positive().optional(),
  max_seats: z.number().int().positive().optional(),
  min_price: z.number().nonnegative().optional(),
  max_price: z.number().nonnegative().optional(),
  transmission: z.enum(['manual', 'automatic']).optional(),
  fuel_type: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type SearchVehiclesInput = z.infer<typeof SearchVehiclesSchema>;

/**
 * Valida que max_price > min_price y end_date > start_date
 */
function validateSearchFilters(filters: SearchVehiclesInput): void {
  if (filters.min_price && filters.max_price && filters.min_price > filters.max_price) {
    throw new Error('min_price debe ser menor que max_price');
  }

  if (filters.start_date && filters.end_date) {
    const start = new Date(filters.start_date);
    const end = new Date(filters.end_date);

    if (start >= end) {
      throw new Error('start_date debe ser menor que end_date');
    }

    // BR-05: Validar que la reserva sea con mínimo 48h de anticipación
    const now = new Date();
    const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart < 48) {
      throw new Error('Las reservas requieren mínimo 48 horas de anticipación');
    }
  }
}

/**
 * Server Action: Busca vehículos con filtros
 * @param filters Parámetros de búsqueda
 * @returns Array de resultados con vehículos disponibles
 */
export async function searchVehicles(
  filters: SearchVehiclesInput
): Promise<VehicleSearchResult[]> {
  try {
    // Validar entrada con Zod
    const validatedFilters = SearchVehiclesSchema.parse(filters);

    // Validar lógica de negocio
    validateSearchFilters(validatedFilters);

    // Llamar al Servicio
    const results = await vehicleService.searchVehicles(validatedFilters);

    return results;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => issue.message).join(', ');
      throw new Error(`Validación inválida: ${messages}`);
    }

    if (error instanceof Error) {
      throw new Error(`Error en búsqueda de vehículos: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Server Action: Obtiene vehículos disponibles sin filtros avanzados
 * @param startDate Fecha de inicio (opcional)
 * @param endDate Fecha de fin (opcional)
 * @returns Array de vehículos disponibles
 */
export async function getAvailableVehicles(
  startDate?: string,
  endDate?: string
): Promise<Vehicle[]> {
  try {
    // Validar fechas si se proporcionan
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new Error('start_date debe ser menor que end_date');
      }

      const now = new Date();
      const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilStart < 48) {
        throw new Error('Las reservas requieren mínimo 48 horas de anticipación (BR-05)');
      }
    }

    return await vehicleService.getAvailableVehicles(startDate, endDate);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Server Action: Obtiene opciones de filtro (tipos y rango de precios)
 * @returns Opciones disponibles para filtrar
 */
export async function getFilterOptions(): Promise<{
  types: string[];
  priceRange: { min: number; max: number };
}> {
  try {
    return await vehicleService.getFilterOptions();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener opciones de filtro: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Server Action: Calcula el costo estimado de un alquiler
 * @param vehicleId ID del vehículo
 * @param startDate Fecha de inicio
 * @param endDate Fecha de fin
 * @returns Costo total estimado
 */
export async function calculateEstimatedCost(
  vehicleId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    if (!vehicleId || !startDate || !endDate) {
      throw new Error('vehicleId, startDate y endDate son requeridos');
    }

    const vehicle = await vehicleService.getVehicleDetails(vehicleId);

    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    const cost = vehicleService.calculateRentalCost(vehicle.daily_price, startDate, endDate);

    return cost;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al calcular costo: ${error.message}`);
    }
    throw error;
  }
}
