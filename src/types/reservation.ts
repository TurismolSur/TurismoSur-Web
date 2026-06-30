export type ReservationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface ReservationRecord {
  id: string;
  user_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  estimated_cost: number;
  actual_cost: number | null;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationCreationInput {
  vehicleId: string;
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ReservationPaymentUpdateInput {
  reservationStatus?: ReservationStatus;
  paymentStatus?: PaymentStatus;
  transactionId?: string | null;
  actualCost?: number | null;
  paymentDescription?: string | null;
}

export interface VehicleBookingWindow {
  availableFrom: string;
  availableUntil: string | null;
  nextReservationStart: string | null;
  nextReservationEnd: string | null;
  hasCurrentConflict: boolean;
}