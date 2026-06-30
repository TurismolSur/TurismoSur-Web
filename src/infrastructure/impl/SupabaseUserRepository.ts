/**
 * ARQUITECTURA LIMPIA - IMPLEMENTACIÓN EN INFRAESTRUCTURA
 * Capa: Infrastructure
 * 
 * Aquí está el ACOPLAMIENTO a Supabase.
 * Si cambias a MongoDB o PostgreSQL directo, solo cambias esta capa.
 * Domain y el resto del código siguen siendo los mismo.
 */

import { UserEntity } from '@/domain/entities/UserEntity';
import { IUserRepository } from '@/domain/repositories/IRepositories';
import { supabase } from '@/lib/supabase';

export class SupabaseUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return null;

    // Convertir fila de BD → Entidad de Dominio
    return UserEntity.hydrate({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: new Date(data.date_of_birth),
      role: data.role,
      kycStatus: data.kyc_status,
      isActive: data.is_active,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return null;

    return UserEntity.hydrate({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: new Date(data.date_of_birth),
      role: data.role,
      kycStatus: data.kyc_status,
      isActive: data.is_active,
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const userData = user.toJSON();

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: userData.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          date_of_birth: userData.dateOfBirth.toISOString().split('T')[0],
          role: userData.role,
          kyc_status: userData.kycStatus,
          is_active: userData.isActive,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }

    return UserEntity.hydrate({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: new Date(data.date_of_birth),
      role: data.role,
      kycStatus: data.kyc_status,
      isActive: data.is_active,
    });
  }

  async findByKYCStatus(status: 'pending' | 'approved' | 'rejected'): Promise<UserEntity[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('kyc_status', status);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map((row) =>
      UserEntity.hydrate({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: new Date(row.date_of_birth),
        role: row.role,
        kycStatus: row.kyc_status,
        isActive: row.is_active,
      })
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
