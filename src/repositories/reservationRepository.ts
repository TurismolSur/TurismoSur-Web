import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import {
  ReservationCreationInput,
  ReservationPaymentUpdateInput,
  ReservationRecord,
  ReservationStatus,
  PaymentStatus,
  VehicleBookingWindow,
} from '@/types/reservation';

export class ReservationRepository {
  private get supabase() {
    return getSupabaseAdminClient();
  }

  async getVehicleReservations(vehicleId: string): Promise<ReservationRecord[]> {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'confirmed', 'active'])
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch vehicle reservations: ${error.message}`);
    }

    return (data ?? []) as ReservationRecord[];
  }

  async getReservationsByUserId(userId: string): Promise<ReservationRecord[]> {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed', 'active'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user reservations: ${error.message}`);
    }

    return (data ?? []) as ReservationRecord[];
  }

  async getReservationById(reservationId: string): Promise<ReservationRecord | null> {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }

      throw new Error(`Failed to fetch reservation: ${error.message}`);
    }

    return data as ReservationRecord;
  }

  async getVehicleBookingWindow(vehicleId: string): Promise<VehicleBookingWindow> {
    const reservations = await this.getVehicleReservations(vehicleId);
    const now = new Date();

    const activeConflict = reservations.find((reservation) => {
      const start = new Date(reservation.start_date);
      const end = new Date(reservation.end_date);
      return start <= now && end >= now && ['confirmed', 'active'].includes(reservation.status);
    });

    const upcomingReservations = reservations
      .filter((reservation) => ['confirmed', 'active'].includes(reservation.status))
      .filter((reservation) => new Date(reservation.start_date) > now)
      .sort((left, right) => new Date(left.start_date).getTime() - new Date(right.start_date).getTime());

    const currentEnd = activeConflict?.end_date ?? null;
    const nextReservation = upcomingReservations[0] ?? null;

    const availableFrom = activeConflict
      ? currentEnd!
      : nextReservation
        ? now.toISOString()
        : now.toISOString();

    const availableUntil = nextReservation?.start_date ?? null;

    return {
      availableFrom,
      availableUntil,
      nextReservationStart: nextReservation?.start_date ?? null,
      nextReservationEnd: nextReservation?.end_date ?? null,
      hasCurrentConflict: Boolean(activeConflict),
    };
  }

  async hasVehicleConflict(vehicleId: string, startDate: string, endDate: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .in('status', ['confirmed', 'active'])
      .or(`and(start_date.lt.${endDate},end_date.gt.${startDate})`)
      .limit(1);

    if (error) {
      throw new Error(`Failed to validate reservation overlap: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  }

  async createReservation(input: ReservationCreationInput & { userId: string; estimatedCost: number; }): Promise<ReservationRecord> {
    const reservationStatus: ReservationStatus = 'pending';
    const paymentStatus = 'pending';
    const paymentDescription = input.paymentMethod === 'cash'
      ? 'Pago en sucursal pendiente'
      : 'Pago WebPay Plus en integración pendiente';

    const { data: reservation, error: reservationError } = await this.supabase
      .from('reservations')
      .insert([
        {
          user_id: input.userId,
          vehicle_id: input.vehicleId,
          start_date: input.startDate,
          end_date: input.endDate,
          estimated_cost: input.estimatedCost,
          actual_cost: null,
          status: reservationStatus,
          notes: input.notes ?? paymentDescription,
        },
      ])
      .select('*')
      .single();

    if (reservationError || !reservation) {
      throw new Error(`Failed to create reservation: ${reservationError?.message ?? 'Unknown error'}`);
    }

    const { error: paymentError } = await this.supabase
      .from('payments')
      .insert([
        {
          reservation_id: reservation.id,
          user_id: input.userId,
          amount: input.estimatedCost,
          payment_method: input.paymentMethod,
          status: paymentStatus,
          transaction_id: input.paymentMethod === 'cash' ? null : `WEBPAY-TEST-${reservation.id}`,
          description: paymentDescription,
        },
      ]);

    if (paymentError) {
      throw new Error(`Failed to create payment: ${paymentError.message}`);
    }

    return reservation as ReservationRecord;
  }

  async updateReservationPaymentStatus(
    reservationId: string,
    updates: ReservationPaymentUpdateInput
  ): Promise<void> {
    const reservationUpdate: Record<string, unknown> = {};
    const paymentUpdate: Record<string, unknown> = {};

    if (updates.reservationStatus) {
      reservationUpdate.status = updates.reservationStatus;
    }

    if (typeof updates.actualCost === 'number' || updates.actualCost === null) {
      reservationUpdate.actual_cost = updates.actualCost;
    }

    if (updates.paymentStatus) {
      paymentUpdate.status = updates.paymentStatus;
    }

    if (updates.transactionId !== undefined) {
      paymentUpdate.transaction_id = updates.transactionId;
    }

    if (updates.paymentDescription !== undefined) {
      paymentUpdate.description = updates.paymentDescription;
    }

    if (Object.keys(reservationUpdate).length > 0) {
      const { error: reservationError } = await this.supabase
        .from('reservations')
        .update(reservationUpdate)
        .eq('id', reservationId);

      if (reservationError) {
        throw new Error(`Failed to update reservation: ${reservationError.message}`);
      }
    }

    if (Object.keys(paymentUpdate).length > 0) {
      const { error: paymentError } = await this.supabase
        .from('payments')
        .update(paymentUpdate)
        .eq('reservation_id', reservationId);

      if (paymentError) {
        throw new Error(`Failed to update payment: ${paymentError.message}`);
      }
    }
  }

  async cancelReservation(
    reservationId: string,
    userId: string,
    isAdmin = false
  ): Promise<ReservationRecord> {
    const reservation = await this.getReservationById(reservationId);

    if (!reservation) {
      throw new Error('No se encontró la reserva');
    }

    if (!isAdmin && reservation.user_id !== userId) {
      throw new Error('No tienes permisos para cancelar esta reserva');
    }

    if (reservation.status === 'completed' || reservation.status === 'cancelled') {
      throw new Error('Esta reserva ya no puede cancelarse');
    }

    const { data: paymentRow, error: paymentError } = await this.supabase
      .from('payments')
      .select('status')
      .eq('reservation_id', reservationId)
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch reservation payment: ${paymentError.message}`);
    }

    const paymentStatus: PaymentStatus = paymentRow?.status === 'completed' ? 'refunded' : 'failed';

    await this.updateReservationPaymentStatus(reservationId, {
      reservationStatus: 'cancelled',
      paymentStatus,
      actualCost: null,
      paymentDescription: paymentStatus === 'refunded'
        ? 'Reserva cancelada con reembolso'
        : 'Reserva cancelada por el usuario',
    });

    const updatedReservation = await this.getReservationById(reservationId);

    if (!updatedReservation) {
      throw new Error('No se pudo obtener la reserva cancelada');
    }

    return updatedReservation;
  }
  /**
   * Obtiene el historial completo de reservas
   */
  async getAllReservations(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }

    return data || [];
  }
}

export const reservationRepository = new ReservationRepository();