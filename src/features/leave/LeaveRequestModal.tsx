import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LeaveType } from '@/types';
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

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormValues & { daysCount: number; amount?: number }) => Promise<void>;
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
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      reason: '',
      amount: 150000,
    },
  });

  const leaveType = watch('leaveType');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate days count
  let calculatedDays = 1;
  if (startDate && endDate && leaveType !== 'SALARY_ADVANCE' && leaveType !== 'WORK_CERTIFICATE') {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (e >= s) {
      calculatedDays = Math.round((e - s) / 86400000) + 1;
    }
  }

  const handleFormSubmit = async (values: LeaveFormValues) => {
    await onSubmit({
      ...values,
      daysCount: calculatedDays,
      amount: values.leaveType === 'SALARY_ADVANCE' ? values.amount : undefined,
    });
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

        {/* Calculated Days badge for leave types */}
        {leaveType !== 'SALARY_ADVANCE' && leaveType !== 'WORK_CERTIFICATE' && (
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <span className="font-medium">Длительность периода отсутствия:</span>
            <span className="font-bold text-sm text-blue-700 font-mono">
              {calculatedDays} {calculatedDays === 1 ? 'календарный день' : 'календарных дней'}
            </span>
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
