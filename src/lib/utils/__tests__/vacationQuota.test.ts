import { describe, it, expect } from 'vitest';

export const RK_STANDARD_VACATION_DAYS = 24;

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return 0;
  }
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays;
}

export function validateVacationQuota(
  daysRequested: number,
  daysUsed: number,
  totalQuota: number = RK_STANDARD_VACATION_DAYS
): { isValid: boolean; remainingDays: number; error?: string } {
  const remaining = totalQuota - daysUsed;
  if (daysRequested <= 0) {
    return { isValid: false, remainingDays: remaining, error: 'Количество дней должно быть больше 0' };
  }
  if (daysRequested > remaining) {
    return {
      isValid: false,
      remainingDays: remaining,
      error: `Запрошено ${daysRequested} дн., доступно только ${remaining} дн. (из квоты ${totalQuota} дн.)`,
    };
  }
  return { isValid: true, remainingDays: remaining - daysRequested };
}

describe('Kazakhstan Labor Code (ТК РК) Vacation Quota Logic', () => {
  it('standard statutory leave quota is 24 calendar days', () => {
    expect(RK_STANDARD_VACATION_DAYS).toBe(24);
  });

  it('accurately calculates inclusive vacation days between two dates', () => {
    // 25.10.2026 to 31.10.2026 = 7 days
    const days = calculateLeaveDays('2026-10-25', '2026-10-31');
    expect(days).toBe(7);
  });

  it('approves leave request when within quota', () => {
    const result = validateVacationQuota(7, 4, 24); // 20 available, 7 requested
    expect(result.isValid).toBe(true);
    expect(result.remainingDays).toBe(13);
  });

  it('rejects leave request when exceeding remaining quota', () => {
    const result = validateVacationQuota(15, 12, 24); // only 12 available, 15 requested
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('доступно только 12 дн.');
  });

  it('rejects zero or negative days', () => {
    const result = validateVacationQuota(0, 0, 24);
    expect(result.isValid).toBe(false);
  });
});
