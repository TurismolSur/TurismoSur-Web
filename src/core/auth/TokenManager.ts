/**
 * ARQUITECTURA LIMPIA - GESTOR DE TOKENS
 * Capa: Core (Compartido)
 * 
 * Gestiona la lógica de emisión, renovación y revocación de tokens.
 * Orquesta JWTService e ITokenRepository.
 */

import { JWTService, JWTPayload, TokenPair } from './JWTService';
import { ValidationException } from '@/core/exceptions/DomainException';

export interface TokenRequest {
  userId: string;
  email: string;
  role: string;
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string; // Solo se genera nuevo refresh si está próximo a expirar
  expiresIn: number;
}

/**
 * Gestor centralizado de tokens
 * - Emite pares de tokens
 * - Valida y refresca tokens
 * - Maneja revocación (mediante repository)
 */
export class TokenManager {
  /**
   * Emitir par de tokens (Access + Refresh)
   */
  static async issueTokenPair(request: TokenRequest): Promise<TokenPair> {
    // Validar entrada
    if (!request.userId || !request.email || !request.role) {
      throw new ValidationException('userId, email y role son requeridos');
    }

    try {
      // Generar ambos tokens en paralelo
      const [accessToken, refreshToken] = await Promise.all([
        JWTService.generateAccessToken({
          userId: request.userId,
          email: request.email,
          role: request.role,
        }),
        JWTService.generateRefreshToken({
          userId: request.userId,
          email: request.email,
          role: request.role,
        }),
      ]);

      return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutos en segundos
      };
    } catch (error) {
      throw new ValidationException(
        error instanceof Error ? error.message : 'No se pudo emitir los tokens'
      );
    }
  }

  /**
   * Renovar el Access Token usando un Refresh Token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenRefreshResult> {
    try {
      // Verificar que el refresh token sea válido
      const payload = await JWTService.verifyRefreshToken(refreshToken);

      // Generar nuevo access token
      const newAccessToken = await JWTService.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      // Si el refresh token está próximo a expirar (menos de 1 día), generar uno nuevo
      const timeRemaining = await JWTService.getTimeRemaining(refreshToken);
      const oneDay = 24 * 60 * 60; // segundos

      let newRefreshToken: string | undefined;
      if (timeRemaining && timeRemaining < oneDay) {
        newRefreshToken = await JWTService.generateRefreshToken({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        });
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60, // 15 minutos
      };
    } catch (error) {
      throw new ValidationException(
        error instanceof Error ? error.message : 'No se pudo refrescar el token'
      );
    }
  }

  /**
   * Validar Access Token
   */
  static async validateAccessToken(token: string): Promise<JWTPayload> {
    return JWTService.verifyAccessToken(token);
  }

  /**
   * Obtener información del token sin validar firma
   * SOLO usar cuando ya fue validado por middleware
   */
  static async getTokenInfo(token: string): Promise<JWTPayload> {
    return JWTService.decodeToken(token);
  }

  /**
   * Extraer y validar token del header
   */
  static async extractAndValidateToken(authHeader?: string): Promise<JWTPayload> {
    const token = JWTService.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new ValidationException('No token found in Authorization header');
    }

    return JWTService.verifyAccessToken(token);
  }
}
