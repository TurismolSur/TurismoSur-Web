/**
 * ARQUITECTURA LIMPIA - ENTIDAD DE DOMINIO: VEHÍCULO
 * Capa: Domain
 * 
 * Responsabilidades:
 * - Validar propiedades del vehículo
 * - Calcular precios con descuentos
 * - Gestionar estado de disponibilidad
 */

import { ValidationException } from '@/core/exceptions/DomainException';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'inactive';

export class VehicleEntity {
  private id: string;
  private plate: string;
  private make: string;
  private model: string;
  private year: number;
  private type: string;
  private seats: number;
  private dailyPrice: number;
  private status: VehicleStatus;
  private insuranceExpiry: Date | null;

  private constructor(props: {
    id: string;
    plate: string;
    make: string;
    model: string;
    year: number;
    type: string;
    seats: number;
    dailyPrice: number;
    status: VehicleStatus;
    insuranceExpiry: Date | null;
  }) {
    this.id = props.id;
    this.plate = props.plate.toUpperCase();
    this.make = props.make;
    this.model = props.model;
    this.year = props.year;
    this.type = props.type;
    this.seats = props.seats;
    this.dailyPrice = props.dailyPrice;
    this.status = props.status;
    this.insuranceExpiry = props.insuranceExpiry;
  }

  /**
   * Crear nueva entidad vehículo con validaciones
   */
  static create(props: {
    id: string;
    plate: string;
    make: string;
    model: string;
    year: number;
    type: string;
    seats: number;
    dailyPrice: number;
    status: VehicleStatus;
    insuranceExpiry: Date | null;
  }): VehicleEntity {
    // Validaciones
    if (props.dailyPrice <= 0) {
      throw new ValidationException('Precio diario debe ser mayor a 0');
    }
    if (props.seats < 1 || props.seats > 12) {
      throw new ValidationException('Asientos debe estar entre 1 y 12');
    }

    return new VehicleEntity(props);
  }

  static hydrate(props: {
    id: string;
    plate: string;
    make: string;
    model: string;
    year: number;
    type: string;
    seats: number;
    dailyPrice: number;
    status: VehicleStatus;
    insuranceExpiry: Date | null;
  }): VehicleEntity {
    return new VehicleEntity(props);
  }

  // ============ MÉTODOS DE NEGOCIO ============

  /**
   * Calcular precio de renta con descuento por duración
   * Regla: 5% descuento por cada semana, máximo 20%
   */
  calculateRentalPrice(daysToRent: number): number {
    if (daysToRent < 1) {
      throw new ValidationException('Días debe ser mayor a 0');
    }

    const basePrice = this.dailyPrice * daysToRent;

    if (daysToRent >= 7) {
      const weeks = Math.floor(daysToRent / 7);
      const discountPercent = Math.min(weeks * 5, 20);
      return basePrice * (1 - discountPercent / 100);
    }

    return basePrice;
  }

  /**
   * ¿Está disponible el vehículo para rentar?
   */
  isAvailable(): boolean {
    return this.status === 'available' && this.isInsuranceValid();
  }

  /**
   * ¿El seguro está vigente?
   */
  isInsuranceValid(): boolean {
    if (!this.insuranceExpiry) return false;
    return this.insuranceExpiry > new Date();
  }

  /**
   * Marcar como rentado
   */
  markAsRented(): void {
    if (!this.isAvailable()) {
      throw new ValidationException('Vehículo no está disponible');
    }
    this.status = 'rented';
  }

  /**
   * Marcar como disponible
   */
  markAsAvailable(): void {
    this.status = 'available';
  }

  // ============ GETTERS ============

  getId(): string { return this.id; }
  getPlate(): string { return this.plate; }
  getMake(): string { return this.make; }
  getModel(): string { return this.model; }
  getYear(): number { return this.year; }
  getType(): string { return this.type; }
  getSeats(): number { return this.seats; }
  getDailyPrice(): number { return this.dailyPrice; }
  getStatus(): VehicleStatus { return this.status; }
  getInsuranceExpiry(): Date | null { return this.insuranceExpiry; }

  getDescription(): string {
    return `${this.year} ${this.make} ${this.model}`;
  }

  toJSON() {
    return {
      id: this.id,
      plate: this.plate,
      make: this.make,
      model: this.model,
      year: this.year,
      type: this.type,
      seats: this.seats,
      dailyPrice: this.dailyPrice,
      status: this.status,
      insuranceExpiry: this.insuranceExpiry,
    };
  }
}
