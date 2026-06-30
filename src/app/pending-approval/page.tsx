/**
 * Página: /pending-approval
 * UC-02: Muestra cuando el KYC está pendiente de aprobación
 */

import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono de reloj */}
        <div className="mb-6 inline-block">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Cuenta en Revisión</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Tu solicitud de registro ha sido recibida correctamente. Nuestro equipo de verificación
          está validando tu identidad en este momento.
        </p>

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">¿Qué sucede ahora?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Revisamos tu documento de identidad</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Validamos tus datos personales</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Completamos nuestras verificaciones de seguridad</span>
            </li>
          </ul>
        </div>

        {/* Timeline */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-amber-900 mb-2">Tiempo de revisión estimado</p>
          <p className="text-2xl font-bold text-amber-600">24 a 48 horas</p>
          <p className="text-xs text-amber-700 mt-1">En casos normales</p>
        </div>

        {/* Notificación */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-green-800">
            <span className="font-semibold">📧 Notificación:</span> Te enviaremos un email cuando
            tu cuenta sea aprobada
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Ir al Inicio
          </Link>

          <Link
            href="/auth/register"
            className="block w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Regresar al Registro
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">
            ¿Preguntas o problemas con tu solicitud?
          </p>
          <a
            href="mailto:soporte@turismosur.com"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Contacta a nuestro soporte
          </a>
        </div>
      </div>
    </div>
  );
}
