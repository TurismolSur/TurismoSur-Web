/**
 * ARQUITECTURA LIMPIA - SERVER ACTIONS DE AUTENTICACIÓN
 * Capa: Presentación (Actions)
 * 
 * Actions para login, logout y refresh token.
 * Orquestan Domain (UserEntity) e Infrastructure (repos + auth services).
 */

'use server';

import { UserEntity } from '@/domain/entities/UserEntity';
import { SupabaseUserRepository } from '@/infrastructure/impl/SupabaseUserRepository';
import { TokenManager, TokenRequest } from '@/core/auth/TokenManager';
import { CookieManager } from '@/core/auth/CookieManager';
import { ValidationException, UnauthorizedException } from '@/core/exceptions/DomainException';

/**
 * Response de login
 */
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    canAccess: boolean;
  };
  error?: string;
}

/**
 * Response de refresh
 */
export interface RefreshResponse {
  success: boolean;
  expiresIn?: number;
  error?: string;
}

/**
 * Action: Login (Emisión de tokens)
 * 
 * Flujo:
 * 1. Validar credenciales (email + password)
 * 2. Obtener usuario del repositorio
 * 3. Validar que pueda acceder (KYC aprobado, activo)
 * 4. Generar pair de tokens (Access + Refresh)
 * 5. Guardar en HTTP-only cookies
 */
export async function loginAction(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    // ✅ Validar entrada
    if (!email || !password) {
      throw new ValidationException('Email y contraseña son requeridos');
    }

    // ✅ Obtener usuario del repositorio (Infrastructure)
    const userRepository = new SupabaseUserRepository();
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // No revelar si el email existe o no (seguridad)
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // ✅ Validar contraseña (en producción: usar bcrypt)
    // NOTA: Este es un ejemplo simplificado
    // En producción, implementar validación segura con hash
    const isPasswordValid = await validatePassword(password, user.getId());
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // ✅ Validar permisos (Lógica de Negocio - Domain)
    if (!user.canAccess()) {
      throw new UnauthorizedException(
        'Tu cuenta no está activada. Completa la verificación KYC.'
      );
    }

    // ✅ Generar tokens (Core Auth Service)
    const tokenRequest: TokenRequest = {
      userId: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    };

    const tokenPair = await TokenManager.issueTokenPair(tokenRequest);

    // ✅ Guardar en HTTP-only cookies (Infrastructure)
    await CookieManager.setTokenPair(
      tokenPair.accessToken,
      tokenPair.refreshToken,
      user.getId()
    );

    // ✅ Retornar respuesta
    return {
      success: true,
      message: `¡Bienvenido, ${user.getFullName()}!`,
      data: {
        userId: user.getId(),
        email: user.getEmail(),
        fullName: user.getFullName(),
        role: user.getRole(),
        canAccess: user.canAccess(),
      },
    };
  } catch (error) {
    if (error instanceof ValidationException || error instanceof UnauthorizedException) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Action: Refresh Token (Renovación de sesión)
 * 
 * Flujo:
 * 1. Obtener refresh token de cookies
 * 2. Validar que sea válido
 * 3. Generar nuevo access token
 * 4. Guardar en cookies
 */
export async function refreshTokenAction(): Promise<RefreshResponse> {
  try {
    // ✅ Obtener refresh token
    const refreshToken = await CookieManager.getRefreshToken();

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    // ✅ Renovar tokens (Core Auth Service)
    const result = await TokenManager.refreshAccessToken(refreshToken);

    // ✅ Guardar nuevo access token
    await CookieManager.setAccessToken(result.accessToken);

    // ✅ Si hay nuevo refresh token, guardarlo también
    if (result.refreshToken) {
      await CookieManager.setRefreshToken(result.refreshToken);
    }

    return {
      success: true,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error refreshing token',
    };
  }
}

/**
 * Action: Logout (Revocación de tokens)
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    // ✅ Limpiar cookies
    await CookieManager.clearAuthCookies();

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Validar contraseña (helper)
 * NOTA: Implementar con bcrypt en producción
 */
async function validatePassword(password: string, userId: string): Promise<boolean> {
  // ⚠️ EJEMPLO SIMPLIFICADO - NO USAR EN PRODUCCIÓN
  // En producción:
  // 1. Obtener hash de la BD
  // 2. Usar bcrypt.compare(password, hash)

  // Obtener credenciales de la BD
  const userRepository = new SupabaseUserRepository();
  const user = await userRepository.findById(userId);

  if (!user) return false;

  // ⚠️ TEMPORAL: Validación dummy
  // TODO: Implementar hash seguro con bcrypt
  return password.length >= 6; // Validación temporal
}
