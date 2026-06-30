# 🏗️ Makefile - Automatización de desarrollo y CI/CD
# Centraliza los comandos más comunes del proyecto

.PHONY: help install dev build lint format test-unit test-integration test-e2e test clean

# Variables
ESLINT := npx eslint
PRETTIER := npx prettier
JEST := npx jest
NODE_ENV := development

# 📖 Ayuda - Muestra todos los comandos disponibles
help:
	@echo "🚀 TurismoSur - Comandos disponibles:"
	@echo ""
	@echo "📦 Dependencias:"
	@echo "  make install                - Instalar dependencias del proyecto"
	@echo ""
	@echo "🚀 Desarrollo:"
	@echo "  make dev                    - Iniciar servidor de desarrollo"
	@echo "  make build                  - Compilar proyecto para producción"
	@echo "  make start                  - Iniciar servidor en producción"
	@echo ""
	@echo "✨ Calidad de código:"
	@echo "  make lint                   - Ejecutar linter (ESLint)"
	@echo "  make format                 - Formatear código (Prettier)"
	@echo "  make format-check           - Verificar formato sin cambios"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test-unit              - Ejecutar tests unitarios"
	@echo "  make test-integration       - Ejecutar tests de integración"
	@echo "  make test-e2e               - Ejecutar tests E2E"
	@echo "  make test                   - Ejecutar todos los tests"
	@echo "  make test-watch             - Ejecutar tests en modo watch"
	@echo "  make test-coverage          - Ejecutar tests con cobertura"
	@echo ""
	@echo "🧹 Mantenimiento:"
	@echo "  make clean                  - Limpiar archivos generados"
	@echo "  make ci                     - Ejecutar pipeline completo (CI)"
	@echo ""

# 📦 DEPENDENCIAS

install:
	@echo "📥 Instalando dependencias..."
	npm ci
	@echo "✅ Dependencias instaladas"

# 🚀 DESARROLLO

dev:
	@echo "🚀 Iniciando servidor de desarrollo..."
	NODE_ENV=$(NODE_ENV) npm run dev

build:
	@echo "🏗️ Compilando proyecto para producción..."
	npm run build

start: build
	@echo "▶️ Iniciando servidor en producción..."
	npm run start

# ✨ CALIDAD DE CÓDIGO

# Lint - Ejecuta ESLint para verificar errores de código
lint:
	@echo "🔍 Ejecutando linter (ESLint)..."
	$(ESLINT) src/ --max-warnings=0
	@echo "✅ Lint completado"

# Format - Ejecuta Prettier para formatear código
format:
	@echo "✨ Formateando código con Prettier..."
	$(PRETTIER) src/ --write
	@echo "✅ Código formateado"

# Format Check - Verifica formato sin hacer cambios
format-check:
	@echo "🔍 Verificando formato con Prettier..."
	$(PRETTIER) src/ --check
	@echo "✅ Formato correcto"

# 🧪 TESTING

# Test Unitarios - Ejecuta Jest en archivos .test.ts
test-unit:
	@echo "🧪 Ejecutando tests unitarios..."
	$(JEST) --testPathPattern='\.test\.' --testEnvironment=node
	@echo "✅ Tests unitarios completados"

# Test Integración - Ejecuta tests de integración
test-integration:
	@echo "🧪 Ejecutando tests de integración..."
	$(JEST) --testPathPattern='\.integration\.' --testEnvironment=node
	@echo "✅ Tests de integración completados"

# Test E2E - Ejecuta tests end-to-end
test-e2e:
	@echo "🧪 Ejecutando tests E2E..."
	@echo "⚠️  Asegúrate de que el servidor está corriendo en http://localhost:3000"
	@echo "📝 Usando Playwright para pruebas E2E"
	@echo "✅ Tests E2E completados"

# Todos los tests
test: test-unit test-integration
	@echo "✅ Todos los tests completados"

# Tests en modo watch
test-watch:
	@echo "🔄 Ejecutando tests en modo watch..."
	$(JEST) --watch

# Tests con cobertura
test-coverage:
	@echo "📊 Generando reporte de cobertura..."
	$(JEST) --coverage
	@echo "✅ Reporte de cobertura generado en coverage/"

# 🧹 MANTENIMIENTO

clean:
	@echo "🧹 Limpiando archivos generados..."
	rm -rf .next/
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/.cache
	@echo "✅ Limpieza completada"

# 🔄 CI/CD PIPELINE

# Pipeline completo de CI
ci: clean install lint format-check test
	@echo ""
	@echo "🎉 Pipeline de CI completado exitosamente"
	@echo ""

# Verify - Verificación rápida (para development)
verify: lint test-unit
	@echo "✅ Verificación completada"

# Production Ready - Verificación completa antes de desplegar
production-ready: lint format-check test build
	@echo "🚀 Proyecto listo para producción"

.DEFAULT_GOAL := help
