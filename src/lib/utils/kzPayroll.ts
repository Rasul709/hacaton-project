/**
 * Kazakhstan Payroll & Vacation Pay Calculator (ТК РК & Налоговый кодекс РК)
 * Statutory rates:
 * - ОПВ (Обязательные пенсионные взносы в ЕНПФ): 10%
 * - ВОСМС (Взносы на обязательное медстрахование в ФСМС): 2%
 * - ИПН (Индивидуальный подоходный налог): 10%
 * - Стандартный налоговый вычет: 14 МРП
 */

export const KZ_MRP_2026 = 3932; // МРП в тенге
export const AVERAGE_MONTH_WORK_DAYS = 21.2;

export interface VacationPayBreakdown {
  salary: number;            // Месячный оклад (₸)
  vacationDays: number;      // Количество дней отпуска
  dailyRate: number;         // Среднедневной заработок (₸)
  grossVacationPay: number;  // Начислено до удержаний (₸)
  opv: number;               // ОПВ 10% (₸)
  vosms: number;             // ВОСМС 2% (₸)
  ipn: number;               // ИПН 10% (₸)
  totalDeductions: number;   // Всего удержаний (₸)
  netVacationPay: number;    // Чистыми на руки («К выплате на карту») (₸)
  payoutDeadlineNotice: string; // Напоминание по ст. 92 п. 4 ТК РК
}

export function calculateKazakhstanVacationPay(
  monthlySalary: number = 450000,
  vacationDays: number = 14
): VacationPayBreakdown {
  const safeSalary = Math.max(0, monthlySalary);
  const safeDays = Math.max(1, vacationDays);

  // Среднедневной заработок
  const dailyRate = Math.round(safeSalary / AVERAGE_MONTH_WORK_DAYS);
  const grossVacationPay = Math.round(dailyRate * safeDays);

  // 1. ОПВ (10%)
  const opv = Math.round(grossVacationPay * 0.10);

  // 2. ВОСМС (2%)
  const vosms = Math.round(grossVacationPay * 0.02);

  // 3. ИПН (10% с вычетом ОПВ, ВОСМС и пропорции вычета 14 МРП)
  const deductionMrp = 14 * KZ_MRP_2026;
  const taxableBase = Math.max(0, grossVacationPay - opv - vosms - (deductionMrp * (safeDays / 30)));
  const ipn = Math.round(taxableBase * 0.10);

  const totalDeductions = opv + vosms + ipn;
  const netVacationPay = Math.max(0, grossVacationPay - totalDeductions);

  return {
    salary: safeSalary,
    vacationDays: safeDays,
    dailyRate,
    grossVacationPay,
    opv,
    vosms,
    ipn,
    totalDeductions,
    netVacationPay,
    payoutDeadlineNotice: 'Согласно ст. 92 п. 4 ТК РК, отпускные выплачиваются не позднее чем за 3 рабочих дня до начала отпуска.',
  };
}
