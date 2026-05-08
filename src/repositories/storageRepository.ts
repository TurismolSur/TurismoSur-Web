/**
 * StorageRepository
 * Capa: Acceso a Datos (Supabase Storage)
 * 
 * Responsabilidad ÚNICA: Manejar archivos en Supabase Storage
 * NO contiene lógica de negocio
 */

import { supabase } from '@/lib/supabase';

export class StorageRepository {
  private readonly IDENTITY_BUCKET = 'identity_documents';

  /**
   * Sube una foto de cédula a Supabase Storage
   * @param file Archivo de imagen
   * @param userId ID del usuario (para nombrar el archivo)
   * @returns URL pública del archivo subido
   */
  async uploadIdentityDocument(file: File, userId: string): Promise<string> {
    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño máximo (5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        throw new Error('La imagen no debe superar 5MB');
      }

      // Generar nombre único del archivo
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-identity-${timestamp}.${fileExt}`;
      const filePath = `identity/${fileName}`;

      // Subir archivo
      const { data, error: uploadError } = await supabase.storage
        .from(this.IDENTITY_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading identity document:', uploadError);
        throw new Error(`Error al subir documento: ${uploadError.message}`);
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(this.IDENTITY_BUCKET)
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('No se pudo obtener URL pública del documento');
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('StorageRepository: Error uploading identity document', error);
      throw error;
    }
  }

  /**
   * Elimina una foto de cédula de Supabase Storage
   * @param photoUrl URL pública de la foto
   */
  async deleteIdentityDocument(photoUrl: string): Promise<void> {
    try {
      // Extraer la ruta del archivo de la URL pública
      const urlParts = photoUrl.split('/identity/');
      if (urlParts.length !== 2) {
        console.warn('Could not parse photo URL:', photoUrl);
        return;
      }

      const fileName = urlParts[1];
      const filePath = `identity/${fileName}`;

      const { error } = await supabase.storage
        .from(this.IDENTITY_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting identity document:', error);
        // No lanzar error aquí, solo loguear (el usuario ya está creado)
      }
    } catch (error) {
      console.error('StorageRepository: Error deleting identity document', error);
      // No relanzar el error
    }
  }
}

// Singleton instance
export const storageRepository = new StorageRepository();
