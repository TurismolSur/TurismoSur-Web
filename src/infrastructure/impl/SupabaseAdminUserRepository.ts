import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export type KycReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AdminUserRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  nationality: string | null;
  national_id: string | null;
  role: 'customer' | 'admin' | 'support';
  is_active: boolean;
  kyc_status: KycReviewStatus;
  id_photo_url: string | null;
  kyc_approved_at: string | null;
  kyc_rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseAdminUserRepository {
  private get supabase() {
    return getSupabaseAdminClient();
  }

  private async confirmAuthUser(userId: string): Promise<void> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);

    if (error) {
      throw new Error(`No se pudo validar el usuario en Auth: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('No existe una cuenta de autenticación asociada a este usuario');
    }

    const { error: updateError } = await this.supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (updateError) {
      throw new Error(`No se pudo confirmar el usuario en Auth: ${updateError.message}`);
    }
  }

  async findByKYCStatus(status: KycReviewStatus): Promise<AdminUserRecord[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('kyc_status', status)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`No se pudo obtener usuarios por KYC: ${error.message}`);
    }

    return (data ?? []) as AdminUserRecord[];
  }

  async approveUser(userId: string): Promise<AdminUserRecord> {
    await this.confirmAuthUser(userId);

    const { data, error } = await this.supabase
      .from('users')
      .update({
        kyc_status: 'approved',
        is_active: true,
        kyc_approved_at: new Date().toISOString(),
        kyc_rejected_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`No se pudo aprobar el usuario: ${error.message}`);
    }

    return data as AdminUserRecord;
  }

  async rejectUser(userId: string, reason: string): Promise<AdminUserRecord> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        kyc_status: 'rejected',
        is_active: false,
        kyc_approved_at: null,
        kyc_rejected_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`No se pudo rechazar el usuario: ${error.message}`);
    }

    return data as AdminUserRecord;
  }
}

export const adminUserRepository = new SupabaseAdminUserRepository();