/**
 * ARQUITECTURA LIMPIA - MIDDLEWARE DE AUTENTICACIÓN
 * Capa: Infraestructura (Web)
 * 
 * Middleware que valida JWT en cada request.
 * Protege rutas y expone usuario autenticado en el contexto.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TokenManager } from '@/core/auth/TokenManager';
import { CookieManager } from '@/core/auth/CookieManager';
import { JWTService, JWTPayload } from '@/core/auth/JWTService';

/**
 * Contexto del usuario autenticado disponible en servidor
 */
export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  token: string;
}

/**
 * Rutas que requieren autenticación
 */
const PROTECTED_ROUTES = [
  '/api/vehicles',
  '/api/reservations',
  '/api/profile',
  '/api/kyc',
  '/dashboard',
  '/admin',
  '/pending-approval',
];

/**
 * Rutas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/',
];

/**
 * Middleware de autenticación
 * Ejecutar con: export const config = { matcher: ['/((?!_next).*)'] }
 */
export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ Rutas públicas: permitir siempre
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔒 Rutas protegidas: validar autenticación
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth_access_token')?.value;

    if (!token) {
      // Sin token: redirigir a login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // Validar token
      const payload = await JWTService.verifyAccessToken(token);

      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/vehicles', request.url));
      }

      // ✅ Token válido: continuar con payload en headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      // Token inválido o expirado
      // Intentar refrescar usando refresh token
      const refreshToken = request.cookies.get('auth_refresh_token')?.value;

      if (refreshToken) {
        try {
          // Intentar refrescar
          const newTokens = await TokenManager.refreshAccessToken(refreshToken);

          // Crear respuesta con los nuevos tokens
          const response = NextResponse.next();
          response.cookies.set('auth_access_token', newTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
          });

          if (newTokens.refreshToken) {
            response.cookies.set('auth_refresh_token', newTokens.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60,
            });
          }

          return response;
        } catch {
          // Refresh también falló: redirigir a login
          const response = NextResponse.redirect(new URL('/auth/login', request.url));

          // Limpiar cookies
          response.cookies.delete('auth_access_token');
          response.cookies.delete('auth_refresh_token');
          response.cookies.delete('auth_user_id');

          return response;
        }
      }

      // Sin refresh token: redirigir a login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));

      // Limpiar cookies
      response.cookies.delete('auth_access_token');
      response.cookies.delete('auth_refresh_token');
      response.cookies.delete('auth_user_id');

      return response;
    }
  }

  return NextResponse.next();
}

/**
 * Obtener contexto del usuario desde request
 * Usar en Server Actions y API routes
 */
export function getAuthContextFromRequest(request: Request): AuthContext | null {
  const headers = new Headers(request.headers);
  const userId = headers.get('x-user-id');
  const email = headers.get('x-user-email');
  const role = headers.get('x-user-role');
  const token = headers.get('authorization')?.replace('Bearer ', '');

  if (!userId || !email || !role || !token) {
    return null;
  }

  return { userId, email, role, token };
}

/**
 * Validar que el usuario tenga cierto rol
 */
export function requireRole(requiredRole: string) {
  return (context: AuthContext | null): boolean => {
    if (!context) return false;
    return context.role === requiredRole || context.role === 'admin';
  };
}

/**
 * Middleware helper para API routes
 */
export async function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get('auth_access_token')?.value;

      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: No token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const payload = await JWTService.verifyAccessToken(token);

      const context: AuthContext = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        token,
      };

      return handler(req, context);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized: Invalid token',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}
