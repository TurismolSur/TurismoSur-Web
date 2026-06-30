const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Proporciona la ruta a tu app Next.js para cargar next.config.js y .env en el entorno de test
  dir: './',
})

// Agregar cualquier configuración personalizada de jest aquí
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig es exportado de esta manera para asegurar que next/jest
// puede cargar la configuración de Next.js que depende de variables de entorno
module.exports = createJestConfig(customJestConfig)
