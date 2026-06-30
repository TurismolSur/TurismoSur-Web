'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CookieManager } from '@/core/auth/CookieManager';
import { JWTService } from '@/core/auth/JWTService';
import { vehicleService } from '@/services/vehicleService';
import { reservationRepository } from '@/repositories/reservationRepository';
import { PaymentMethod } from '@/types/reservation';
import { createWebpayTransaction, getWebpayBuyOrder } from '@/lib/webpay';
import { headers } from 'next/headers';

const ReservationSchema = z.object({
  vehicleId: z.string().uuid('Vehículo inválido'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de inicio inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de término inválida'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'cash']),
  notes: z.string().optional(),
});

function parseIsoDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Fecha inválida');
  }
  return parsed;
}

function getSelectedPaymentChannel(paymentMethod: PaymentMethod): string {
  if (paymentMethod === 'cash') {
    return 'Pago en sucursal';
  }

  return 'WebPay Plus en integración';
}

function isNextRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if (!('digest' in error)) {
    return false;
  }

  return typeof (error as { digest?: unknown }).digest === 'string'
    && (error as { digest: string }).digest.startsWith('NEXT_REDIRECT');
}

async function getBaseUrlFromRequestHeaders(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get('x-forwarded-host');
  const host = forwardedHost ?? requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';

  const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (!host) {
    throw new Error('No se pudo determinar la URL base del sitio');
  }

  return `${protocol}://${host}`;
}

export async function createReservationAction(formData: FormData): Promise<never> {
  let payload;

  try {
    payload = ReservationSchema.parse({
      vehicleId: String(formData.get('vehicleId') ?? ''),
      startDate: String(formData.get('startDate') ?? ''),
      endDate: String(formData.get('endDate') ?? ''),
      paymentMethod: String(formData.get('paymentMethod') ?? ''),
      notes: String(formData.get('notes') ?? '').trim() || undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear la reserva';
    redirect(`/vehicles/${String(formData.get('vehicleId') ?? '')}?error=${encodeURIComponent(message)}`);
  }

  const token = await CookieManager.getAccessToken();

  if (!token) {
    redirect('/auth/login?error=Debes iniciar sesión para reservar');
  }

  const userId = await CookieManager.getUserId();
  const user = token ? await JWTService.verifyAccessToken(token) : null;

  if (!userId || !user) {
    redirect('/auth/login?error=Debes iniciar sesión para reservar');
  }

  let reservationId: string | null = null;
  let redirectUrl: string | null = null;

  try {
    const vehicle = await vehicleService.getVehicleDetails(payload.vehicleId);

    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    const startDate = parseIsoDate(payload.startDate);
    const endDate = parseIsoDate(payload.endDate);

    if (startDate >= endDate) {
      throw new Error('La fecha de inicio debe ser menor que la de término');
    }

    const now = new Date();
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart < 48) {
      throw new Error('Las reservas requieren mínimo 48 horas de anticipación');
    }

    const conflict = await reservationRepository.hasVehicleConflict(
      payload.vehicleId,
      payload.startDate,
      payload.endDate
    );

    if (conflict) {
      throw new Error('El vehículo ya está reservado para ese rango de fechas');
    }

    const estimatedCost = vehicleService.calculateRentalCost(
      vehicle.daily_price,
      payload.startDate,
      payload.endDate
    );

    const reservation = await reservationRepository.createReservation({
      userId,
      vehicleId: payload.vehicleId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      paymentMethod: payload.paymentMethod as PaymentMethod,
      estimatedCost,
      notes: payload.notes ?? `${getSelectedPaymentChannel(payload.paymentMethod as PaymentMethod)}`,
    });

    reservationId = reservation.id;

    if (payload.paymentMethod === 'cash') {
      await reservationRepository.updateReservationPaymentStatus(reservation.id, {
        reservationStatus: 'pending',
        paymentStatus: 'pending',
        paymentDescription: 'Pago en sucursal pendiente',
      });

      redirect(`/vehicles/${payload.vehicleId}?reservation=${reservation.id}&method=cash`);
    }

    const baseUrl = await getBaseUrlFromRequestHeaders();
    const returnUrl = `${baseUrl}/api/webpay/return?reservationId=${reservation.id}&vehicleId=${payload.vehicleId}`;
    const buyOrder = getWebpayBuyOrder(reservation.id);
    const webpayTransaction = await createWebpayTransaction(
      buyOrder,
      reservation.id,
      reservation.estimated_cost,
      returnUrl
    );

    await reservationRepository.updateReservationPaymentStatus(reservation.id, {
      reservationStatus: 'pending',
      paymentStatus: 'pending',
      transactionId: webpayTransaction.token,
      paymentDescription: 'Transacción WebPay Plus en integración creada',
    });

    redirectUrl = `/payments/webpay/redirect?token=${encodeURIComponent(webpayTransaction.token)}&url=${encodeURIComponent(webpayTransaction.url)}`;
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'No se pudo crear la reserva';
    redirect(`/vehicles/${payload.vehicleId}?error=${encodeURIComponent(message)}`);
  }

  if (reservationId && redirectUrl) {
    redirect(redirectUrl);
  }
}