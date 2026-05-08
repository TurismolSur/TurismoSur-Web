/**
 * Tipos de Dominio para Vehículos
 * Capa: Presentación & Acceso a Datos
 */

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'damaged' | 'inactive';

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  type: string;
  seats: number;
  transmission: string;
  fuel_type: string;
  daily_price: number;
  mileage: number;
  status: VehicleStatus;
  purchase_date: string | null;
  insurance_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleSearchFilters {
  type?: string;
  min_seats?: number;
  max_seats?: number;
  min_price?: number;
  max_price?: number;
  transmission?: string;
  fuel_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface VehicleSearchResult {
  vehicle: Vehicle;
  available: boolean;
  final_price: number; // Precio calculado con descuentos si aplica
}
