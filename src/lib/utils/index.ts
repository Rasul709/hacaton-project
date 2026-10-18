import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Kazakhstan Timezone helper (Asia/Almaty / UTC+5)
export const KAZAKHSTAN_TIMEZONE = 'Asia/Almaty';

/**
 * Returns YYYY-MM-DD date string formatted strictly in Asia/Almaty (UTC+5) timezone.
 * Prevents UTC midnight date-shifting bugs.
 */
export function getKazakhstanDateString(dateInput?: Date | string): string {
  const d = !dateInput ? new Date() : typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const targetDate = isNaN(d.getTime()) ? new Date() : d;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KAZAKHSTAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(targetDate);
}

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

/**
 * Resolves full URL for uploaded attachments supporting http, https, blob:, and relative server paths.
 */
export function getAttachmentUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${base}${cleanPath}`;
}

