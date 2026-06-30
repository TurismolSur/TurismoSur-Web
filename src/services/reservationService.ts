import { reservationRepository } from '@/repositories/reservationRepository';

export class ReservationService {
  /**
   * Obtiene todas las reservas para el panel administrativo
   */
  async getAllReservations(): Promise<any[]> {
    try {
      return await reservationRepository.getAllReservations();
    } catch (error) {
      console.error('ReservationService: Error al obtener reservas', error);
      return [];
    }
  }
}

// Exportamos una instancia (Singleton) para usarla en el resto del proyecto
export const reservationService = new ReservationService();