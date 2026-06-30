import { vehicleRepository } from '@/repositories/vehicleRepository';
import { reservationRepository } from '@/repositories/reservationRepository';

export class ReportService {
  /**
   * Genera las métricas principales para el panel de reportes
   */
  async getDashboardMetrics() {
    try {
      // Obtenemos todos los datos en paralelo para mayor velocidad
      const [vehicles, reservations] = await Promise.all([
        vehicleRepository.getAvailableVehicles(),
        reservationRepository.getAllReservations()
      ]);

      // 1. Cálculos de Flota
      const totalVehicles = vehicles.length;

      // 2. Cálculos de Reservas
      const totalReservations = reservations.length;
      const pendingReservations = reservations.filter((r: any) => r.status === 'pending').length;
      
      // 3. Cálculos Financieros (Sumamos el total de las reservas confirmadas/completadas)
      const validReservations = reservations.filter((r: any) => r.status !== 'cancelled' && r.status !== 'rejected');
      const totalRevenue = validReservations.reduce((sum: number, res: any) => sum + (Number(res.total_price) || 0), 0);

      return {
        totalVehicles,
        totalReservations,
        pendingReservations,
        totalRevenue,
      };
    } catch (error) {
      console.error('ReportService: Error al generar métricas', error);
      // Valores por defecto en caso de error
      return { totalVehicles: 0, totalReservations: 0, pendingReservations: 0, totalRevenue: 0 };
    }
  }
}

export const reportService = new ReportService();