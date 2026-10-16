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
    leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'STUDY']),
    startDate: z.string().min(1, 'Укажите дату начала'),
    endDate: z.string().min(1, 'Укажите дату окончания'),
    reason: z.string().min(5, 'Укажите причину или основание для отпуска'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'Дата окончания не может быть раньше даты начала',
    path: ['endDate'],
  });

type LeaveFormValues = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormValues & { daysCount: number }) => Promise<void>;
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
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate days count
  let calculatedDays = 1;
  if (startDate && endDate) {
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
    });
    reset();
    onClose();
  };

  const leaveOptions = [
    { label: 'Ежегодный оплачиваемый отпуск', value: 'ANNUAL' },
    { label: 'Больничный лист (по временной нетрудоспособности)', value: 'SICK' },
    { label: 'Отпуск без сохранения заработной платы', value: 'UNPAID' },
    { label: 'Учебный отпуск (сессия / повышение квалификации)', value: 'STUDY' },
    { label: 'Отпуск по беременности и родам / уходу за ребенком', value: 'MATERNITY' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Подать заявление на отпуск"
      description="Заявление поступит на рассмотрение руководителю и в отдел кадров Jana Post"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Тип отпуска / отсутствия"
          options={leaveOptions}
          error={errors.leaveType?.message}
          {...register('leaveType')}
        />

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

        {/* Calculated Days badge */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <span className="font-medium">Длительность периода отсутствия:</span>
          <span className="font-bold text-sm text-blue-700 font-mono">
            {calculatedDays} {calculatedDays === 1 ? 'календарный день' : 'календарных дней'}
          </span>
        </div>

        <Textarea
          label="Причина / Комментарий к заявлению"
          placeholder="Обоснование отпуска, контакт на время отсутствия или номер подтверждающей справки..."
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
