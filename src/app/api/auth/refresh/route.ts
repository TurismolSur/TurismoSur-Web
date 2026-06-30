/**
 * ARQUITECTURA LIMPIA - API ROUTE PARA REFRESH TOKEN
 * Capa: Presentación (API)
 * 
 * Endpoint para refrescar tokens desde el cliente.
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { TokenManager } from '@/core/auth/TokenManager';
import { CookieManager } from '@/core/auth/CookieManager';
import { UnauthorizedException } from '@/core/exceptions/DomainException';

/**
 * POST /api/auth/refresh
 * Refrescar access token usando refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Obtener refresh token de cookies
    const refreshToken = request.cookies.get('auth_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // ✅ Renovar tokens
    const result = await TokenManager.refreshAccessToken(refreshToken);

    // ✅ Crear response con nuevos tokens en cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        expiresIn: result.expiresIn,
      },
      { status: 200 }
    );

    // ✅ Guardar nuevo access token
    response.cookies.set('auth_access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutos
    });

    // ✅ Guardar nuevo refresh token si fue generado
    if (result.refreshToken) {
      response.cookies.set('auth_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 días
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to refresh token',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 }
    );
  }
}

/**
 * GET /api/auth/refresh (alternativo)
 * Verificar estado de autenticación
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('auth_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
