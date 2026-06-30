/**
 * Server Action: requestRegistration
 * Capa: Controladores (Server Actions de Next.js)
 * 
 * Responsabilidad: Validar entrada con Zod y llamar al Servicio
 * NO contiene lógica de negocio
 */

'use server';

import { z } from 'zod';
import { authService } from '@/services/authService';
import { RegistrationResponse } from '@/types/auth';

/**
 * Schema de validación para solicitud de registro
 */
const RegistrationRequestSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Contraseña muy corta'),
    password_confirm: z.string(),
    first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    phone: z.string().regex(/^[\d\s\-\+\(\)]{7,}$/, 'Teléfono inválido'),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
    nationality: z.string().min(2, 'Nacionalidad requerida'),
    national_id: z
      .string()
      .min(5, 'ID nacional muy corta')
      .max(50, 'ID nacional muy larga'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

export type RegistrationRequestInput = z.infer<typeof RegistrationRequestSchema>;

/**
 * Server Action: Solicita registro de usuario (KYC)
 * 
 * @param input Datos de registro (sin archivo)
 * @param photoFile Archivo de foto de cédula (manejado por el cliente)
 * @returns Usuario creado con kyc_status=pending
 */
export async function requestRegistration(
  input: RegistrationRequestInput,
  photoFile: File
): Promise<RegistrationResponse> {
  try {
    // 1. Validar entrada con Zod
    const validatedInput = RegistrationRequestSchema.parse(input);

    // 2. Validar que tenemos el archivo
    if (!photoFile) {
      throw new Error('Foto de cédula requerida');
    }

    // 3. Llamar al Servicio con validación de BR-01
    const user = await authService.requestRegistration({
      ...validatedInput,
      id_photo: photoFile,
    });

    return {
      user,
      message:
        'Solicitud de registro enviada. Tu cuenta está pendiente de aprobación. Recibirás una notificación cuando sea procesada.',
    };
  } catch (error) {
    // Log del error para debugging
    console.error('requestRegistration error:', error);

    // Manejo de errores específicos
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => issue.message).join(', ');
      throw new Error(`Validación inválida: ${messages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('Error desconocido al procesar la solicitud de registro');
  }
}
