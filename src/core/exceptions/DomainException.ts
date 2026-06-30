/**
 * ARQUITECTURA LIMPIA - EXCEPCIONES DEL CORE
 * Capa: Shared/Core
 * 
 * Excepciones personalizadas que pueden ser lanzadas desde cualquier capa
 * No dependen de frameworks externos
 */

export class DomainException extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

export class ValidationException extends DomainException {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, 422);
    this.name = 'ValidationException';
  }
}

export class ConflictException extends DomainException {
  constructor(message: string, code = 'CONFLICT') {
    super(message, code, 409);
    this.name = 'ConflictException';
  }
}

export class NotFoundException extends DomainException {
  constructor(resource: string, identifier?: string) {
    const msg = identifier 
      ? `${resource} con ID '${identifier}' no encontrado`
      : `${resource} no encontrado`;
    super(msg, 'NOT_FOUND', 404);
    this.name = 'NotFoundException';
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'No autorizado') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedException';
  }
}
