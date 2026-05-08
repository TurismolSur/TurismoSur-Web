/**
 * UserRepository
 * Capa: Acceso a Datos (Supabase)
 * 
 * Responsabilidad ÚNICA: Comunicarse con Supabase
 * NO contiene lógica de negocio
 */

import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';

export class UserRepository {
  /**
   * Verifica si un email ya existe en la base de datos
   * @param email Email a verificar
   * @returns true si existe, false si no
   */
  async emailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email existence:', error);
      throw new Error(`Failed to check email: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  }

  /**
   * Verifica si un national_id ya existe
   * @param nationalId ID nacional
   * @returns true si existe, false si no
   */
  async nationalIdExists(nationalId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('national_id', nationalId)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking national id:', error);
      throw new Error(`Failed to check national id: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  }

  /**
   * Crea un nuevo usuario en la tabla users (para solicitud de registro KYC)
   * 
   * IMPORTANTE: El userId debe venir de Supabase Auth signUp()
   * 
   * @param userId UUID del usuario (obtenido de Supabase Auth)
   * @param userData Datos del usuario
   * @param idPhotoUrl URL de la foto de cédula en Storage
   * @returns Usuario creado
   */
  async createUser(
    userId: string,
    userData: {
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      date_of_birth: string;
      nationality: string;
      national_id: string;
      idPhotoUrl: string;
    }
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId, // Usar el UUID de Supabase Auth
          email: userData.email.toLowerCase(),
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          nationality: userData.nationality,
          national_id: userData.national_id,
          role: 'customer',
          is_active: false, // Inicia desactivado (pendiente KYC)
          kyc_status: 'pending',
          id_photo_url: userData.idPhotoUrl,
          password_hash: '', // Supabase Auth maneja la contraseña
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating user in public table:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina un usuario de Supabase Auth (para rollback)
   * 
   * NOTA: Esto requiere usar el cliente de Admin de Supabase
   * con service_role key, NO la anon key
   * 
   * Por ahora, simplemente lanzamos un error explicativo
   * En producción, usa supabase.auth.admin.deleteUser(userId)
   * 
   * @param userId ID del usuario a eliminar de Auth
   */
  async deleteUserFromAuth(userId: string): Promise<void> {
    console.warn(
      `[ROLLBACK] Intento de eliminar usuario ${userId} de Supabase Auth.`,
      'Para hacerlo, se necesita usar el cliente admin de Supabase con service_role key.'
    );

    // En producción, esto sería:
    // const { error } = await supabase.auth.admin.deleteUser(userId);
    // if (error) throw new Error(`Failed to delete user from Auth: ${error.message}`);

    throw new Error(
      'Rollback: Se creó el usuario en Supabase Auth pero falló en BD. ' +
      'Por favor, contacta a soporte para eliminar el usuario de Auth manualmente: ' +
      userId
    );
  }

  /**
   * Obtiene un usuario por email
   * @param email Email del usuario
   * @returns Usuario o null
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No found
      }
      console.error('Error fetching user by email:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene un usuario por ID
   * @param userId ID del usuario
   * @returns Usuario o null
   */
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user by id:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina un usuario de la tabla pública users
   * NOTA: Esto NO elimina de Supabase Auth, solo de la tabla pública
   * 
   * @param userId ID del usuario a eliminar
   */
  async deleteUserFromPublicTable(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user from public table:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

// Singleton instance
export const userRepository = new UserRepository();
