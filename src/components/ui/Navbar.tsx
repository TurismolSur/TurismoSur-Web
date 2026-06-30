/**
 * Navbar Component
 * Capa: Presentación (UI)
 * 
 * Responsabilidad ÚNICA: Renderizar navegación global
 * CERO lógica de negocio
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">TurismoSur</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200"
            >
              Inicio
            </Link>

            <a
              href="#about"
              className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200"
            >
              Quiénes Somos
            </a>

            <a
              href="#services"
              className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200"
            >
              Servicios
            </a>

            <a
              href="#contact"
              className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200"
            >
              Contacto
            </a>

            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200"
            >
              Iniciar Sesión
            </Link>

            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Regístrate
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inicio
            </Link>

            <a
              href="#about"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Quiénes Somos
            </a>

            <a
              href="#services"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Servicios
            </a>

            <a
              href="#contact"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contacto
            </a>

            <Link
              href="/auth/login"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>

            <Link
              href="/auth/register"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Regístrate
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
