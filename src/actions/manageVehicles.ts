'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { vehicleService } from '@/services/vehicleService'; // ¡Aquí está la magia!

export async function addVehicleAction(formData: FormData) {
  try {
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const plate = formData.get('plate') as string;
    const imageFile = formData.get('image') as File;

    await vehicleService.addVehicle(make, model, plate, imageFile);
  } catch (error) {
    return { error: 'No se pudo agregar el vehículo.' };
  }

  revalidatePath('/admin/vehiculos');
  redirect('/admin/vehiculos?success=added');
}

export async function deleteVehicleAction(vehicleId: string) {
  try {
    await vehicleService.removeVehicle(vehicleId);
  } catch (error) {
    return { error: 'No se pudo eliminar el vehículo.' };
  }

  revalidatePath('/admin/vehiculos');
}
export async function updateVehicleAction(vehicleId: string, formData: FormData) {
  try {
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const plate = formData.get('plate') as string;
    const imageFile = formData.get('image') as File;

    await vehicleService.modifyVehicle(vehicleId, make, model, plate, imageFile);
  } catch (error) {
    return { error: 'No se pudo actualizar el vehículo.' };
  }

  revalidatePath('/admin/vehicles');
  redirect('/admin/vehicles?success=updated');
}