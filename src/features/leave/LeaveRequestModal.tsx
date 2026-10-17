import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const leaveRequestSchema = z
  .object({
    leaveType: z.enum([
      'ANNUAL',
      'SICK',
      'UNPAID',
      'MATERNITY',
      'STUDY',
      'SALARY_ADVANCE',
      'WORK_CERTIFICATE',
    ]),
    startDate: z.string().min(1, 'Укажите дату'),
    endDate: z.string().min(1, 'Укажите дату'),
    reason: z.string().min(3, 'Укажите причину или основание для заявки'),
    amount: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.leaveType === 'SALARY_ADVANCE' || data.leaveType === 'WORK_CERTIFICATE') {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'Дата окончания не может быть раньше даты начала',
      path: ['endDate'],
    }
  );

type LeaveFormValues = z.infer<typeof leaveRequestSchema>;

import { Paperclip, FileText, X, Sparkles, Calculator, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { calculateVacationDaysWithHolidays } from '@/lib/utils/kzCalendar';
import { calculateKazakhstanVacationPay } from '@/lib/utils/kzPayroll';
import { getKazakhstanDateString } from '@/lib/utils';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormValues & { daysCount: number; amount?: number; attachmentUrl?: string; attachmentName?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: 'ANNUAL',
      startDate: getKazakhstanDateString(),
      endDate: getKazakhstanDateString(new Date(Date.now() + 7 * 86400000)),
      reason: '',
      amount: 150000,
    },
  });

  const leaveType = watch('leaveType');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate days count taking into account Article 90 of Kazakhstan Labor Code
  const vacationCalculation = React.useMemo(() => {
    if (!startDate || !endDate || leaveType === 'SALARY_ADVANCE' || leaveType === 'WORK_CERTIFICATE') {
      return { totalCalendarDays: 1, holidaysCount: 0, holidays: [], chargeableDays: 1, explanation: '' };
    }
    return calculateVacationDaysWithHolidays(startDate, endDate);
  }, [startDate, endDate, leaveType]);

  const calculatedDays = vacationCalculation.chargeableDays || 1;

  // Real-time payroll calculation for annual leave
  const vacationPay = React.useMemo(() => {
    if (leaveType !== 'ANNUAL') return null;
    return calculateKazakhstanVacationPay(450000, calculatedDays);
  }, [leaveType, calculatedDays]);

  const [attachment, setAttachment] = React.useState<{ url: string; filename: string } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setAttachment(null);
      setUploadError(null);
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await api.upload(file);
      setAttachment({ url: res.url, filename: res.filename || file.name });
    } catch (err: any) {
      setUploadError(err?.message || 'Не удалось загрузить файл');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (values: LeaveFormValues) => {
    await onSubmit({
      ...values,
      daysCount: calculatedDays,
      amount: values.leaveType === 'SALARY_ADVANCE' ? values.amount : undefined,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.filename,
    });
    setAttachment(null);
    reset();
    onClose();
  };

  const serviceOptions = [
    { label: '🏖️ Ежегодный оплачиваемый отпуск (ТК РК ст. 88)', value: 'ANNUAL' },
    { label: '💰 Аванс по заработной плате (межрасчетная выплата)', value: 'SALARY_ADVANCE' },
    { label: '📄 Справка с места работы / о доходах', value: 'WORK_CERTIFICATE' },
    { label: '🏥 Больничный лист (по нетрудоспособности)', value: 'SICK' },
    { label: '⏳ Отпуск без сохранения зарплаты (без содержания)', value: 'UNPAID' },
    { label: '🎓 Учебный отпуск (сессия / повышение квалификации)', value: 'STUDY' },
    { label: '👶 Отпуск по беременности и родам / уходу за ребенком', value: 'MATERNITY' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Подать электронную HR-заявку"
      description="Заявление поступит на рассмотрение непосредственному руководителю и в кадровую службу Jana Post"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Тип кадровой заявки / сервиса"
          options={serviceOptions}
          error={errors.leaveType?.message}
          {...register('leaveType')}
        />

        {/* If Advance, show Amount input */}
        {leaveType === 'SALARY_ADVANCE' && (
          <Input
            label="Запрашиваемая сумма аванса (в тенге, ₸)"
            type="number"
            step="10000"
            placeholder="Например: 150000"
            error={errors.amount?.message}
            hint="Плановая дата выплаты: 15-е число месяца (до 50% от должностного оклада)"
            {...register('amount')}
          />
        )}

        {/* Date pickers (for vacation or single date for advance/certificate) */}
        {leaveType !== 'SALARY_ADVANCE' && leaveType !== 'WORK_CERTIFICATE' ? (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Дата начала"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="Дата окончания"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
        ) : (
          <Input
            label={leaveType === 'SALARY_ADVANCE' ? 'Расчетный месяц' : 'Дата предоставления'}
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
        )}

        {/* Calculated Days badge for leave types (Article 90 KZ Labor Code) */}
        {leaveType !== 'SALARY_ADVANCE' && leaveType !== 'WORK_CERTIFICATE' && (
          <div className="space-y-2">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
              <div>
                <span className="font-medium block">К списанию из отпускного баланса:</span>
                {vacationCalculation.holidaysCount > 0 && (
                  <span className="text-[11px] text-blue-600">
                    Период: {vacationCalculation.totalCalendarDays} дн. (ст. 90 ТК РК: праздники не уменьшают баланс)
                  </span>
                )}
              </div>
              <span className="font-bold text-sm text-blue-700 font-mono">
                {calculatedDays} {calculatedDays === 1 ? 'день' : 'дней'}
              </span>
            </div>

            {/* If public holidays are in the chosen range, show special badge */}
            {vacationCalculation.holidaysCount > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Праздничные дни исключены из расхода (ст. 90 ТК РК):</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {vacationCalculation.holidays.map((h) => `${h.name} (${h.date.split('-').reverse().slice(0, 2).join('.')})`).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Vacation Pay Calculator for Annual Leave */}
            {leaveType === 'ANNUAL' && vacationPay && (
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <div className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Расчет отпускных (ТК РК, оклад 450 000 ₸):</span>
                  </div>
                  <span className="font-mono text-sm text-emerald-700">
                    {vacationPay.netVacationPay.toLocaleString()} ₸
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/50">
                  <span>Начислено: {vacationPay.grossVacationPay.toLocaleString()} ₸</span>
                  <span>Удержания (ОПВ, ВОСМС, ИПН): -{vacationPay.totalDeductions.toLocaleString()} ₸</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                  <Info className="w-3 h-3 shrink-0" />
                  <span>Выплата за 3 раб. дня до отпуска (ст. 92 п. 4 ТК РК) на Kaspi/Halyk</span>
                </div>
              </div>
            )}
          </div>
        )}

        <Textarea
          label="Обоснование / Комментарий к заявке"
          placeholder={
            leaveType === 'SALARY_ADVANCE'
              ? 'Например: плановый аванс на расчетный счет или семейные обстоятельства...'
              : leaveType === 'WORK_CERTIFICATE'
              ? 'Например: для предоставления в АО Kaspi Bank / Посольство / ЦОН...'
              : 'Обоснование отпуска, контакт на время отсутствия или номер подтверждающей справки...'
          }
          error={errors.reason?.message}
          {...register('reason')}
        />

        {/* Attachment upload field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Подтверждающий документ (больничный лист, справка-вызов, скан заявления)
          </label>
          {attachment ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium truncate">{attachment.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Удалить файл"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl cursor-pointer transition-colors text-xs text-slate-600">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span>{isUploading ? 'Загрузка файла...' : 'Прикрепить файл (PDF, PNG, JPG, DOCX до 10 МБ)'}</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx"
                disabled={isUploading}
              />
            </label>
          )}
          {uploadError && <p className="text-xs text-rose-500 font-medium">{uploadError}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Отправить на согласование
          </Button>
        </div>
      </form>
    </Modal>
  );
};
