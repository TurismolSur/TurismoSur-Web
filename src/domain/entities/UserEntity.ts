/**
 * ARQUITECTURA LIMPIA - ENTIDAD DE DOMINIO: USUARIO
 * Capa: Domain
 * 
 * La entidad contiene LÓGICA DE NEGOCIO pura.
 * NO conoce sobre Supabase, HTTP, o cualquier framework externo.
 * 
 * Esta es la esencia del proyecto, el núcleo de la lógica de negocio.
 */

import { ValidationException } from '@/core/exceptions/DomainException';

export type UserRole = 'customer' | 'admin' | 'support';
export type KYCStatus = 'pending' | 'approved' | 'rejected';

/**
 * Entidad de Dominio: Usuario
 * 
 * Responsabilidades:
 * - Validar edad mínima (18 años)
 * - Validar formato de email
 * - Gestionar estado KYC
 * - Calcular si puede acceder (reglas de negocio)
 */
export class UserEntity {
  private id: string;
  private email: string;
  private firstName: string;
  private lastName: string;
  private dateOfBirth: Date;
  private role: UserRole;
  private kycStatus: KYCStatus;
  private isActive: boolean;

  private constructor(props: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    role: UserRole;
    kycStatus: KYCStatus;
    isActive: boolean;
  }) {
    this.id = props.id;
    this.email = props.email.toLowerCase();
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.dateOfBirth = props.dateOfBirth;
    this.role = props.role;
    this.kycStatus = props.kycStatus;
    this.isActive = props.isActive;
  }

  /**
   * Crear nueva entidad usuario con validaciones de dominio
   * BR-01: El usuario debe ser mayor de 18 años
   * BR-02: El email debe ser válido
   */
  static create(props: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    role: UserRole;
    kycStatus: KYCStatus;
    isActive: boolean;
  }): UserEntity {
    // Validar edad (Regla de Negocio)
    const age = this.calculateAge(props.dateOfBirth);
    if (age < 18) {
      throw new ValidationException(
        `Usuario debe ser mayor de 18 años. Actualmente tiene ${age} años.`
      );
    }

    // Validar email (Regla de Negocio)
    if (!this.isValidEmail(props.email)) {
      throw new ValidationException('Email inválido');
    }

    return new UserEntity(props);
  }

  /**
   * Hidratación: Reconstruir entidad desde datos persistidos
   */
  static hydrate(props: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    role: UserRole;
    kycStatus: KYCStatus;
    isActive: boolean;
  }): UserEntity {
    return new UserEntity(props);
  }

  // ============ MÉTODOS DE NEGOCIO ============

  /**
   * Aprobar KYC - Permite que el usuario acceda a la plataforma
   */
  approveKYC(): void {
    if (this.kycStatus === 'approved') {
      throw new ValidationException('Este usuario ya fue aprobado');
    }
    this.kycStatus = 'approved';
    this.isActive = true;
  }

  /**
   * Rechazar KYC
   */
  rejectKYC(): void {
    if (this.kycStatus === 'rejected') {
      throw new ValidationException('Este usuario ya fue rechazado');
    }
    this.kycStatus = 'rejected';
    this.isActive = false;
  }

  /**
   * ¿Puede acceder el usuario a la plataforma?
   * Regla: Debe estar activo Y KYC aprobado
   */
  canAccess(): boolean {
    return this.isActive && this.kycStatus === 'approved';
  }

  /**
   * Obtener edad actual
   */
  getAge(): number {
    return UserEntity.calculateAge(this.dateOfBirth);
  }

  // ============ VALIDACIONES DE DOMINIO ============

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============ GETTERS ============

  getId(): string { return this.id; }
  getEmail(): string { return this.email; }
  getFirstName(): string { return this.firstName; }
  getLastName(): string { return this.lastName; }
  getFullName(): string { return `${this.firstName} ${this.lastName}`; }
  getDateOfBirth(): Date { return this.dateOfBirth; }
  getRole(): UserRole { return this.role; }
  getKYCStatus(): KYCStatus { return this.kycStatus; }
  isUserActive(): boolean { return this.isActive; }

  /**
   * Retorna un objeto plano para serialización
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      role: this.role,
      kycStatus: this.kycStatus,
      isActive: this.isActive,
    };
  }
}
