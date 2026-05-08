/**
 * Página: /auth/register
 * Capa: Presentación (App Router)
 * 
 * Página de registro - solicitud KYC
 */

import React from 'react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

export const metadata = {
  title: 'Solicitar Registro | TurismoSur',
  description: 'Solicita tu registro en TurismoSur. Requiere verificación de identidad.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TurismoSur</h1>
          <p className="text-gray-600 text-lg">Sistema de Arriendo de Vehículos</p>
        </div>

        {/* Form Container */}
        <RegistrationForm />

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline font-semibold">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
