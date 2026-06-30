'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CookieManager } from '@/core/auth/CookieManager';
import { JWTService } from '@/core/auth/JWTService';
import { reservationRepository } from '@/repositories/reservationRepository';

const CancelReservationSchema = z.object({
  reservationId: z.string().uuid('ID de reserva inválido'),
  vehicleId: z.string().uuid('ID de vehículo inválido'),
});

export async function cancelReservationAction(formData: FormData): Promise<never> {
  // 1. Preparamos variables fuera del try/catch
  let redirectUrl = '';
  const fallbackVehicleId = String(formData.get('vehicleId') ?? '');

  try {
    const payload = CancelReservationSchema.parse({
      reservationId: String(formData.get('reservationId') ?? ''),
      vehicleId: fallbackVehicleId,
    });

    const token = await CookieManager.getAccessToken();

    if (!token) {
      redirectUrl = '/auth/login?error=Debes iniciar sesión para cancelar reservas';
      throw new Error('AUTH_ERROR'); // Lanzamos un error controlado para salir del try
    }

    const userId = await CookieManager.getUserId();
    const user = await JWTService.verifyAccessToken(token);

    if (!userId || !user) {
      redirectUrl = '/auth/login?error=Debes iniciar sesión para cancelar reservas';
      throw new Error('AUTH_ERROR');
    }

    // Proceso de base de datos
    await reservationRepository.cancelReservation(payload.reservationId, userId, user.role === 'admin');

    // Si todo salió bien, guardamos la URL de éxito
    redirectUrl = `/vehicles/${payload.vehicleId}?result=cancelled`;

  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_ERROR') {
      // Si fue un error de autenticación, mantenemos la URL de login que ya configuramos
    } else {
      // Capturamos cualquier otro error (falla en base de datos o en la validación de Zod)
      const message = error instanceof Error ? error.message : 'No se pudo cancelar la reserva';
      redirectUrl = `/vehicles/${fallbackVehicleId}?error=${encodeURIComponent(message)}`;
    }
  }

  // 2. ¡El redirect finalmente se ejecuta aquí, de forma segura!
  redirect(redirectUrl);
}