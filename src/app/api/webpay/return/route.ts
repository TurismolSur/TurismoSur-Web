import { NextRequest, NextResponse } from 'next/server';
import { commitWebpayTransaction } from '@/lib/webpay';
import { reservationRepository } from '@/repositories/reservationRepository';

async function readFormValue(request: NextRequest, key: string): Promise<string | null> {
  if (request.method !== 'POST') {
    return null;
  }

  const formData = await request.formData();
  const value = formData.get(key);

  return typeof value === 'string' && value.length > 0 ? value : null;
}

function buildRedirectUrl(request: NextRequest, path: string, params: Record<string, string>): URL {
  const url = new URL(path, request.url);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}

async function handleWebpayCallback(request: NextRequest) {
  const url = new URL(request.url);
  const reservationId = url.searchParams.get('reservationId') ?? '';
  const vehicleId = url.searchParams.get('vehicleId') ?? '';
  const tokenWs = url.searchParams.get('token_ws') ?? (await readFormValue(request, 'token_ws'));
  const tbkToken = url.searchParams.get('TBK_TOKEN') ?? (await readFormValue(request, 'TBK_TOKEN'));

  if (!reservationId || !vehicleId) {
    return NextResponse.redirect(buildRedirectUrl(request, `/vehicles/${vehicleId || ''}`, {
      error: 'No se pudo identificar la reserva.',
    }));
  }

  if (tokenWs) {
    const commitResponse = await commitWebpayTransaction(tokenWs);

    if (commitResponse.status === 'AUTHORIZED' && commitResponse.response_code === 0) {
      await reservationRepository.updateReservationPaymentStatus(reservationId, {
        reservationStatus: 'confirmed',
        paymentStatus: 'completed',
        transactionId: tokenWs,
        actualCost: commitResponse.amount ?? null,
        paymentDescription: 'Pago aprobado por WebPay Plus en integración',
      });

      return NextResponse.redirect(
        buildRedirectUrl(request, `/vehicles/${vehicleId}`, {
          reservation: reservationId,
          method: 'webpay',
          payment: 'approved',
        })
      );
    }

    await reservationRepository.updateReservationPaymentStatus(reservationId, {
      reservationStatus: 'cancelled',
      paymentStatus: 'failed',
      transactionId: tokenWs,
      actualCost: null,
      paymentDescription: 'Pago rechazado por WebPay Plus en integración',
    });

    return NextResponse.redirect(
      buildRedirectUrl(request, `/vehicles/${vehicleId}`, {
        error: 'El pago fue rechazado por WebPay.',
      })
    );
  }

  if (tbkToken) {
    await reservationRepository.updateReservationPaymentStatus(reservationId, {
      reservationStatus: 'cancelled',
      paymentStatus: 'failed',
      paymentDescription: 'Pago anulado por el usuario en WebPay Plus',
    });

    return NextResponse.redirect(
      buildRedirectUrl(request, `/vehicles/${vehicleId}`, {
        error: 'El pago fue anulado en WebPay.',
      })
    );
  }

  await reservationRepository.updateReservationPaymentStatus(reservationId, {
    reservationStatus: 'cancelled',
    paymentStatus: 'failed',
    paymentDescription: 'Pago sin finalizar en WebPay Plus',
  });

  return NextResponse.redirect(
    buildRedirectUrl(request, `/vehicles/${vehicleId}`, {
      error: 'No se recibió respuesta válida de WebPay.',
    })
  );
}

export async function GET(request: NextRequest) {
  return handleWebpayCallback(request);
}

export async function POST(request: NextRequest) {
  return handleWebpayCallback(request);
}
