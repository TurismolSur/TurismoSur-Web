import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { vehicleService } from '@/services/vehicleService';
import { reservationRepository } from '@/repositories/reservationRepository';
import { VehicleBookingPanel } from '@/components/vehicle/VehicleBookingPanel';
import { getVehicleImageSrc } from '@/lib/vehicleImages';
import { cancelReservationAction } from '@/actions/cancelReservation';
import { CookieManager } from '@/core/auth/CookieManager';

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    reservation?: string;
    method?: string;
    error?: string;
    result?: string;
  }>;
}

export default async function VehicleDetailPage({ params, searchParams }: VehicleDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const vehicle = await vehicleService.getVehicleDetails(id);

  if (!vehicle) {
    notFound();
  }

  const bookingWindow = await reservationRepository.getVehicleBookingWindow(id);
  const reservations = await reservationRepository.getVehicleReservations(id);
  const userId = await CookieManager.getUserId();
  const userReservations = userId ? await reservationRepository.getReservationsByUserId(userId) : [];
  const imageSrc = getVehicleImageSrc(vehicle);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/vehicles" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            ← Volver a vehículos
          </Link>

          {query.error && (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">
              {query.error}
            </div>
          )}

          {query.reservation && (
            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <span>Reserva creada correctamente. Código: {query.reservation}</span>
                <form action={cancelReservationAction}>
                  <input type="hidden" name="reservationId" value={query.reservation} />
                  <input type="hidden" name="vehicleId" value={vehicle.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
                  >
                    Cancelar reserva
                  </button>
                </form>
              </div>
            </div>
          )}

          {query.result === 'cancelled' && (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-200">
              La reserva fue cancelada correctamente.
            </div>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Detalle del vehículo</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                  {vehicle.make} {vehicle.model}
                </h1>
                <p className="mt-3 text-slate-300">Placa {vehicle.plate} · {vehicle.year} · {vehicle.type}</p>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/20">
                <Image
                  src={imageSrc}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  width={1200}
                  height={720}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Asientos', vehicle.seats],
                  ['Transmisión', vehicle.transmission],
                  ['Combustible', vehicle.fuel_type],
                  ['Kilometraje', vehicle.mileage.toLocaleString('es-CL')],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{String(value)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">Disponibilidad</h2>
                <p className="mt-2 text-slate-300">
                  {bookingWindow.hasCurrentConflict
                    ? `Este vehículo tiene una reserva activa. Puedes elegir otra fecha posterior disponible respetando el mínimo de 48 horas.`
                    : bookingWindow.nextReservationStart
                      ? `La próxima reserva registrada comienza el ${new Date(bookingWindow.nextReservationStart).toLocaleDateString('es-CL')}. Las fechas libres anteriores y posteriores se pueden usar si no se cruzan con otra reserva.`
                      : 'No hay reservas registradas. Solo aplica el mínimo de 48 horas para comenzar.'}
                </p>
              </div>
            </div>

            <VehicleBookingPanel vehicle={vehicle} bookingWindow={bookingWindow} reservations={reservations} />
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Mis reservas</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Reservas asociadas a tu cuenta</h2>
              </div>
              <p className="text-sm text-slate-400">Puedes cancelar desde aquí las reservas que sigan activas.</p>
            </div>

            {userReservations.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-400">
                No tienes reservas activas o pendientes en este momento.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {userReservations.map((reservation) => {
                  const isCancellable = reservation.status === 'pending' || reservation.status === 'confirmed' || reservation.status === 'active';

                  return (
                    <div key={reservation.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-white">Reserva {reservation.id.slice(0, 8)}</p>
                            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                              {reservation.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">
                            {new Date(reservation.start_date).toLocaleDateString('es-CL')} - {new Date(reservation.end_date).toLocaleDateString('es-CL')}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            Monto estimado: ${Number(reservation.estimated_cost).toLocaleString('es-CL')}
                          </p>
                        </div>

                        {isCancellable ? (
                          <form action={cancelReservationAction} className="shrink-0">
                            <input type="hidden" name="reservationId" value={reservation.id} />
                            <input type="hidden" name="vehicleId" value={reservation.vehicle_id} />
                            <button
                              type="submit"
                              className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
                            >
                              Cancelar reserva
                            </button>
                          </form>
                        ) : (
                          <p className="text-sm text-slate-500">Esta reserva ya no puede cancelarse.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}