import { CookieManager } from '@/core/auth/CookieManager';
import { JWTService } from '@/core/auth/JWTService';
import { UnauthorizedException, ValidationException } from '@/core/exceptions/DomainException';
import { adminUserRepository, type AdminUserRecord } from '@/infrastructure/impl/SupabaseAdminUserRepository';

class AdminKycService {
  private async requireAdmin(): Promise<void> {
    const token = await CookieManager.getAccessToken();

    if (!token) {
      throw new UnauthorizedException('No tienes una sesión activa');
    }

    const payload = await JWTService.verifyAccessToken(token);

    if (payload.role !== 'admin') {
      throw new UnauthorizedException('No tienes permisos de administrador');
    }
  }

  async getPendingUsers(): Promise<AdminUserRecord[]> {
    await this.requireAdmin();
    return adminUserRepository.findByKYCStatus('pending');
  }

  async approveUser(userId: string): Promise<AdminUserRecord> {
    await this.requireAdmin();

    if (!userId) {
      throw new ValidationException('userId es requerido');
    }

    return adminUserRepository.approveUser(userId);
  }

  async rejectUser(userId: string, reason: string): Promise<AdminUserRecord> {
    await this.requireAdmin();

    if (!userId) {
      throw new ValidationException('userId es requerido');
    }

    if (!reason || reason.trim().length < 3) {
      throw new ValidationException('Debes indicar un motivo de rechazo válido');
    }

    return adminUserRepository.rejectUser(userId, reason.trim());
  }
}

export const adminKycService = new AdminKycService();