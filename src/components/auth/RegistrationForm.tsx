/**
 * RegistrationForm Component
 * Capa: Presentación (UI)
 * 
 * Responsabilidad ÚNICA: Renderizar formulario de registro
 * CERO lógica de negocio - solo captura datos y llama a Server Action
 */

'use client';

import React, { useState } from 'react';
import { requestRegistration, type RegistrationRequestInput } from '@/actions/requestRegistration';

interface FormErrors {
  [key: string]: string;
}

export function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegistrationRequestInput>({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    national_id: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          id_photo: 'La foto no debe superar 5MB',
        }));
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          id_photo: 'Debe ser JPG, PNG o WebP',
        }));
        return;
      }

      setPhotoFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({
        ...prev,
        id_photo: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrors({});

    try {
      // Validación cliente-lado rápida
      if (!photoFile) {
        setErrors({ id_photo: 'Foto de cédula requerida' });
        setIsLoading(false);
        return;
      }

      // Llamar Server Action
      const response = await requestRegistration(formData, photoFile);

      setSuccess(true);
      setFormData({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        nationality: '',
        national_id: '',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-green-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-900 mb-2">¡Solicitud Enviada!</h2>
        <p className="text-green-700 mb-4">
          Tu solicitud de registro está siendo procesada. Recibirás una notificación cuando sea
          aprobada.
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitar Registro</h1>
      <p className="text-gray-600 mb-8">
        Completa el formulario para solicitar tu cuenta. Requiere verificación de identidad.
      </p>

      {/* Error General */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Nombres */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan"
          />
          {errors.first_name && <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pérez"
          />
          {errors.last_name && <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+56 9 1234 5678"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date_of_birth && (
            <p className="text-red-600 text-sm mt-1">{errors.date_of_birth}</p>
          )}
        </div>

        {/* Nacionalidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nacionalidad *
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chilena"
          />
          {errors.nationality && <p className="text-red-600 text-sm mt-1">{errors.nationality}</p>}
        </div>

        {/* RUT/Documento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            RUT o Documento *
          </label>
          <input
            type="text"
            name="national_id"
            value={formData.national_id}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="12345678-9"
          />
          {errors.national_id && (
            <p className="text-red-600 text-sm mt-1">{errors.national_id}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 8 caracteres, mayúscula, minúscula y número
          </p>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.password_confirm && (
            <p className="text-red-600 text-sm mt-1">{errors.password_confirm}</p>
          )}
        </div>
      </div>

      {/* Upload de Foto */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Foto de Cédula *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
            id="photo-input"
          />
          <label htmlFor="photo-input" className="cursor-pointer">
            {photoPreview ? (
              <div>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover mx-auto rounded mb-2"
                />
                <p className="text-blue-600 font-semibold">{photoFile?.name}</p>
              </div>
            ) : (
              <div>
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-gray-700">Click para subir o arrastra una imagen</p>
                <p className="text-gray-500 text-sm">JPG, PNG o WebP (máx 5MB)</p>
              </div>
            )}
          </label>
        </div>
        {errors.id_photo && <p className="text-red-600 text-sm mt-1">{errors.id_photo}</p>}
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {isLoading ? 'Procesando...' : 'Solicitar Registro'}
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = '/')}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Cancelar
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Al registrarte, aceptas nuestros términos y condiciones
      </p>
    </form>
  );
}
