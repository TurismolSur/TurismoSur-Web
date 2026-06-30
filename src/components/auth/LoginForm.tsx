/**
 * LoginForm Component
 * Capa: Presentación (UI)
 * 
 * Responsabilidad ÚNICA: Renderizar formulario de login
 * CERO lógica de negocio - solo captura datos y llama a Server Action
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginUser, type LoginInput } from '@/actions/loginUser';

interface FormErrors {
  [key: string]: string;
}

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrors({});

    try {
      // Llamar Server Action
      // Nota: loginUser() redirige directamente, no retorna
      await loginUser(formData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      
      // Diferenciar entre errores de KYC y otros
      if (errorMsg.includes('rechazada')) {
        setError(errorMsg); // Mantener mensaje de KYC rechazado
      } else if (errorMsg.includes('Email o contraseña')) {
        setError('Email o contraseña incorrectos');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
      <p className="text-gray-600 mb-8">Ingresa tus credenciales para acceder a tu cuenta</p>

      {/* Error General */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Email */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="tu@email.com"
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Contraseña */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="••••••••"
          disabled={isLoading}
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
      </div>

      {/* Botones */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 mb-4"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      {/* Link a registro */}
      <div className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
          Solicitar registro
        </Link>
      </div>

      <div className="mt-4">
        <Link
          href="/"
          className="block w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition duration-200 text-center"
        >
          Volver al lobby
        </Link>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        Al iniciar sesión, aceptas nuestros términos y condiciones
      </p>
    </form>
  );
}
