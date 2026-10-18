import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Banknote, Info, ShieldCheck } from 'lucide-react';
import { getKazakhstanDateString } from '@/lib/utils';

const advanceSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Введите корректную сумму' })
    .min(10000, 'Минимальная сумма аванса — 10 000 ₸')
    .max(500000, 'Максимальный аванс — 500 000 ₸ (до 50% от оклада)'),
  payoutDate: z.string().min(1, 'Укажите желаемую дату выплаты'),
  reason: z.string().min(3, 'Укажите комментарий или реквизиты'),
});

type AdvanceFormValues = z.infer<typeof advanceSchema>;

interface SalaryAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdvanceFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const SalaryAdvanceModal: React.FC<SalaryAdvanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  // Default to 15th of current or next month
  const defaultPayoutDate = React.useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    let target = new Date(now.getFullYear(), now.getMonth(), 15);
    if (day > 15) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    }
    return getKazakhstanDateString(target);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdvanceFormValues>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      amount: 150000,
      payoutDate: defaultPayoutDate,
      reason: 'Плановый аванс на карту Kaspi Gold',
    },
  });

  const amount = watch('amount');

  const handleFormSubmit = async (values: AdvanceFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Заявление на аванс по заработной плате"
      description="Межрасчетная выплата до 50% должностного оклада в соответствии с Положением об оплате труда Jana Post"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Banner with rules */}
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl text-xs space-y-1 text-emerald-950">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Правила межрасчетных выплат:</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            • Плановая дата перечисления аванса — 15-е число расчетного месяца.
          </p>
          <p className="text-[11px] text-emerald-800">
            • Выплата производится на зарплатную карту Kaspi или Halyk Bank без комиссии.
          </p>
        </div>

        <Input
          label="Запрашиваемая сумма аванса (в тенге, ₸)"
          type="number"
          step="5000"
          placeholder="Например: 150000"
          error={errors.amount?.message}
          hint={`К зачислению: ${amount ? amount.toLocaleString() : '0'} ₸`}
          {...register('amount')}
        />

        <Input
          label="Плановая дата выплаты"
          type="date"
          error={errors.payoutDate?.message}
          {...register('payoutDate')}
        />

        <Textarea
          label="Основание / Примечание / Банковские реквизиты"
          placeholder="Например: плановый аванс на карту Kaspi / непредвиденные семейные расходы..."
          error={errors.reason?.message}
          {...register('reason')}
        />

        <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Сумма аванса будет автоматически удержана из расчетного листа при начислении зарплаты за текущий месяц.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Banknote className="w-4 h-4" />}
          >
            Запросить аванс
          </Button>
        </div>
      </form>
    </Modal>
  );
};
