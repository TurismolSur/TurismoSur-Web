/**
 * 🧪 Ejemplo de Tests Unitarios - UserEntity
 * 
 * Este archivo muestra cómo escribir tests usando Jest
 * para las entidades del dominio
 */

import { UserEntity } from '@/domain/entities/UserEntity';
import { ValidationException } from '@/core/exceptions/DomainException';

describe('UserEntity - Unit Tests', () => {
  /**
   * Suite 1: Creación de usuario
   */
  describe('create()', () => {
    it('should create a valid user with correct data', () => {
      // 📋 Arrange - Preparar datos
      const userData = {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer' as const,
        kycStatus: 'pending' as const,
        isActive: false,
      };

      // ⚙️ Act - Ejecutar acción
      const user = UserEntity.create(userData);

      // ✅ Assert - Verificar resultado
      expect(user).toBeDefined();
      expect(user.getEmail()).toBe('john@example.com');
      expect(user.getFirstName()).toBe('John');
    });

    it('should reject user younger than 18 years old', () => {
      // 📋 Arrange
      const userData = {
        id: '1',
        email: 'teenager@example.com',
        firstName: 'Teen',
        lastName: 'Ager',
        dateOfBirth: new Date('2010-01-15'), // Apenas 14 años
        role: 'customer' as const,
        kycStatus: 'pending' as const,
        isActive: false,
      };

      // ✅ Assert - Esperar que lance excepción
      expect(() => UserEntity.create(userData)).toThrow(ValidationException);
    });

    it('should reject invalid email format', () => {
      // 📋 Arrange
      const userData = {
        id: '1',
        email: 'invalid-email', // Email inválido
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer' as const,
        kycStatus: 'pending' as const,
        isActive: false,
      };

      // ✅ Assert
      expect(() => UserEntity.create(userData)).toThrow(ValidationException);
    });
  });

  /**
   * Suite 2: Acceso y permisos
   */
  describe('canAccess()', () => {
    it('should allow access if KYC approved and active', () => {
      // 📋 Arrange
      const user = UserEntity.create({
        id: '1',
        email: 'approved@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer',
        kycStatus: 'approved',
        isActive: true,
      });

      // ✅ Assert
      expect(user.canAccess()).toBe(true);
    });

    it('should deny access if KYC not approved', () => {
      // 📋 Arrange
      const user = UserEntity.create({
        id: '1',
        email: 'pending@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer',
        kycStatus: 'pending',
        isActive: true,
      });

      // ✅ Assert
      expect(user.canAccess()).toBe(false);
    });

    it('should deny access if user not active', () => {
      // 📋 Arrange
      const user = UserEntity.create({
        id: '1',
        email: 'inactive@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer',
        kycStatus: 'approved',
        isActive: false,
      });

      // ✅ Assert
      expect(user.canAccess()).toBe(false);
    });
  });

  /**
   * Suite 3: KYC Flow
   */
  describe('KYC Management', () => {
    it('should approve KYC and activate user', () => {
      // 📋 Arrange
      const user = UserEntity.create({
        id: '1',
        email: 'kyc@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer',
        kycStatus: 'pending',
        isActive: false,
      });

      // ⚙️ Act
      user.approveKYC();

      // ✅ Assert
      expect(user.getKycStatus()).toBe('approved');
      expect(user.isActive()).toBe(true);
      expect(user.canAccess()).toBe(true);
    });

    it('should reject KYC and deactivate user', () => {
      // 📋 Arrange
      const user = UserEntity.create({
        id: '1',
        email: 'reject@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer',
        kycStatus: 'pending',
        isActive: true,
      });

      // ⚙️ Act
      user.rejectKYC();

      // ✅ Assert
      expect(user.getKycStatus()).toBe('rejected');
      expect(user.isActive()).toBe(false);
      expect(user.canAccess()).toBe(false);
    });
  });

  /**
   * Suite 4: Age calculation
   */
  describe('getAge()', () => {
    it('should calculate age correctly', () => {
      // 📋 Arrange
      const birthDate = new Date('2000-01-15');
      const user = UserEntity.create({
        id: '1',
        email: 'age@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: birthDate,
        role: 'customer',
        kycStatus: 'pending',
        isActive: false,
      });

      // ⚙️ Act
      const age = user.getAge();

      // ✅ Assert
      expect(age).toBeGreaterThanOrEqual(23);
      expect(age).toBeLessThanOrEqual(24);
    });

    it('should require minimum age of 18', () => {
      // 📋 Arrange - Usuario con 17 años
      const userData = {
        id: '1',
        email: 'tooyoung@example.com',
        firstName: 'Young',
        lastName: 'Person',
        dateOfBirth: new Date(new Date().getFullYear() - 17, 0, 1),
        role: 'customer' as const,
        kycStatus: 'pending' as const,
        isActive: false,
      };

      // ✅ Assert
      expect(() => UserEntity.create(userData)).toThrow();
    });
  });

  /**
   * Suite 5: Hidratación (crear desde BD)
   */
  describe('hydrate()', () => {
    it('should hydrate user from database data', () => {
      // 📋 Arrange - Datos que vienen de la BD
      const dbData = {
        id: '1',
        email: 'db@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-15'),
        role: 'customer' as const,
        kycStatus: 'approved' as const,
        isActive: true,
      };

      // ⚙️ Act
      const user = UserEntity.hydrate(dbData);

      // ✅ Assert
      expect(user).toBeDefined();
      expect(user.getEmail()).toBe('db@example.com');
      expect(user.canAccess()).toBe(true);
    });
  });
});

/**
 * 📚 Patrones de Testing
 * 
 * AAA Pattern:
 * 1️⃣ Arrange - Preparar datos
 * 2️⃣ Act - Ejecutar acción
 * 3️⃣ Assert - Verificar resultado
 * 
 * Naming:
 * ✅ describe('Feature', () => {}) - Agrupa relacionados
 * ✅ it('should...', () => {}) - Describe el comportamiento
 * ✅ expect(value).toMatchCondition() - Verifica resultado
 */
