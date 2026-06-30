/**
 * Tipos de Dominio para Autenticación y Usuarios
 * Capa: Presentación & Acceso a Datos
 */

export type KYCStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'customer' | 'admin' | 'support';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string; // ISO date (YYYY-MM-DD)
  nationality: string | null;
  national_id: string | null;
  role: UserRole;
  is_active: boolean;
  kyc_status: KYCStatus;
  id_photo_url: string | null;
  kyc_approved_at: string | null;
  kyc_rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequestInput {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string; // ISO date (YYYY-MM-DD)
  nationality: string;
  national_id: string;
  id_photo: File; // Archivo de la foto de cédula
}

export interface RegistrationResponse {
  user: User;
  message: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
