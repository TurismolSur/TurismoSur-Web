/**
 * VehicleRepository
 * Capa: Acceso a Datos (Supabase)
 * 
 * Responsabilidad ÚNICA: Comunicarse con Supabase
 * NO contiene lógica de negocio
 */

import { supabase } from '@/lib/supabase';
import { Vehicle, VehicleSearchFilters } from '@/types/vehicle';

export class VehicleRepository {
  /**
   * Obtiene todos los vehículos disponibles
   * @returns Array de vehículos con status 'available'
   */
  async getAvailableVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available');

    if (error) {
      console.error('Error fetching available vehicles:', error);
      throw new Error(`Failed to fetch available vehicles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca vehículos con filtros avanzados
   * @param filters Criterios de búsqueda
   * @returns Array de vehículos que coinciden con los filtros
   */
  async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    let query = supabase.from('vehicles').select('*').eq('status', 'available');

    // Filtrar por tipo de vehículo
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Filtrar por cantidad de asientos
    if (filters.min_seats) {
      query = query.gte('seats', filters.min_seats);
    }
    if (filters.max_seats) {
      query = query.lte('seats', filters.max_seats);
    }

    // Filtrar por rango de precio
    if (filters.min_price) {
      query = query.gte('daily_price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('daily_price', filters.max_price);
    }

    // Filtrar por transmisión
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }

    // Filtrar por tipo de combustible
    if (filters.fuel_type) {
      query = query.eq('fuel_type', filters.fuel_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching vehicles:', error);
      throw new Error(`Failed to search vehicles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un vehículo específico por ID
   * @param vehicleId ID del vehículo
   * @returns Datos del vehículo o null
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching vehicle:', error);
      throw new Error(`Failed to fetch vehicle: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene vehículos con disponibilidad en un rango de fechas
   * (Excluye vehículos con reservas conflictivas)
   * @param startDate Fecha de inicio (ISO string)
   * @param endDate Fecha de fin (ISO string)
   * @returns Array de vehículos disponibles en el rango
   */
  async getAvailableVehiclesInDateRange(
    startDate: string,
    endDate: string
  ): Promise<Vehicle[]> {
    // Obtener IDs de vehículos con reservas conflictivas
    const { data: bookedVehicles, error: bookingError } = await supabase
      .from('reservations')
      .select('vehicle_id')
      .in('status', ['confirmed', 'active'])
      .or(
        `and(start_date.lt.${endDate},end_date.gt.${startDate})`
      );

    if (bookingError) {
      console.error('Error fetching booked vehicles:', bookingError);
      throw new Error(`Failed to check bookings: ${bookingError.message}`);
    }

    const bookedVehicleIds = bookedVehicles?.map((b) => b.vehicle_id) || [];

    // Obtener vehículos disponibles excluyendo los reservados
    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available');

    if (bookedVehicleIds.length > 0) {
      query = query.not('id', 'in', `(${bookedVehicleIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vehicles by date range:', error);
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene tipos de vehículos únicos disponibles
   * @returns Array de tipos de vehículos sin duplicados
   */
  async getVehicleTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('type')
      .eq('status', 'available');

    if (error) {
      console.error('Error fetching vehicle types:', error);
      throw new Error(`Failed to fetch vehicle types: ${error.message}`);
    }

    // Deduplicar en cliente (supabase-js no soporta .distinct())
    const types = data?.map((item) => item.type).filter(Boolean) || [];
    return [...new Set(types)];
  }

  /**
   * Obtiene los precios mín y máx de vehículos disponibles
   * @returns Objeto con min_price y max_price
   */
  async getPriceRange(): Promise<{ min_price: number; max_price: number }> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('daily_price')
      .eq('status', 'available');

    if (error) {
      console.error('Error fetching price range:', error);
      throw new Error(`Failed to fetch price range: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return { min_price: 0, max_price: 0 };
    }

    const prices = data.map((v) => v.daily_price);
    return {
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
    };
  }
}

// Singleton instance
export const vehicleRepository = new VehicleRepository();
