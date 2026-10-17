import { describe, it, expect } from 'vitest';
import { calculateVacationDaysWithHolidays, isKazakhstanHoliday } from '../kzCalendar';
import { calculateKazakhstanVacationPay } from '../kzPayroll';

describe('Kazakhstan Labor Code ст. 90: Holidays excluded from Vacation Days', () => {
  it('correctly identifies statutory holidays in Kazakhstan', () => {
    expect(isKazakhstanHoliday('2026-03-21')?.name).toBe('Наурыз мейрамы');
    expect(isKazakhstanHoliday('2026-05-09')?.name).toBe('День Победы');
    expect(isKazakhstanHoliday('2026-10-25')?.name).toContain('День Республики');
    expect(isKazakhstanHoliday('2026-04-15')).toBeNull();
  });

  it('excludes Nauryz holidays (March 21-23) from vacation quota deduction', () => {
    // 7 calendar days from March 20 to March 26
    const res = calculateVacationDaysWithHolidays('2026-03-20', '2026-03-26');
    expect(res.totalCalendarDays).toBe(7);
    expect(res.holidaysCount).toBe(3); // 21, 22, 23 March
    expect(res.chargeableDays).toBe(4); // 7 - 3 = 4 days deducted from 24-day quota
    expect(res.explanation).toContain('Наурыз мейрамы');
  });

  it('keeps full count when no public holidays fall in the range', () => {
    // July 15 to July 21 (no holidays)
    const res = calculateVacationDaysWithHolidays('2026-07-15', '2026-07-21');
    expect(res.totalCalendarDays).toBe(7);
    expect(res.holidaysCount).toBe(0);
    expect(res.chargeableDays).toBe(7);
  });
});

describe('Kazakhstan Payroll & Vacation Pay Calculator', () => {
  it('calculates gross, statutory deductions (OPV 10%, VOSMS 2%), and net payout', () => {
    const salary = 450000;
    const days = 14;
    const res = calculateKazakhstanVacationPay(salary, days);

    expect(res.dailyRate).toBe(Math.round(450000 / 21.2));
    expect(res.grossVacationPay).toBe(res.dailyRate * 14);
    expect(res.opv).toBe(Math.round(res.grossVacationPay * 0.10));
    expect(res.vosms).toBe(Math.round(res.grossVacationPay * 0.02));
    expect(res.netVacationPay).toBeGreaterThan(0);
    expect(res.netVacationPay).toBeLessThan(res.grossVacationPay);
    expect(res.payoutDeadlineNotice).toContain('ст. 92 п. 4 ТК РК');
  });
});
