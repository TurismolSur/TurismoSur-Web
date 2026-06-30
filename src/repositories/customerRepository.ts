import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export class CustomerRepository {
  private get supabase() {
    return getSupabaseAdminClient();
  }

  /**
   * Obtiene la lista completa de usuarios/clientes registrados
   */
  async getAllCustomers(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('users') // Consultamos la tabla 'users' que tienes en Supabase
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }

    return data || [];
  }
}

export const customerRepository = new CustomerRepository();