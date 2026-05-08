/**
 * Página: Inicio / Home
 * Capa: Presentación (App Router)
 * 
 * Landing Page principal con secciones informativas
 */

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';

export const metadata = {
  title: 'TurismoSur | Sistema Web de Arriendo de Vehículos',
  description:
    'Arriendo de vehículos de calidad con soporte profesional. Toyota, Ford, Chevrolet, Audi, Mazda y más.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="w-full min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Arriendo de Vehículos
                <br />
                <span className="text-yellow-300">Confiable y Seguro</span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Contamos con camionetas 4x4, 4x2, Sedán, SUV de las mejores marcas como Toyota,
                Ford, Chevrolet, Audi, Mazda, entre otras. Vehículos en perfecto estado para tus
                viajes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link
                  href="/auth/register"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-lg transition duration-200 text-center text-lg shadow-lg"
                >
                  Solicitar Cuenta
                </Link>

                <a
                  href="#contact"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-lg transition duration-200 text-center text-lg"
                >
                  Contáctanos
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-12 border-t border-blue-400">
                <div>
                  <p className="text-3xl font-bold text-yellow-300">150+</p>
                  <p className="text-blue-100">Vehículos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-300">1000+</p>
                  <p className="text-blue-100">Clientes Satisfechos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-300">24/7</p>
                  <p className="text-blue-100">Soporte</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
                <svg
                  className="w-full h-96 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm.9-9l1.04 3H4.05L5.09 7h12.41z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 h-96 flex items-center justify-center">
              <svg
                className="w-48 h-48 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <span className="text-blue-600 font-semibold text-sm uppercase">Acerca de Nosotros</span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">¿Quiénes Somos?</h2>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed">
                TurismoSur es una empresa líder en arriendo de vehículos con más de 10 años de
                experiencia en el mercado. Nos dedicamos a brindar soluciones confiables y seguras
                para tus necesidades de transporte.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Nuestro compromiso es mantener una flota moderna, bien mantenida y asegurada. Cada
                vehículo es inspeccionado regularmente para garantizar la máxima seguridad y
                comodidad para nuestros clientes.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Experiencia Comprobada</h3>
                    <p className="text-gray-600">Más de una década sirviendo a clientes satisfechos</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Flota Diversa</h3>
                    <p className="text-gray-600">Vehículos para todos tus necesidades de transporte</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Seguridad Garantizada</h3>
                    <p className="text-gray-600">Todos nuestros vehículos están asegurados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="services" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase">Lo Que Ofrecemos</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 mt-4">Soluciones completas para tus necesidades de transporte</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Arriendo Flexible</h3>
              <p className="text-gray-600 leading-relaxed">
                Elige la duración que necesites. Ofrecemos opciones por horas, días o meses con
                tarifas especiales.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Soporte 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro equipo está disponible las 24 horas para ayudarte. Asistencia en carretera
                incluida.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vehículos Verificados</h3>
              <p className="text-gray-600 leading-relaxed">
                Todos nuestros vehículos pasan inspecciones rigurosas. Garantizamos calidad y
                seguridad.
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precios Competitivos</h3>
              <p className="text-gray-600 leading-relaxed">
                Tarifas justas sin sorpresas. Consulta nuestras promociones especiales para
                reservas anticipadas.
              </p>
            </div>

            {/* Service 5 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Documentación Simple</h3>
              <p className="text-gray-600 leading-relaxed">
                Proceso de registro rápido y seguro. Verificación de identidad online en minutos.
              </p>
            </div>

            {/* Service 6 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Entrega a Domicilio</h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe tu vehículo en la ubicación que desees. Servicio adicional disponible en
                zonas de cobertura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase">Ponte en Contacto</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Ubicación y Contacto</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Card 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.26.559.738 1.09 1.341 1.285.603.195 1.207.06 1.738-.393l2.454-2.154a1 1 0 011.408.176l3.352 4.353c.23.331.285.795.074 1.242l-1.02 2.04c-.525 1.049-.793 2.428-.41 3.771.383 1.343 1.259 2.471 2.324 3.012.564.3 1.077.357 1.516.268l2.559-.424a1 1 0 00.832-1.012l-.283-3.011c-.071-.76.166-1.334.576-1.753 1.216-1.212 1.879-2.922 1.879-4.802 0-1.88-.663-3.589-1.879-4.802-.41-.419-.647-.993-.576-1.753l.283-3.011a1 1 0 00-.832-1.012l-2.559-.424c-.439-.089-.952-.032-1.516.268-1.065.541-1.941 1.67-2.324 3.012-.383 1.343-.115 2.722.41 3.771l1.02 2.04c.211.447.156.911-.074 1.242l-3.352-4.353a1 1 0 00-1.408-.176l-2.454 2.154c-.531.453-1.135.588-1.738.393-.603-.195-1.081-.726-1.341-1.285l1.548-.773a1 1 0 00.54-1.06l-.74-4.435A1 1 0 003.153 3H2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Llámanos</h3>
              <p className="text-gray-600 mb-4">Disponibles 24/7 para atenderte</p>
              <a
                href="tel:+56971052212"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                +56 9 7105 2212
              </a>
            </div>

            {/* Contact Card 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Correo Electrónico</h3>
              <p className="text-gray-600 mb-4">Respuesta en menos de 24 horas</p>
              <a
                href="mailto:info@turismosur.cl"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                info@turismosur.cl
              </a>
            </div>

            {/* Contact Card 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ubicación</h3>
              <p className="text-gray-600 mb-4">Estamos ubicados en Villarica, Lican-Ray y Pucon</p>
              <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200">
                Ver Mapa
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Preguntas?</h3>
            <p className="text-gray-600 text-lg mb-6">
              Contáctanos y uno de nuestros especialistas te ayudará a encontrar el vehículo perfecto
              para ti.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 text-lg"
            >
              Solicitar Registro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">TurismoSur</h4>
              <p className="text-sm">
                Sistema Web de Arriendo de Vehículos. Vehículos de calidad para tus viajes.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition duration-200">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition duration-200">
                    Quiénes Somos
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition duration-200">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition duration-200">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition duration-200">
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition duration-200">
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contacto</h4>
              <p className="text-sm mb-2">
                <strong>Teléfono:</strong> +56 9 7105 2212
              </p>
              <p className="text-sm">
                <strong>Email:</strong> info@turismosur.cl
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2026 TurismoSur. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
