/**
 * ARQUITECTURA LIMPIA - GESTOR DE COOKIES SEGURAS
 * Capa: Core (Compartido)
 * 
 * Maneja almacenamiento de tokens en HTTP-only cookies.
 * Previene ataques XSS al no permitir acceso desde JavaScript.
 */

import { cookies } from 'next/headers';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number; // segundos
}

/**
 * Nombres de cookies
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_ID: 'auth_user_id',
} as const;

/**
 * Gestor de cookies seguras (HTTP-only)
 */
export class CookieManager {
  /**
   * Crear opciones seguras por defecto
   */
  private static getDefaultOptions(maxAge?: number): CookieOptions {
    return {
      httpOnly: true, // ✅ Previene acceso desde JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // ✅ HTTPS solo en producción
      sameSite: 'lax', // ✅ CSRF protection
      maxAge: maxAge, // En segundos
    };
  }

  /**
   * Guardar Access Token en cookie
   * Duración: 15 minutos
   */
  static async setAccessToken(token: string): Promise<void> {
    const cookieStore = await cookies();
    const options = this.getDefaultOptions(15 * 60); // 15 minutos

    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, token, options);
  }

  /**
   * Guardar Refresh Token en cookie
   * Duración: 7 días
   */
  static async setRefreshToken(token: string): Promise<void> {
    const cookieStore = await cookies();
    const options = this.getDefaultOptions(7 * 24 * 60 * 60); // 7 días

    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, token, options);
  }

  /**
   * Guardar ID de usuario en cookie (sin httpOnly para lectura en cliente)
   */
  static async setUserId(userId: string): Promise<void> {
    const cookieStore = await cookies();
    const options = {
      httpOnly: false, // ✅ Accesible desde JS para verificaciones en cliente
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 días
    };

    cookieStore.set(COOKIE_NAMES.USER_ID, userId, options);
  }

  /**
   * Obtener Access Token
   */
  static async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
    return token || null;
  }

  /**
   * Obtener Refresh Token
   */
  static async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
    return token || null;
  }

  /**
   * Obtener ID de usuario
   */
  static async getUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAMES.USER_ID)?.value;
    return userId || null;
  }

  /**
   * Limpiar todos los tokens (logout)
   */
  static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
    cookieStore.delete(COOKIE_NAMES.USER_ID);
  }

  /**
   * Guardar múltiples cookies de un par de tokens
   */
  static async setTokenPair(
    accessToken: string,
    refreshToken: string,
    userId: string
  ): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
      this.setUserId(userId),
    ]);
  }

  /**
   * Verificar si existe token de acceso válido
   */
  static async hasValidAccessToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}
