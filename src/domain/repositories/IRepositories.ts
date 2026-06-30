/**
 * ARQUITECTURA LIMPIA - INTERFACES DE REPOSITORIOS (DOMINIO)
 * Capa: Domain
 * 
 * Define CONTRATOS que la infraestructura debe implementar.
 * El dominio NO conoce cómo se persisten los datos.
 * 
 * Principio: INVERSIÓN DE DEPENDENCIAS
 * - Domain define la interfaz
 * - Infrastructure la implementa (ej: Supabase)
 */

import { UserEntity } from '../entities/UserEntity';
import { VehicleEntity } from '../entities/VehicleEntity';

/**
 * Contrato para acceso a datos de usuarios
 */
export interface IUserRepository {
  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Buscar usuario por ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Guardar usuario (crear o actualizar)
   */
  save(user: UserEntity): Promise<UserEntity>;

  /**
   * Obtener usuarios pendientes de KYC
   */
  findByKYCStatus(status: 'pending' | 'approved' | 'rejected'): Promise<UserEntity[]>;

  /**
   * Eliminar usuario
   */
  delete(id: string): Promise<void>;
}

/**
 * Contrato para acceso a datos de vehículos
 */
export interface IVehicleRepository {
  /**
   * Buscar vehículo por ID
   */
  findById(id: string): Promise<VehicleEntity | null>;

  /**
   * Obtener vehículos disponibles
   */
  findAvailable(): Promise<VehicleEntity[]>;

  /**
   * Guardar vehículo
   */
  save(vehicle: VehicleEntity): Promise<VehicleEntity>;

  /**
   * Obtener todos
   */
  findAll(): Promise<VehicleEntity[]>;
}

/**
 * Contrato para almacenamiento de archivos
 */
export interface IStorageService {
  /**
   * Subir archivo
   */
  upload(file: File, folder: string): Promise<string>;

  /**
   * Eliminar archivo
   */
  delete(path: string): Promise<void>;
}
