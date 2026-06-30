'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminKycService } from '@/services/adminKycService';

const UserIdSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
});

const RejectionSchema = UserIdSchema.extend({
  reason: z.string().min(3, 'Debes indicar un motivo de rechazo'),
});

function extractFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== 'string') {
    throw new Error(`El campo ${key} es requerido`);
  }

  return value;
}

export async function approvePendingUserAction(formData: FormData): Promise<never> {
  try {
    const payload = UserIdSchema.parse({
      userId: extractFormValue(formData, 'userId'),
    });

    await adminKycService.approveUser(payload.userId);
    revalidatePath('/admin/kyc');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo aprobar el usuario';
    redirect(`/admin/kyc?error=${encodeURIComponent(message)}`);
  }

  redirect('/admin/kyc?result=approved');
}

export async function rejectPendingUserAction(formData: FormData): Promise<never> {
  try {
    const payload = RejectionSchema.parse({
      userId: extractFormValue(formData, 'userId'),
      reason: extractFormValue(formData, 'reason'),
    });

    await adminKycService.rejectUser(payload.userId, payload.reason);
    revalidatePath('/admin/kyc');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo rechazar el usuario';
    redirect(`/admin/kyc?error=${encodeURIComponent(message)}`);
  }

  redirect('/admin/kyc?result=rejected');
}