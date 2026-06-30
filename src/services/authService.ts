/**
 * AuthService
 * Capa: Lógica de Negocio
 * 
 * Responsabilidad: Aplicar reglas de negocio, validaciones y orquestar repositorios
 * NO depende de UI ni de Supabase directamente (usa Repositories)
 */

import { supabase } from '@/lib/supabase';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { userRepository } from '@/repositories/userRepository';
import { storageRepository } from '@/repositories/storageRepository';
import { User, RegistrationRequestInput, AuthError } from '@/types/auth';
import { promisify } from 'util';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const hashBuffer = Buffer.from(hash, 'hex');

  if (hashBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, derivedKey);
}

async function findAuthUserByEmail(adminSupabase: ReturnType<typeof getSupabaseAdminClient>, email: string) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`No se pudo consultar Auth: ${error.message}`);
    }

    const foundUser = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);

    if (foundUser) {
      return foundUser;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

export class AuthService {
  /**
   * BR-01: Valida que el usuario sea mayor de 18 años
   * @param dateOfBirth Fecha de nacimiento (ISO string YYYY-MM-DD)
   * @throws AuthError si no cumple la edad requerida
   */
  private validateAgeRequirement(dateOfBirth: string): void {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // Si el cumpleaños aún no ha ocurrido este año, restar 1 año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      throw new AuthError(
        `Debes tener al menos 18 años para registrarte. Actualmente tienes ${age} años (BR-01)`,
        'AGE_REQUIREMENT_NOT_MET',
        400
      );
    }
  }

  /**
   * Valida que las contraseñas coincidan
   * @param password Contraseña
   * @param passwordConfirm Confirmación de contraseña
   * @throws AuthError si no coinciden
   */
  private validatePasswordMatch(password: string, passwordConfirm: string): void {
    if (password !== passwordConfirm) {
      throw new AuthError(
        'Las contraseñas no coinciden',
        'PASSWORD_MISMATCH',
        400
      );
    }
  }

  /**
   * Valida la fortaleza de la contraseña
   * @param password Contraseña a validar
   * @throws AuthError si no es suficientemente fuerte
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new AuthError(
        'La contraseña debe tener al menos 8 caracteres',
        'WEAK_PASSWORD',
        400
      );
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new AuthError(
        'La contraseña debe contener mayúsculas, minúsculas y números',
        'WEAK_PASSWORD',
        400
      );
    }
  }

  /**
   * Valida que el archivo de foto sea válido
   * @param file Archivo a validar
   * @throws AuthError si no es válido
   */
  private validatePhotoFile(file: File): void {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      throw new AuthError(
        'La foto debe ser JPG, PNG o WebP',
        'INVALID_FILE_TYPE',
        400
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new AuthError(
        'La foto no debe superar 5MB',
        'FILE_TOO_LARGE',
        400
      );
    }
  }

  /**
   * Solicita el registro de un nuevo usuario (KYC)
   * 
   * Flujo CORRECTO para Producción:
   * 1. Valida datos (edad BR-01, contraseñas, foto)
   * 2. Verifica disponibilidad de email y national_id
   * 3. CREA USUARIO EN SUPABASE AUTH (signUp) - obtiene UUID
   * 4. Sube foto a Supabase Storage
   * 5. Crea usuario en tabla pública users con el UUID de Auth
   * 
   * Rollback si falla:
   * - Si falla paso 5 (foto o BD): elimina usuario de tabla public users
   * - Si falla paso 5 (BD): intenta rollback de Auth (requiere service_role)
   * 
   * @param input Datos de registro
   * @returns Usuario creado (con kyc_status=pending)
   */
  async requestRegistration(input: RegistrationRequestInput): Promise<User> {
    let authUserId: string | null = null;
    let photoUrl: string | null = null;

    try {
      // 1. Validar edad (BR-01)
      this.validateAgeRequirement(input.date_of_birth);

      // 2. Validar contraseñas
      this.validatePasswordMatch(input.password, input.password_confirm);
      this.validatePasswordStrength(input.password);

      // 3. Validar archivo de foto
      this.validatePhotoFile(input.id_photo);

      // 4. Verificar disponibilidad de email
      const emailExists = await userRepository.emailExists(input.email);
      if (emailExists) {
        throw new AuthError(
          'El email ya está registrado',
          'EMAIL_ALREADY_EXISTS',
          409
        );
      }

      // 5. Verificar disponibilidad de national_id
      const nationalIdExists = await userRepository.nationalIdExists(input.national_id);
      if (nationalIdExists) {
        throw new AuthError(
          'El documento de identidad ya está registrado',
          'NATIONAL_ID_ALREADY_EXISTS',
          409
        );
      }

      // ========================================================================
      // PASO CRÍTICO 1: Crear usuario en Supabase Auth
      // ========================================================================
      const adminSupabase = getSupabaseAdminClient();
      let authResponse;

      const existingAuthUser = await findAuthUserByEmail(adminSupabase, input.email);

      if (existingAuthUser) {
        await userRepository.deleteUserFromAuth(existingAuthUser.id);
      }

      try {
        authResponse = await adminSupabase.auth.admin.createUser({
          email: input.email.toLowerCase(),
          password: input.password,
          email_confirm: true,
          user_metadata: {
            first_name: input.first_name,
            last_name: input.last_name,
          },
        });
      } catch (authError) {
        throw new AuthError(
          'No se pudo registrar en el sistema de autenticación. Intenta de nuevo.',
          'AUTH_SIGNUP_ERROR',
          500
        );
      }

      if (authResponse.error || !authResponse.data.user?.id) {
        throw new AuthError(
          `Fallo en Supabase Auth: ${authResponse.error?.message || 'Usuario no creado'}`,
          'AUTH_SIGNUP_FAILED',
          500
        );
      }

      authUserId = authResponse.data.user.id;
      console.log(`✅ Usuario registrado en Supabase Auth: ${authUserId}`);

      const passwordHash = await hashPassword(input.password);

      // ========================================================================
      // PASO CRÍTICO 2: Subir foto a Storage
      // ========================================================================
      try {
        photoUrl = await storageRepository.uploadIdentityDocument(input.id_photo, authUserId);
        console.log(`✅ Foto subida a Storage: ${photoUrl}`);
      } catch (storageError) {
        console.error('Storage error, intentando rollback de Auth...');
        // Rollback: intentar eliminar usuario de Auth
        try {
          await userRepository.deleteUserFromAuth(authUserId);
        } catch (rollbackError) {
          console.error('Rollback de Auth falló:', rollbackError);
        }

        throw new AuthError(
          'No se pudo subir el documento. Intenta de nuevo.',
          'STORAGE_ERROR',
          500
        );
      }

      // ========================================================================
      // PASO CRÍTICO 3: Crear usuario en tabla pública users
      // ========================================================================
      let createdUser: User | null = null;

      try {
        createdUser = await userRepository.createUser(authUserId, {
          email: input.email,
          passwordHash,
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          date_of_birth: input.date_of_birth,
          nationality: input.nationality,
          national_id: input.national_id,
          idPhotoUrl: photoUrl,
        });

        console.log(`✅ Usuario creado en tabla pública: ${authUserId}`);
      } catch (dbError) {
        // ROLLBACK: Si falla BD, intentar eliminar de Auth y Storage
        console.error('DB error, intentando rollback...', dbError);

        // 1. Eliminar de Storage
        if (photoUrl) {
          try {
            await storageRepository.deleteIdentityDocument(photoUrl);
            console.log('✅ Foto eliminada de Storage (rollback)');
          } catch (storageRollbackError) {
            console.error('❌ Rollback de Storage falló:', storageRollbackError);
          }
        }

        // 2. Eliminar de Auth
        try {
          await userRepository.deleteUserFromAuth(authUserId);
        } catch (authRollbackError) {
          console.error('❌ Rollback de Auth falló:', authRollbackError);
        }

        throw dbError;
      }

      return createdUser;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new AuthError(
          `Error en solicitud de registro: ${error.message}`,
          'REGISTRATION_ERROR',
          500
        );
      }

      throw new AuthError(
        'Error desconocido en solicitud de registro',
        'UNKNOWN_ERROR',
        500
      );
    }
  }

  /**
   * UC-02: Autentica un usuario existente
   * 
   * Flujo:
   * 1. Autentica con Supabase Auth (signInWithPassword)
   * 2. Obtiene datos del usuario desde tabla users (incluyendo kyc_status)
   * 3. Verifica kyc_status y retorna info de enrutamiento
   * 
   * Enrutamiento inteligente basado en KYC:
   * - kyc_status='approved': Redirigir a /vehicles
   * - kyc_status='pending': Redirigir a /pending-approval
   * - kyc_status='rejected': Lanzar error
   * 
   * NOTA: Desde que implementamos signUp en requestRegistration(),
   * todos los usuarios EXISTEN en Supabase Auth y en tabla users sincronizados
   * 
   * @param email Email del usuario
   * @param password Contraseña
   * @returns { user, redirectUrl }
   */
  async login(email: string, password: string): Promise<{ user: User; redirectUrl: string }> {
    try {
      // 1. Obtener usuario desde tabla users para validar credenciales y kyc_status
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        throw new AuthError('Email o contraseña incorrectos', 'INVALID_CREDENTIALS', 401);
      }

      // 2. Validar contraseña usando el hash local
      if (user.password_hash) {
        const passwordMatches = await verifyPassword(password, user.password_hash);

        if (!passwordMatches) {
          // Fallback para cuentas antiguas que dependan de Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password,
          });

          if (authError || !authData.user) {
            throw new AuthError('Email o contraseña incorrectos', 'INVALID_CREDENTIALS', 401);
          }
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (authError || !authData.user) {
          throw new AuthError('Email o contraseña incorrectos', 'INVALID_CREDENTIALS', 401);
        }
      }

      // 3. Enrutamiento inteligente basado en kyc_status
      let redirectUrl: string;

      switch (user.kyc_status) {
        case 'approved':
          redirectUrl = user.role === 'admin' ? '/admin/kyc' : '/vehicles';
          break;
        case 'pending':
          redirectUrl = '/pending-approval';
          break;
        case 'rejected':
          throw new AuthError(
            'Tu solicitud fue rechazada. Contacta a soporte para más información.',
            'KYC_REJECTED',
            403
          );
        default:
          throw new AuthError(
            'Estado KYC desconocido',
            'UNKNOWN_KYC_STATUS',
            500
          );
      }

      return {
        user,
        redirectUrl,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new AuthError(
          `Error en login: ${error.message}`,
          'LOGIN_ERROR',
          500
        );
      }

      throw new AuthError(
        'Error desconocido en login',
        'UNKNOWN_ERROR',
        500
      );
    }
  }
}

// Singleton instance
export const authService = new AuthService();
