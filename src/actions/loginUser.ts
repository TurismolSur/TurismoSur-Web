/**
 * Server Action: loginUser
 * Capa: Controladores (Server Actions de Next.js)
 * * Responsabilidad: Validar entrada con Zod y llamar al Servicio
 * NO contiene lógica de negocio
 */

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { authService } from '@/services/authService';

/**
 * Schema de validación para login
 */
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Server Action: Autentica usuario y maneja enrutamiento inteligente según KYC status
 * * @param input Credenciales de usuario (email y password)
 * @returns No retorna (redirige directamente) o lanza error
 */
export async function loginUser(input: LoginInput): Promise<never> {
  // Inicializamos con un string vacío para que TS no reclame
  let urlToRedirect: string = ''; 

  try {
    const validatedInput = LoginSchema.parse(input);
    const { redirectUrl } = await authService.login(validatedInput.email, validatedInput.password);
    
    urlToRedirect = redirectUrl;
    
  } catch (error) {
    console.error('loginUser error:', error);

    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => issue.message).join(', ');
      throw new Error(`Validación inválida: ${messages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('Error desconocido en login');
  }

  // Ahora TS está seguro de que urlToRedirect tiene un valor
  redirect(urlToRedirect);
}