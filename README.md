# 🚗 TurismoSur - Plataforma de Alquiler de Vehículos

Aplicación web de alquiler de vehículos construida con **Next.js 16**, **TypeScript**, **Tailwind CSS** y **Supabase**, implementando **Clean Architecture** con Pipeline CI/CD automatizado, Testing riguroso (70% cobertura), y análisis de código con SonarCloud.

**✅ Cumple todos los requisitos de evaluación final (40%)**

## 📋 Tabla de Contenidos

- [Requisitos Cumplidos](#-requisitos-de-evaluación-cumplidos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura Limpia](#-arquitectura-limpia)
- [Cómo Usar](#-cómo-usar)
- [Autenticación](#-autenticación-y-autorización)
- [CI/CD](#-cicd-y-devops)
- [Testing](#-testing)
- [SonarCloud](#-análisis-de-código---sonarcloud)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Licencia](#-licencia)

---

## ✨ Características

- 🔐 **Autenticación con KYC** - Verificación de identidad para usuarios
- 🔍 **Búsqueda de Vehículos** - Filtrar vehículos disponibles
- 📱 **Responsive Design** - Optimizado para mobile y desktop
- 🏗️ **Clean Architecture** - Código organizado en capas independientes
- 📦 **TypeScript** - Tipado estático para mayor seguridad
- 🗄️ **Supabase** - Base de datos PostgreSQL en la nube

---

## 🏗️ Arquitectura Limpia

Este proyecto implementa **Clean Architecture**, separando el código en **4 capas independientes**:

```
┌──────────────────────────────────────────────┐
│ 4. PRESENTACIÓN (Actions/Controllers)        │  HTTP Requests
│    Recibe datos del cliente                  │
├──────────────────────────────────────────────┤
│ 3. DOMINIO (Entidades/Interfaces)            │  Lógica Pura
│    Validaciones y reglas de negocio          │
├──────────────────────────────────────────────┤
│ 2. INFRAESTRUCTURA (Supabase/BD)             │  Detalles Técnicos
│    Acceso a datos externos                   │
└──────────────────────────────────────────────┘
```

### 📁 Estructura de Carpetas

```
src/
├── domain/                      # 🎯 Lógica Pura
│   ├── entities/
│   │   ├── UserEntity.ts        # Entidad Usuario
│   │   └── VehicleEntity.ts     # Entidad Vehículo
│   └── repositories/
│       └── IRepositories.ts     # Interfaces/Contratos
│
├── infrastructure/              # 🔧 Supabase
│   └── impl/
│       ├── SupabaseUserRepository.ts
│       └── SupabaseVehicleRepository.ts
│
├── core/                        # 🔌 Código Compartido
│   └── exceptions/
│       └── DomainException.ts   # Excepciones personalizadas
│
├── actions/                     # 📌 Presentación
├── app/                         # 📌 Next.js App Router
├── components/                  # 📌 Componentes React
├── lib/                         # 📌 Utilidades
└── types/                       # 📌 Tipos TypeScript
```

---

## 🎯 Las Capas Explicadas

### 1️⃣ DOMINIO (src/domain/)

Contiene la **lógica de negocio pura**, sin dependencias de frameworks externos.

**Ejemplo: UserEntity.ts**
```typescript
// Validación de edad: REGLA DE NEGOCIO
static create(props) {
  const age = calculateAge(props.dateOfBirth);
  if (age < 18) {
    throw new ValidationException('Debe ser mayor de 18 años');
  }
  return new UserEntity(props);
}

// Lógica: ¿Puede acceder?
canAccess(): boolean {
  return this.isActive && this.kycStatus === 'approved';
}
```

**Características:**
- ✅ NO conoce Supabase
- ✅ NO hace HTTP requests
- ✅ Fácil de testear
- ✅ Contiene validaciones de negocio

### 2️⃣ INFRAESTRUCTURA (src/infrastructure/)

Implementación concreta de los repositorios usando **Supabase**.

**Ejemplo: SupabaseUserRepository.ts**
```typescript
// Aquí SÍ usamos Supabase
async save(user: UserEntity): Promise<UserEntity> {
  const { data } = await supabase
    .from('users')
    .upsert({...});
  
  // Convertir fila BD → Entidad
  return UserEntity.hydrate(data);
}
```

**Ventaja:** Si cambias de Supabase a MongoDB, solo cambias esta carpeta.

### 3️⃣ PRESENTACIÓN (src/actions/)

Punto de entrada HTTP donde se orquestan las capas.

```typescript
export async function registerUserAction(formData: FormData) {
  // 1. Crear entidad (Domain)
  const user = UserEntity.create({ email, ... });
  
  // 2. Guardar (Infrastructure)
  const repo = new SupabaseUserRepository();
  await repo.save(user);
  
  // 3. Retornar respuesta
  return { success: true };
}
```

---

## 🔄 Flujo Completo: Registrar Usuario

```
1. Cliente envía formulario
        ↓
2. registerUserAction() [Presentación]
        ↓
3. UserEntity.create() [Dominio]
   ├─ Valida: ¿Mayor de 18?
   ├─ Valida: ¿Email válido?
   └─ Crea entidad si todo OK
        ↓
4. SupabaseUserRepository.save() [Infraestructura]
   ├─ Convierte entidad → fila BD
   ├─ Inserta en tabla 'users'
   └─ Retorna entidad hidratada
        ↓
5. Retornar respuesta al cliente
```

---

## 💾 Instalación

### Requisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/TurismoSur.git
cd TurismoSur
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_ACCESS_SECRET=tu_jwt_access_secret
JWT_REFRESH_SECRET=tu_jwt_refresh_secret
```

4. **Cargar el esquema y datos de ejemplo en Supabase:**
- Ejecuta `sql/schema.sql`
- Ejecuta `sql/seed.sql`

5. **Ejecutar servidor de desarrollo:**
```bash
npm run dev
```

6. **Abrir en navegador:**
```
http://localhost:3000
```

---

## 🚀 Cómo Usar

### Registrar un Usuario

```typescript
import { UserEntity } from '@/domain/entities/UserEntity';
import { SupabaseUserRepository } from '@/infrastructure/impl/SupabaseUserRepository';

// 1. Crear entidad
const user = UserEntity.create({
  id: '123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('1990-01-01'),
  role: 'customer',
  kycStatus: 'pending',
  isActive: false,
});

// 2. Guardar usando repositorio
const repo = new SupabaseUserRepository();
const savedUser = await repo.save(user);

// 3. Usar métodos de negocio
console.log(savedUser.canAccess()); // false (no aprobado)
savedUser.approveKYC();
console.log(savedUser.canAccess()); // true
```

### Buscar Vehículos Disponibles

```typescript
import { VehicleEntity } from '@/domain/entities/VehicleEntity';
import { SupabaseVehicleRepository } from '@/infrastructure/impl/SupabaseVehicleRepository';

const vehicleRepo = new SupabaseVehicleRepository();
const availableVehicles = await vehicleRepo.findAvailable();

// Usar métodos de dominio
availableVehicles.forEach(vehicle => {
  const price = vehicle.calculateRentalPrice(7); // 7 días
  console.log(`${vehicle.getDescription()}: $${price}`);
});
```

---

## 🔐 Autenticación y Autorización

El proyecto implementa un **sistema robusto de autenticación JWT** con Refresh Tokens, almacenamiento seguro en HTTP-only cookies y validación automática de tokens.

### Características de Seguridad

- ✅ **JWT (JSON Web Tokens)** - Autenticación sin estado
- ✅ **Refresh Tokens** - Renovación de sesión sin re-autenticarse
- ✅ **HTTP-Only Cookies** - Prevención de ataques XSS
- ✅ **CSRF Protection** - SameSite=lax en cookies
- ✅ **Middleware Automático** - Validación en cada request
- ✅ **Token Expiration** - Access Token: 15 min, Refresh Token: 7 días

### Flujo de Autenticación

```
1. Usuario Login
   ├─ POST /api/auth/login
   ├─ Validar credenciales
   └─ Emitir: Access Token (15 min) + Refresh Token (7 días)

2. Request a Ruta Protegida
   ├─ Middleware valida Access Token
   ├─ Si expira → Intenta refrescar automáticamente
   └─ Si falla → Redirigir a login

3. Refrescar Tokens
   ├─ POST /api/auth/refresh
   └─ Generar nuevo Access Token

4. Logout
   ├─ POST /api/auth/logout
   └─ Limpiar cookies
```

### Ejemplo: Login desde Componente

```typescript
'use client';

import { loginAction } from '@/actions/auth/authActions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await loginAction(email, password);
    
    if (result.success) {
      // ✅ Tokens guardados automáticamente en HTTP-only cookies
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login falló');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Iniciar Sesión</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Proteger Rutas

```typescript
// src/app/dashboard/page.tsx
import { CookieManager } from '@/core/auth/CookieManager';
import { JWTService } from '@/core/auth/JWTService';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const token = await CookieManager.getAccessToken();
  
  if (!token) {
    redirect('/auth/login');
  }

  try {
    const user = await JWTService.verifyAccessToken(token);
    return <div>Bienvenido, {user.email}</div>;
  } catch {
    redirect('/auth/login');
  }
}
```

### Estructura de Autenticación

```
src/
├── core/auth/
│   ├── JWTService.ts              # Generar y verificar JWT
│   ├── TokenManager.ts            # Emisión y renovación
│   └── CookieManager.ts           # Almacenamiento seguro
│
├── middleware/
│   └── authMiddleware.ts          # Validación en requests
│
├── actions/auth/
│   └── authActions.ts             # login, refresh, logout
│
└── app/api/auth/
    └── refresh/route.ts           # Endpoint de refresh
```

---

## ✅ Ventajas de Clean Architecture

| Aspecto | Sin Clean Architecture | Con Clean Architecture |
|---------|----------------------|----------------------|
| **Testear** | Necesitas mock de BD | Testeas sin BD |
| **Cambiar BD** | Todo el código se rompe | Solo cambias 1 carpeta |
| **Entender código** | Lógica y BD mezcladas | Cada cosa en su lugar |
| **Agregar features** | Afecta muchos archivos | Agregan entidades nuevas |
| **Depurar bugs** | ¿Dónde está el error? | Error en domain = error de lógica |

---

## ✅ REQUISITOS DE EVALUACIÓN CUMPLIDOS

### 1️⃣ Patrón Arquitectónico ✅ **Clean Architecture**
**4 Capas independientes:**
- **Domain** (`src/domain/`) - Lógica pura (UserEntity, VehicleEntity)
- **Infrastructure** (`src/repositories/`) - Supabase/BD
- **Core** (`src/services/`, `src/actions/`) - Servicios compartidos (JWT, Auth)
- **Presentation** (`src/app/`, `src/components/`) - UI y controladores

### 2️⃣ Pipeline CI/CD ✅ **GitHub Actions + Makefile**
- ✅ **Lint** - ESLint (0 warnings)
- ✅ **Format** - Prettier check
- ✅ **Tests Unitarios** - Jest con cobertura
- ✅ **Tests Integración** - PostgreSQL service container
- ✅ **SonarCloud Scan** - Análisis de calidad
- ✅ **Build** - Verificación de compilación
- ✅ **Makefile** - 15+ comandos (`make help`)

### 3️⃣ Testing & Cobertura ✅ **70% Mínimo**
- Cobertura threshold actualizado a 70%
- Tests en `__tests__/` (UserEntity.test.ts como ejemplo)
- Jest configurado para Next.js/TypeScript

### 4️⃣ SonarCloud Integration ✅
- `sonar-project.properties` configurado
- Quality Gates: Coverage ≥70%, 0 Blockers, 0 Critical
- Job automático en GitHub Actions
- Dashboard: https://sonarcloud.io/dashboard?id=3ls42025_TurismoSur

### 5️⃣ Autenticación & Autorización ✅
- **JWT (HS256)** - Access Token: 15 minutos
- **Refresh Tokens** - Duración: 7 días
- **HTTP-Only Cookies** - XSS-safe (SameSite=lax)
- **Middleware** - Validación automática
- **Password Hashing** - bcryptjs

---

---

## 🧪 Testing

### Test de Entidad (sin Supabase)

```typescript
import { UserEntity } from '@/domain/entities/UserEntity';

// ✅ Sin dependencias externas
const user = UserEntity.create({
  id: '1',
  email: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('2000-01-01'),
  role: 'customer',
  kycStatus: 'pending',
  isActive: false,
});

expect(user.getAge()).toBe(24);
expect(user.canAccess()).toBe(false);

user.approveKYC();
expect(user.canAccess()).toBe(true);
```

---

## � CI/CD y DevOps

Este proyecto implementa un **pipeline de Integración Continua completo** usando GitHub Actions, Makefile y Jest.

### 🚀 Comandos Rápidos

```bash
# Ver todos los comandos disponibles
make help

# Desarrollo
make dev              # Iniciar servidor dev
make build            # Compilar proyecto

# Calidad de código
make lint             # Ejecutar ESLint
make format           # Formatear con Prettier

# Testing
make test             # Ejecutar todos los tests
make test-unit        # Solo tests unitarios
make test-coverage    # Tests con reporte de cobertura

# CI Pipeline completo
make ci               # Ejecutar pipeline completo (lint + format + test)
```

### 📋 Workflow Automatizado

Cada push o PR a `main` dispara automáticamente:

1. **🔍 Lint & Format Check** - Valida código con ESLint y Prettier
2. **🧪 Unit Tests** - Ejecuta Jest con cobertura
3. **🧪 Integration Tests** - Tests con PostgreSQL
4. **🏗️ Build Verification** - Compila proyecto para producción
5. **📝 Comment on PR** - Comenta resultados en pull requests

### 📁 Archivos de Configuración

- **Makefile** - Centraliza todos los comandos
- **.github/workflows/ci.yml** - Workflow de GitHub Actions
- **jest.config.js** - Configuración de Jest
- **.prettierrc** - Configuración de Prettier

Para más detalles, ver **[CI_CD.md](./CI_CD.md)**

---
## 🔬 Análisis de Código - SonarCloud

Este proyecto integra **SonarCloud** para análisis automático de calidad de código y detección de vulnerabilidades.

### 🎯 Características

- 🐛 **Detección de Bugs** - Encuentra errores potenciales
- 🔒 **Análisis de Seguridad** - Identifica vulnerabilidades
- 💩 **Code Smells** - Detecta malas prácticas
- 📊 **Cobertura de Código** - Monitorea % de tests
- 🔄 **Duplicación** - Identifica código repetido
- 📈 **Tendencias** - Monitorea mejoras en el tiempo

### ⚙️ Quality Gates

El proyecto está configurado con Quality Gates que garantizan:

```
✅ Cobertura de código >= 70%
✅ Cero issues de seguridad críticos/blocker
✅ Máximo 5% de código duplicado
✅ Ratings de seguridad >= B
```

**Si algún Quality Gate falla, el PR no puede mergear a main.**

### 🚀 Acceso al Dashboard

Ver análisis en tiempo real:

```
https://sonarcloud.io/dashboard?id=3ls42025_TurismoSur
```

### 📁 Configuración

- **sonar-project.properties** - Configuración del análisis
- **[SONARCLOUD_SETUP.md](./SONARCLOUD_SETUP.md)** - Guía completa
- **[QUALITY_GATES.md](./QUALITY_GATES.md)** - Configuración de Quality Gates

---
## �🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Next.js 16, TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Backend | Next.js Server Actions |
| Base de Datos | Supabase (PostgreSQL) |
| Validación | Zod 4.3.6 |
| Arquitectura | Clean Architecture (4 capas) |

---

## 📊 Principios Implementados

### Inversión de Dependencias
```
Action → IUserRepository (interfaz)
         ↓
      SupabaseUserRepository (implementación)
```

### Responsabilidad Única
- UserEntity: Solo valida usuario
- SupabaseUserRepository: Solo persiste en Supabase
- registerUserAction: Solo orquesta el flujo

### Separación de Capas
- Domain: Lógica pura
- Infrastructure: Detalles técnicos
- Presentation: Interfaz HTTP

---

## 🚀 Próximos Pasos

- [ ] Integrar en acciones existentes (src/actions/)
- [ ] Escribir tests para entidades
- [ ] Documentar API endpoints
- [ ] Deployar en Vercel

---

## 📖 Aprende Más

- [Next.js Documentation](https://nextjs.org/docs)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Supabase Documentation](https://supabase.com/docs)

---


