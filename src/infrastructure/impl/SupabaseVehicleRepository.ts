/**
 * ARQUITECTURA LIMPIA - IMPLEMENTACIÓN DE VEHÍCULOS
 * Capa: Infrastructure
 */

import { VehicleEntity } from '@/domain/entities/VehicleEntity';
import { IVehicleRepository } from '@/domain/repositories/IRepositories';
import { supabase } from '@/lib/supabase';

export class SupabaseVehicleRepository implements IVehicleRepository {
  async findById(id: string): Promise<VehicleEntity | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return null;

    return VehicleEntity.hydrate({
      id: data.id,
      plate: data.plate,
      make: data.make,
      model: data.model,
      year: data.year,
      type: data.type,
      seats: data.seats,
      dailyPrice: data.daily_price,
      status: data.status,
      insuranceExpiry: data.insurance_expiry ? new Date(data.insurance_expiry) : null,
    });
  }

  async findAvailable(): Promise<VehicleEntity[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map((row) =>
      VehicleEntity.hydrate({
        id: row.id,
        plate: row.plate,
        make: row.make,
        model: row.model,
        year: row.year,
        type: row.type,
        seats: row.seats,
        dailyPrice: row.daily_price,
        status: row.status,
        insuranceExpiry: row.insurance_expiry ? new Date(row.insurance_expiry) : null,
      })
    );
  }

  async save(vehicle: VehicleEntity): Promise<VehicleEntity> {
    const vehicleData = vehicle.toJSON();

    const { data, error } = await supabase
      .from('vehicles')
      .upsert(
        {
          id: vehicleData.id,
          plate: vehicleData.plate,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          type: vehicleData.type,
          seats: vehicleData.seats,
          daily_price: vehicleData.dailyPrice,
          status: vehicleData.status,
          insurance_expiry: vehicleData.insuranceExpiry
            ? vehicleData.insuranceExpiry.toISOString().split('T')[0]
            : null,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save vehicle: ${error.message}`);
    }

    return VehicleEntity.hydrate({
      id: data.id,
      plate: data.plate,
      make: data.make,
      model: data.model,
      year: data.year,
      type: data.type,
      seats: data.seats,
      dailyPrice: data.daily_price,
      status: data.status,
      insuranceExpiry: data.insurance_expiry ? new Date(data.insurance_expiry) : null,
    });
  }

  async findAll(): Promise<VehicleEntity[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map((row) =>
      VehicleEntity.hydrate({
        id: row.id,
        plate: row.plate,
        make: row.make,
        model: row.model,
        year: row.year,
        type: row.type,
        seats: row.seats,
        dailyPrice: row.daily_price,
        status: row.status,
        insuranceExpiry: row.insurance_expiry ? new Date(row.insurance_expiry) : null,
      })
    );
  }
}
