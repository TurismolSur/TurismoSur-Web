'use client';

import { useEffect, useMemo, useState } from 'react';
import { createReservationAction } from '@/actions/createReservation';
import { Vehicle } from '@/types/vehicle';
import { ReservationRecord, VehicleBookingWindow } from '@/types/reservation';

interface VehicleBookingPanelProps {
  vehicle: Vehicle;
  bookingWindow: VehicleBookingWindow;
  reservations: ReservationRecord[];
}

const paymentOptions = [
  { value: 'credit_card', label: 'Tarjeta crédito - Webpay prueba' },
  { value: 'debit_card', label: 'Tarjeta débito - Webpay prueba' },
  { value: 'cash', label: 'Efectivo en sucursal' },
] as const;

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDateInput(value: string | null): string {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toCalendarKey(date: Date): string {
  return toDateInputValue(date);
}

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 12, 0, 0, 0);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function isSameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function isBeforeDay(left: Date, right: Date): boolean {
  return normalizeDate(left).getTime() < normalizeDate(right).getTime();
}

function isAfterDay(left: Date, right: Date): boolean {
  return normalizeDate(left).getTime() > normalizeDate(right).getTime();
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}

function expandReservedDays(reservations: ReservationRecord[]): Set<string> {
  const reservedDays = new Set<string>();

  for (const reservation of reservations) {
    const start = normalizeDate(parseDateInput(reservation.start_date.slice(0, 10)));
    const end = normalizeDate(parseDateInput(reservation.end_date.slice(0, 10)));

    for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
      reservedDays.add(toCalendarKey(cursor));
    }
  }

  return reservedDays;
}

function rangeIncludesBlockedDay(start: Date, end: Date, reservedDays: Set<string>): boolean {
  for (let cursor = normalizeDate(start); cursor.getTime() <= normalizeDate(end).getTime(); cursor = addDays(cursor, 1)) {
    if (reservedDays.has(toCalendarKey(cursor))) {
      return true;
    }
  }

  return false;
}

function buildMonthDays(viewMonth: Date): Array<Date | null> {
  const firstDay = startOfMonth(viewMonth);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const cells: Array<Date | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, 12, 0, 0, 0));
  }

  return cells;
}

function getMinimumBookingDate(): string {
  const minimumDate = new Date();
  minimumDate.setHours(minimumDate.getHours() + 48);

  const year = minimumDate.getFullYear();
  const month = String(minimumDate.getMonth() + 1).padStart(2, '0');
  const day = String(minimumDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDailyRate(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const normalized = value.includes(',')
    ? value.replace(/\./g, '').replace(',', '.')
    : value.replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function VehicleBookingPanel({ vehicle, bookingWindow, reservations }: VehicleBookingPanelProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'cash'>('credit_card');
  const [notes, setNotes] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const minDate = formatDateInput(bookingWindow.availableFrom);
    return startOfMonth(minDate ? parseDateInput(minDate) : new Date());
  });
  const dailyRate = parseDailyRate(vehicle.daily_price);

  const minStartDate = useMemo(() => formatDateInput(bookingWindow.availableFrom), [bookingWindow.availableFrom]);
  const bookingMinimumDate = useMemo(() => getMinimumBookingDate(), []);
  const effectiveMinStartDate = minStartDate > bookingMinimumDate ? minStartDate : bookingMinimumDate;
  const minimumSelectableDate = useMemo(() => parseDateInput(effectiveMinStartDate), [effectiveMinStartDate]);
  const reservedDaySet = useMemo(() => expandReservedDays(reservations), [reservations]);

  useEffect(() => {
    setViewMonth(startOfMonth(minimumSelectableDate));
  }, [minimumSelectableDate]);

  const selectedStartDate = useMemo(() => (startDate ? parseDateInput(startDate) : null), [startDate]);
  const selectedEndDate = useMemo(() => (endDate ? parseDateInput(endDate) : null), [endDate]);

  const monthCells = useMemo(() => buildMonthDays(viewMonth), [viewMonth]);

  const isDayBlocked = (day: Date): boolean => {
    if (isBeforeDay(day, minimumSelectableDate)) {
      return true;
    }

    if (reservedDaySet.has(toCalendarKey(day))) {
      return true;
    }

    return false;
  };

  const handleDaySelection = (day: Date) => {
    if (isDayBlocked(day)) {
      setSelectionError('Ese día no está disponible para reserva.');
      return;
    }

    setSelectionError('');

    const selectedValue = toDateInputValue(day);
    const isStartSelected = Boolean(startDate && isSameDay(day, parseDateInput(startDate)));
    const isEndSelected = Boolean(endDate && isSameDay(day, parseDateInput(endDate)));

    if (isStartSelected && isEndSelected) {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (isStartSelected && !endDate) {
      setStartDate('');
      return;
    }

    if (isEndSelected && startDate) {
      setEndDate('');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedValue);
      setEndDate('');
      return;
    }

    const currentStart = parseDateInput(startDate);

    if (isBeforeDay(day, currentStart)) {
      setStartDate(selectedValue);
      setEndDate('');
      return;
    }

    if (isSameDay(day, currentStart)) {
      setStartDate('');
      return;
    }

    if (rangeIncludesBlockedDay(currentStart, day, reservedDaySet)) {
      setSelectionError('El rango seleccionado cruza días ocupados. Elige otro tramo disponible.');
      return;
    }

    setEndDate(selectedValue);
  };

  const goToPreviousMonth = () => {
    const previousMonth = addMonths(viewMonth, -1);
    if (!isBeforeDay(startOfMonth(previousMonth), startOfMonth(minimumSelectableDate))) {
      setViewMonth(previousMonth);
    }
  };

  const goToNextMonth = () => {
    setViewMonth(addMonths(viewMonth, 1));
  };

  const canGoPrevious = !isBeforeDay(addMonths(viewMonth, -1), startOfMonth(minimumSelectableDate));
  const canGoNext = true;

  const selectedRangeReady = Boolean(startDate && endDate);

  const estimatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const estimatedCost = useMemo(() => {
    if (estimatedDays <= 0) {
      return 0;
    }

    return Math.max(0, Math.round(dailyRate * estimatedDays));
  }, [dailyRate, estimatedDays]);

  const priceFormula = estimatedDays > 0 ? `${dailyRate.toLocaleString('es-CL')} x ${estimatedDays}` : '';

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Reserva</p>
        <h2 className="text-2xl font-bold text-white">Selecciona fechas y forma de pago</h2>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 md:grid-cols-2">
        <div>
          <p className="text-slate-500">Disponible desde</p>
          <p className="font-semibold text-slate-100">{bookingWindow.availableFrom ? new Date(bookingWindow.availableFrom).toLocaleDateString('es-CL') : 'Hoy'}</p>
        </div>
        <div>
          <p className="text-slate-500">Próxima reserva registrada</p>
          <p className="font-semibold text-slate-100">{bookingWindow.nextReservationStart ? new Date(bookingWindow.nextReservationStart).toLocaleDateString('es-CL') : 'Sin reservas registradas'}</p>
        </div>
      </div>

      {bookingWindow.hasCurrentConflict && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          Este vehículo está reservado actualmente. Podrás elegir fechas a partir de su próxima disponibilidad.
        </div>
      )}

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
        La reserva debe comenzar al menos 48 horas después de hoy, pero puede elegirse cualquier otra fecha disponible posterior.
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Calendario de disponibilidad</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{getMonthLabel(viewMonth)}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">Disponible</span>
          <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-rose-200">Ocupado</span>
          <span className="rounded-full border border-slate-500/30 bg-slate-700/30 px-3 py-1 text-slate-200">No disponible</span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400 text-slate-950 px-3 py-1 font-semibold">Seleccionado</span>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">Fecha actual</span>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
          {WEEKDAY_LABELS.map((weekday) => (
            <div key={weekday} className="py-1">{weekday}</div>
          ))}

          {monthCells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-12 rounded-xl bg-transparent" />;
            }

            const blocked = isDayBlocked(day);
            const isSelectedStart = Boolean(selectedStartDate && isSameDay(day, selectedStartDate));
            const isSelectedEnd = Boolean(selectedEndDate && isSameDay(day, selectedEndDate));
            const isInRange = Boolean(
              selectedStartDate && selectedEndDate
              && day > selectedStartDate
              && day < selectedEndDate
            );
            const isReserved = reservedDaySet.has(toCalendarKey(day)) && !blocked;
            const isToday = isSameDay(day, normalizeDate(new Date()));

            const dayClasses = blocked
              ? 'border-slate-800 bg-slate-900/60 text-slate-500 line-through'
              : isSelectedStart || isSelectedEnd
                ? 'border-cyan-300 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20'
                : isInRange
                  ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                  : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20';

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDaySelection(day)}
                disabled={blocked}
                className={`relative h-12 rounded-xl border text-sm font-semibold transition ${dayClasses} ${isToday ? 'ring-2 ring-amber-400/70 ring-offset-2 ring-offset-slate-950' : ''}`}
                title={blocked ? 'No disponible' : 'Seleccionar fecha'}
              >
                <span>{day.getDate()}</span>
                {isSelectedStart && (
                  <span className="absolute left-1 top-1 rounded-full bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-300">Inicio</span>
                )}
                {isSelectedEnd && (
                  <span className="absolute right-1 top-1 rounded-full bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-300">Fin</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-slate-500">Inicio elegido</p>
            <p className="mt-1 font-semibold text-white">{startDate ? new Date(startDate).toLocaleDateString('es-CL') : 'Sin seleccionar'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-slate-500">Término elegido</p>
            <p className="mt-1 font-semibold text-white">{endDate ? new Date(endDate).toLocaleDateString('es-CL') : 'Sin seleccionar'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-slate-500">Estado</p>
            <p className="mt-1 font-semibold text-white">{selectedRangeReady ? 'Listo para reservar' : 'Selecciona un rango válido'}</p>
          </div>
        </div>

        {selectionError && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">
            {selectionError}
          </div>
        )}
      </div>

      <form action={createReservationAction} className="space-y-6">
        <input type="hidden" name="vehicleId" value={vehicle.id} />
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm font-medium text-slate-200">Fecha de inicio</p>
            <p className="mt-2 text-sm text-slate-400">
              Selecciona el primer día disponible en el calendario.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm font-medium text-slate-200">Fecha de término</p>
            <p className="mt-2 text-sm text-slate-400">
              El rango se cierra al elegir una fecha posterior al inicio.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {paymentOptions.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl border p-4 transition ${paymentMethod === option.value ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-slate-950/50'}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="sr-only"
              />
              <p className="text-sm font-semibold text-white">{option.label}</p>
            </label>
          ))}
        </div>

        <label className="block text-sm font-medium text-slate-200">
          Observaciones
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ej: retiro en sucursal, solicitud especial, etc."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Tarifa diaria</span>
            <span className="font-semibold text-white">${dailyRate.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Días estimados</span>
            <span className="font-semibold text-white">{estimatedDays}</span>
          </div>
          {priceFormula && (
            <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
              <span>Fórmula</span>
              <span>{priceFormula}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
            <span>Monto total</span>
            <span className="text-xl font-bold text-emerald-300">${estimatedCost.toLocaleString('es-CL')}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedRangeReady}
          className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          Confirmar reserva y pago
        </button>
      </form>
    </div>
  );
}