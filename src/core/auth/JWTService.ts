/**
 * ARQUITECTURA LIMPIA - SERVICIO JWT
 * Capa: Core (Compartido)
 * 
 * Servicio para crear y verificar tokens JWT.
 * No depende de frameworks HTTP específicos.
 * Encapsula la lógica de tokens.
 */

import { UnauthorizedException, ValidationException } from '@/core/exceptions/DomainException';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;  // Issued at
  exp?: number;  // Expiration time
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Segundos
}

/**
 * Servicio para generar y validar tokens JWT
 */
export class JWTService {
  /**
   * Importa la librería jwt dinámicamente (compatible con edge)
   */
  private static async getJoseLib() {
    try {
      // Para Next.js 16+, usamos jose que funciona en edge runtime
      return await import('jose');
    } catch {
      throw new Error('jose library not found. Install: npm install jose');
    }
  }

  /**
   * Generar Access Token (corta duración)
   * Duración: 15 minutos
   */
  static async generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    const jose = await this.getJoseLib();
    const secret = new TextEncoder().encode(this.getAccessTokenSecret());

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);

    return token;
  }

  /**
   * Generar Refresh Token (larga duración)
   * Duración: 7 días
   */
  static async generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    const jose = await this.getJoseLib();
    const secret = new TextEncoder().encode(this.getRefreshTokenSecret());

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    return token;
  }

  /**
   * Verificar Access Token
   */
  static async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const jose = await this.getJoseLib();
      const secret = new TextEncoder().encode(this.getAccessTokenSecret());

      const verified = await jose.jwtVerify(token, secret);
      return verified.payload as JWTPayload;
    } catch (error) {
      throw new UnauthorizedException('Token de acceso inválido o expirado');
    }
  }

  /**
   * Verificar Refresh Token
   */
  static async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      const jose = await this.getJoseLib();
      const secret = new TextEncoder().encode(this.getRefreshTokenSecret());

      const verified = await jose.jwtVerify(token, secret);
      return verified.payload as JWTPayload;
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Decodificar token sin verificar (solo para lectura de claims)
   * ADVERTENCIA: No verificar la firma, usar solo cuando ya fue verificado
   */
  static async decodeToken(token: string): Promise<JWTPayload> {
    try {
      const jose = await this.getJoseLib();
      const decoded = jose.decodeJwt(token) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new ValidationException('No se pudo decodificar el token');
    }
  }

  /**
   * Obtener secret del Access Token
   */
  private static getAccessTokenSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (secret) {
      return secret;
    }

    if (process.env.NODE_ENV !== 'production') {
      return 'turismosur-dev-access-secret';
    }

    throw new Error('JWT_ACCESS_SECRET not set in environment');
  }

  /**
   * Obtener secret del Refresh Token
   */
  private static getRefreshTokenSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (secret) {
      return secret;
    }

    if (process.env.NODE_ENV !== 'production') {
      return 'turismosur-dev-refresh-secret';
    }

    throw new Error('JWT_REFRESH_SECRET not set in environment');
  }

  /**
   * Extraer token del header Authorization
   * Formato esperado: "Bearer <token>"
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Calcular tiempo restante de un token
   */
  static async getTimeRemaining(token: string): Promise<number | null> {
    try {
      const payload = await this.decodeToken(token);
      if (!payload.exp) return null;

      const now = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - now;

      return remaining > 0 ? remaining : 0;
    } catch {
      return null;
    }
  }
}
