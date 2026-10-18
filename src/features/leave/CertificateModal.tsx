import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileCheck, QrCode, Shield } from 'lucide-react';
import { CertificateType } from '@/types';

const certificateSchema = z.object({
  certificateType: z.enum([
    'WORK_CONFIRMATION',
    'INCOME_CONFIRMATION_6M',
    'INCOME_CONFIRMATION_12M',
    'FORM_T2',
  ]),
  purpose: z.string().min(2, 'Укажите место предоставления или цель'),
  language: z.enum(['ru', 'kz']),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateType: 'WORK_CONFIRMATION',
      purpose: 'По месту требования (АО Kaspi Bank / Halyk Bank)',
      language: 'ru',
    },
  });

  const handleFormSubmit = async (values: CertificateFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  const certificateOptions: { label: string; value: CertificateType }[] = [
    { label: '📄 Справка с места работы с указанием должности', value: 'WORK_CONFIRMATION' },
    { label: '💰 Справка о доходах за последние 6 месяцев (для кредита)', value: 'INCOME_CONFIRMATION_6M' },
    { label: '📊 Справка о доходах за последние 12 месяцев (для визы)', value: 'INCOME_CONFIRMATION_12M' },
    { label: '📑 Выписка из личной карточки Т-2', value: 'FORM_T2' },
  ];

  const languageOptions = [
    { label: '🇷🇺 Русский язык', value: 'ru' },
    { label: '🇰🇿 Қазақ тілі', value: 'kz' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Заказ официальной кадровой справки"
      description="Электронная справка с факсимиле, печатью Jana Post и QR-верификацией подлинности"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Banner with digital verification notice */}
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1 text-blue-950">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>ЭЦП и юридическая сила:</span>
          </div>
          <p className="text-[11px] text-blue-800">
            Все выдаваемые справки подписываются электронной цифровой подписью HR-директора и снабжаются QR-кодом для мгновенной валидации банками РК (Kaspi, Halyk, Forte) и посольствами.
          </p>
        </div>

        <Select
          label="Вид запрашиваемой справки"
          options={certificateOptions}
          error={errors.certificateType?.message}
          {...register('certificateType')}
        />

        <Select
          label="Язык документа"
          options={languageOptions}
          error={errors.language?.message}
          {...register('language')}
        />

        <Textarea
          label="Организация / Место предъявления справки"
          placeholder="Например: для оформления ипотеки в АО Отбасы Банк / для шенгенской визы в Посольство Германии..."
          error={errors.purpose?.message}
          {...register('purpose')}
        />

        <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
          <QrCode className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Срок готовности: автоматически от 1 до 5 минут после отправки запроса.</span>
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
            leftIcon={<FileCheck className="w-4 h-4" />}
          >
            Заказать справку
          </Button>
        </div>
      </form>
    </Modal>
  );
};
