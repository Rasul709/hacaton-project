import { describe, it, expect } from 'vitest';
import {
  formatKazakhstanDate,
  formatKazakhstanTime,
  formatDuration,
  getInitials,
} from '../index';

describe('Kazakhstan Timezone & Formatting Utilities (UTC+5)', () => {
  it('formats UTC ISO timestamp into Kazakhstan date in DD.MM.YYYY', () => {
    // 2026-10-16 19:30 UTC is 2026-10-17 00:30 UTC+5
    const isoUtc = '2026-10-16T19:30:00Z';
    const result = formatKazakhstanDate(isoUtc);
    expect(result).toBe('17.10.2026');
  });

  it('formats time in Asia/Almaty (UTC+5) accurately', () => {
    const isoUtc = '2026-10-17T03:45:00Z'; // 03:45 UTC -> 08:45 in UTC+5
    const timeResult = formatKazakhstanTime(isoUtc);
    expect(timeResult).toBe('08:45');
  });

  it('handles invalid or undefined dates gracefully', () => {
    expect(formatKazakhstanDate(undefined)).toBe('—');
    expect(formatKazakhstanDate('invalid-date')).toBe('—');
    expect(formatKazakhstanTime(undefined)).toBe('—');
  });

  it('formats work shift durations in Russian', () => {
    expect(formatDuration(45)).toBe('45 мин');
    expect(formatDuration(125)).toBe('2 ч 5 мин');
    expect(formatDuration(480)).toBe('8 ч 0 мин');
    expect(formatDuration(undefined)).toBe('—');
  });

  it('generates uppercase initials from employee names', () => {
    expect(getInitials('Айгерим', 'Смагулова')).toBe('АС');
    expect(getInitials('Бауыржан', 'Касымов')).toBe('БК');
    expect(getInitials('', '')).toBe('JP');
  });
});
