import Link from 'next/link';
import { adminKycService } from '@/services/adminKycService';
import { approvePendingUserAction, rejectPendingUserAction } from '@/actions/adminKycActions';

export const metadata = {
  title: 'Aprobación KYC | TurismoSur',
  description: 'Panel de administración para aprobar o rechazar solicitudes de registro.',
};

interface AdminKycPageProps {
  searchParams: Promise<{
    result?: string;
    error?: string;
  }>;
}

export default async function AdminKycPage({ searchParams }: AdminKycPageProps) {
  const params = await searchParams;
  let pendingUsers: Awaited<ReturnType<typeof adminKycService.getPendingUsers>> = [];
  let configError: string | null = null;

  try {
    pendingUsers = await adminKycService.getPendingUsers();
  } catch (error) {
    configError = error instanceof Error ? error.message : 'No se pudo cargar el panel administrativo';
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Panel administrativo
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Revisión de cuentas pendientes
              </h1>
              <p className="text-slate-300">
                Aprueba o rechaza solicitudes directamente desde Supabase sin procesos manuales.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Volver al inicio
            </Link>
          </div>

          {params.result && (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-200">
              Operación completada correctamente: {params.result}
            </div>
          )}

          {params.error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">
              {params.error}
            </div>
          )}

          {configError && (
            <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-200">
              {configError}. Para usar esta pantalla necesitas definir `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Solicitudes pendientes</h2>
            <p className="text-slate-400">{pendingUsers.length} usuario(s) esperando revisión</p>
          </div>
        </div>

        {!configError && pendingUsers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            No hay solicitudes pendientes en este momento.
          </div>
        ) : !configError ? (
          <div className="grid gap-6">
            {pendingUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur"
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                        Pendiente
                      </span>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                      <p><span className="font-semibold text-slate-100">Email:</span> {user.email}</p>
                      <p><span className="font-semibold text-slate-100">Teléfono:</span> {user.phone}</p>
                      <p><span className="font-semibold text-slate-100">Documento:</span> {user.national_id ?? 'No disponible'}</p>
                      <p><span className="font-semibold text-slate-100">Nacionalidad:</span> {user.nationality ?? 'No disponible'}</p>
                      <p><span className="font-semibold text-slate-100">Fecha de nacimiento:</span> {user.date_of_birth}</p>
                      <p><span className="font-semibold text-slate-100">Registrado:</span> {new Date(user.created_at).toLocaleString('es-CL')}</p>
                    </div>

                    {user.id_photo_url && (
                      <a
                        href={user.id_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm font-semibold text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-200"
                      >
                        Ver documento adjunto
                      </a>
                    )}
                  </div>

                  <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900/70 p-4">
                    <form action={approvePendingUserAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400"
                      >
                        Aprobar cuenta
                      </button>
                    </form>

                    <form action={rejectPendingUserAction} className="space-y-3">
                      <input type="hidden" name="userId" value={user.id} />
                      <label className="block text-sm font-medium text-slate-300">
                        Motivo del rechazo
                        <textarea
                          name="reason"
                          required
                          minLength={3}
                          rows={4}
                          placeholder="Describe brevemente por qué no se aprueba la solicitud"
                          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-red-400"
                        />
                      </label>

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-400"
                      >
                        Rechazar cuenta
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
