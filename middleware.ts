/**
 * NEXT.JS MIDDLEWARE
 * Se ejecuta en CADA request antes de llegar a las rutas
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/authMiddleware';

export function middleware(request: NextRequest) {
  return authMiddleware(request);
}

// Configurar en qué rutas ejecutar el middleware
export const config = {
  matcher: [
    // Incluir todas las rutas
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
