import { Vehicle } from '@/types/vehicle';

const VEHICLE_IMAGE_MAP: Record<string, string> = {
  'toyota rav4': '/vehicles/Toyota_Rav4.png',
  'rav4': '/vehicles/Toyota_Rav4.png',
  'suzuki jimny': '/vehicles/Susuki%20Jimny.png',
  'jimny': '/vehicles/Susuki%20Jimny.png',
  'hyundai accent': '/vehicles/Hyundai%20Accent.png',
  'accent': '/vehicles/Hyundai%20Accent.png',
};

export function getVehicleImageSrc(vehicle: Pick<Vehicle, 'make' | 'model'>): string {
  const normalized = `${vehicle.make} ${vehicle.model}`.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  return VEHICLE_IMAGE_MAP[normalized] ?? VEHICLE_IMAGE_MAP[vehicle.model.toLowerCase()] ?? '/vehicles/default.svg';
}