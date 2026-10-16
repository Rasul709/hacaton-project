import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Kazakhstan Timezone helper (Asia/Almaty / UTC+5)
export const KAZAKHSTAN_TIMEZONE = 'Asia/Almaty';

export function formatKazakhstanDate(dateInput: string | Date | undefined, includeTime: boolean = false): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: KAZAKHSTAN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(d);
}

export function formatKazakhstanTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: KAZAKHSTAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDuration(minutes?: number): string {
  if (minutes === undefined || minutes === null || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  if (hours === 0) return `${remainingMins} мин`;
  return `${hours} ч ${remainingMins} мин`;
}

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${f}${l}` || 'JP';
}
