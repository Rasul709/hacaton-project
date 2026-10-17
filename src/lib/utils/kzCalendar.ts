/**
 * Kazakhstan Production Calendar & Statutory Holidays Engine
 * Implements Article 90, Clause 1 of the Labor Code of the Republic of Kazakhstan (ТК РК):
 * «Продолжительность оплачиваемых ежегодных трудовых отпусков исчисляется в календарных днях
 * без учета праздничных дней, приходящихся на дни оплачиваемого трудового отпуска,
 * независимо от применяемых режимов работы и графиков сменности».
 */

export interface HolidayDefinition {
  month: number; // 1-12
  day: number;   // 1-31
  name: string;
}

export const KZ_STATUTORY_HOLIDAYS: HolidayDefinition[] = [
  { month: 1, day: 1, name: 'Новый год' },
  { month: 1, day: 2, name: 'Новый год' },
  { month: 1, day: 7, name: 'Православное Рождество' },
  { month: 3, day: 8, name: 'Международный женский день' },
  { month: 3, day: 21, name: 'Наурыз мейрамы' },
  { month: 3, day: 22, name: 'Наурыз мейрамы' },
  { month: 3, day: 23, name: 'Наурыз мейрамы' },
  { month: 5, day: 1, name: 'Праздник единства народа Казахстана' },
  { month: 5, day: 7, name: 'День защитника Отечества' },
  { month: 5, day: 9, name: 'День Победы' },
  { month: 7, day: 6, name: 'День Столицы' },
  { month: 8, day: 30, name: 'День Конституции РК' },
  { month: 10, day: 25, name: 'Национальный праздник — День Республики' },
  { month: 12, day: 16, name: 'День Независимости РК' },
];

export interface HolidayMatch {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface VacationDaysCalculation {
  totalCalendarDays: number;
  holidaysCount: number;
  holidays: HolidayMatch[];
  chargeableDays: number; // Дни, списываемые с 24-дневной квоты по ст. 90 ТК РК
  explanation: string;
}

/**
 * Check if a specific date is a statutory holiday in Kazakhstan
 */
export function isKazakhstanHoliday(dateStr: string): HolidayMatch | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const found = KZ_STATUTORY_HOLIDAYS.find((h) => h.month === month && h.day === day);
  if (!found) return null;

  return {
    date: dateStr,
    name: found.name,
  };
}

/**
 * Calculate vacation duration compliant with Article 90 of RK Labor Code.
 * Public holidays are excluded from quota deduction!
 */
export function calculateVacationDaysWithHolidays(startDateStr: string, endDateStr: string): VacationDaysCalculation {
  if (!startDateStr || !endDateStr) {
    return {
      totalCalendarDays: 0,
      holidaysCount: 0,
      holidays: [],
      chargeableDays: 0,
      explanation: 'Укажите даты начала и окончания',
    };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return {
      totalCalendarDays: 0,
      holidaysCount: 0,
      holidays: [],
      chargeableDays: 0,
      explanation: 'Дата окончания не может быть раньше даты начала',
    };
  }

  const holidays: HolidayMatch[] = [];
  let current = new Date(start);
  let totalDays = 0;

  while (current <= end) {
    totalDays++;
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const curStr = `${y}-${m}-${d}`;

    const holiday = isKazakhstanHoliday(curStr);
    if (holiday) {
      holidays.push(holiday);
    }

    current.setDate(current.getDate() + 1);
  }

  const chargeableDays = Math.max(0, totalDays - holidays.length);

  let explanation = `${totalDays} календарных дней`;
  if (holidays.length > 0) {
    const names = holidays.map((h) => `${h.name} (${h.date.split('-').slice(1).reverse().join('.')})`).join(', ');
    explanation = `${totalDays} календ. дн. (из них ${holidays.length} праздничн. дн. по ст. 90 ТК РК: ${names}). К списанию из отпускного баланса: ${chargeableDays} дн.`;
  }

  return {
    totalCalendarDays: totalDays,
    holidaysCount: holidays.length,
    holidays,
    chargeableDays,
    explanation,
  };
}
