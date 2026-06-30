import { customerRepository } from '@/repositories/customerRepository';

export class CustomerService {
  /**
   * Obtiene todos los clientes para el panel administrativo
   */
  async getAllCustomers(): Promise<any[]> {
    try {
      return await customerRepository.getAllCustomers();
    } catch (error) {
      console.error('CustomerService: Error al obtener clientes', error);
      return []; // Si hay un error, devolvemos una lista vacía para no romper la pantalla
    }
  }
}

export const customerService = new CustomerService();