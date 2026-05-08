-- TurismoSur - Sistema Web de Arriendo de Vehículos (SWAV)
-- Schema PostgreSQL para Supabase
-- Fecha: 2026-04-20

-- ============================================================================
-- ENUMS (Tipos Enumerados)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'support');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance', 'damaged', 'inactive');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'transfer', 'cash');
CREATE TYPE damage_severity AS ENUM ('minor', 'moderate', 'major');

-- ============================================================================
-- TABLA: users (Clientes y Administradores)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(100),
  national_id VARCHAR(50) UNIQUE,
  role user_role NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT false, -- Cambio: Inicia desactivado (pendiente KYC)
  kyc_status kyc_status NOT NULL DEFAULT 'pending', -- KYC status: pending, approved, rejected
  id_photo_url TEXT, -- URL de foto de cédula guardada en Supabase Storage
  kyc_approved_at TIMESTAMP WITH TIME ZONE, -- Fecha cuando se aprobó el KYC
  kyc_rejected_reason TEXT, -- Razón del rechazo (si aplica)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Validación: BR-01 (Mayoría de edad +18)
  CONSTRAINT check_age CHECK (EXTRACT(YEAR FROM AGE(date_of_birth)) >= 18)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_national_id ON users(national_id);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- TABLA: licenses (Licencias de Conducir)
-- ============================================================================

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  license_type VARCHAR(10) NOT NULL, -- A, B, C, D, etc.
  issue_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- BR-04: Validación de licencia válida
  CONSTRAINT check_license_validity CHECK (expiration_date > issue_date)
);

CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_expiration ON licenses(expiration_date);

-- ============================================================================
-- TABLA: vehicles (Vehículos)
-- ============================================================================

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate VARCHAR(20) NOT NULL UNIQUE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50),
  type VARCHAR(50) NOT NULL, -- sedan, suv, truck, van, etc.
  seats INTEGER NOT NULL,
  transmission VARCHAR(20), -- manual, automatic
  fuel_type VARCHAR(20), -- gasoline, diesel, electric, hybrid
  daily_price DECIMAL(10, 2) NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  status vehicle_status NOT NULL DEFAULT 'available',
  purchase_date DATE,
  insurance_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_daily_price CHECK (daily_price > 0),
  CONSTRAINT check_seats CHECK (seats > 0)
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_type ON vehicles(type);

-- ============================================================================
-- TABLA: reservations (Reservas)
-- ============================================================================

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(10, 2),
  status reservation_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- BR-05: Reservas con mínimo 48h de anticipación
  CONSTRAINT check_advance_booking CHECK (start_date >= CURRENT_TIMESTAMP + INTERVAL '48 hours'),
  -- Validación básica de fechas
  CONSTRAINT check_dates CHECK (end_date > start_date),
  CONSTRAINT check_estimated_cost CHECK (estimated_cost > 0)
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_vehicle_id ON reservations(vehicle_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_date ON reservations(start_date);
CREATE INDEX idx_reservations_end_date ON reservations(end_date);

-- ============================================================================
-- TABLA: payments (Pagos)
-- ============================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ============================================================================
-- TABLA: surcharges (Recargos y Multas)
-- ============================================================================

CREATE TABLE surcharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  surcharge_type VARCHAR(50) NOT NULL, -- 'late_return', 'cancellation', 'damage', 'fuel'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- BR-08: Recargo por atraso (1 día extra + 10% recargo)
  -- BR-10: Cancelación <48h cobra 50%
  CONSTRAINT check_surcharge_amount CHECK (amount > 0)
);

CREATE INDEX idx_surcharges_reservation_id ON surcharges(reservation_id);
CREATE INDEX idx_surcharges_user_id ON surcharges(user_id);
CREATE INDEX idx_surcharges_type ON surcharges(surcharge_type);

-- ============================================================================
-- TABLA: discounts (Descuentos)
-- ============================================================================

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  discount_type VARCHAR(50) NOT NULL, -- 'frequent_customer', 'promotional', 'seasonal'
  percentage DECIMAL(5, 2) NOT NULL,
  amount DECIMAL(10, 2),
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- BR-09: 10% descuento a clientes frecuentes (>5 arriendos)
  CONSTRAINT check_percentage CHECK (percentage > 0 AND percentage <= 100)
);

CREATE INDEX idx_discounts_reservation_id ON discounts(reservation_id);
CREATE INDEX idx_discounts_user_id ON discounts(user_id);
CREATE INDEX idx_discounts_type ON discounts(discount_type);

-- ============================================================================
-- TABLA: damage_reports (Reportes de Daños)
-- ============================================================================

CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  severity damage_severity NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  estimated_repair_cost DECIMAL(10, 2),
  photos_urls TEXT[], -- Array de URLs de fotos
  status VARCHAR(50) NOT NULL DEFAULT 'reported', -- reported, verified, repaired, closed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- BR-11: Bloqueo automático por daños
  CONSTRAINT check_repair_cost CHECK (estimated_repair_cost IS NULL OR estimated_repair_cost > 0)
);

CREATE INDEX idx_damage_reports_reservation_id ON damage_reports(reservation_id);
CREATE INDEX idx_damage_reports_vehicle_id ON damage_reports(vehicle_id);
CREATE INDEX idx_damage_reports_status ON damage_reports(status);

-- ============================================================================
-- TABLA: customer_debt (Deudas de Clientes)
-- ============================================================================

CREATE TABLE customer_debt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  amount_owed DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(100) NOT NULL, -- 'unpaid_rental', 'damage', 'surcharge', 'late_fee'
  due_date DATE,
  paid_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, overdue
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- BR-03: Prohibido reservar con deudas
  CONSTRAINT check_debt_amount CHECK (amount_owed > 0)
);

CREATE INDEX idx_customer_debt_user_id ON customer_debt(user_id);
CREATE INDEX idx_customer_debt_status ON customer_debt(status);
CREATE INDEX idx_customer_debt_due_date ON customer_debt(due_date);

-- ============================================================================
-- TABLA: audit_log (Log de Auditoría)
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL, -- users, vehicles, reservations, payments, etc.
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- create, update, delete
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista: Clientes con deudas activas
CREATE VIEW customers_with_debt AS
SELECT DISTINCT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  SUM(cd.amount_owed) as total_debt,
  COUNT(DISTINCT cd.id) as debt_count
FROM users u
JOIN customer_debt cd ON u.id = cd.user_id
WHERE cd.status IN ('pending', 'overdue')
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- Vista: Clientes frecuentes (>5 arriendos completados)
CREATE VIEW frequent_customers AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  COUNT(DISTINCT r.id) as completed_rentals
FROM users u
JOIN reservations r ON u.id = r.user_id
WHERE r.status = 'completed'
GROUP BY u.id, u.email, u.first_name, u.last_name
HAVING COUNT(DISTINCT r.id) > 5;

-- Vista: Reservas activas por usuario (BR-02: Máximo 2 arriendos activos)
CREATE VIEW active_reservations_per_user AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  COUNT(DISTINCT r.id) as active_reservations
FROM users u
LEFT JOIN reservations r ON u.id = r.user_id
WHERE r.status IN ('confirmed', 'active')
  AND r.end_date > CURRENT_TIMESTAMP
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- Vista: Disponibilidad de vehículos
CREATE VIEW vehicle_availability AS
SELECT
  v.id,
  v.plate,
  v.make,
  v.model,
  v.daily_price,
  v.status,
  COUNT(CASE WHEN r.status IN ('confirmed', 'active') THEN 1 END) as active_reservations,
  MAX(CASE WHEN r.status IN ('confirmed', 'active') THEN r.end_date END) as next_available
FROM vehicles v
LEFT JOIN reservations r ON v.id = r.vehicle_id
GROUP BY v.id, v.plate, v.make, v.model, v.daily_price, v.status;

-- ============================================================================
-- FUNCIONES RLS (Row Level Security) - Placeholder para implementación posterior
-- ============================================================================

-- Nota: Las políticas RLS deben configurarse en la UI de Supabase
-- o ejecutarse de forma separada para aplicar seguridad a nivel de fila

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
