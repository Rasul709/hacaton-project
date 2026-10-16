import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Department, Employee } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const departmentSchema = z.object({
  name: z.string().min(2, 'Введите название отдела'),
  code: z.string().min(2, 'Укажите короткий код (например, LOG, IT)'),
  description: z.string().min(5, 'Укажите описание функций отдела'),
  managerId: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormValues) => Promise<void>;
  department?: Department | null;
  employees: Employee[];
  isLoading?: boolean;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  department,
  employees,
  isLoading = false,
}) => {
  const isEditing = !!department;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      managerId: '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code,
        description: department.description,
        managerId: department.managerId || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        managerId: '',
      });
    }
  }, [department, reset, isOpen]);

  const handleFormSubmit = async (values: DepartmentFormValues) => {
    await onSubmit(values);
    onClose();
  };

  const managerOptions = [
    { label: 'Без назначенного руководителя', value: '' },
    ...employees.map((e) => ({
      label: `${e.firstName} ${e.lastName} (${e.jobTitle})`,
      value: e.id,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Редактировать департамент' : 'Создать департамент'}
      description="Организационная структура компании Jana Post"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Название департамента"
          placeholder="Логистика и магистральные перевозки"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Код отдела"
            placeholder="LOG"
            error={errors.code?.message}
            {...register('code')}
          />
          <Select
            label="Руководитель отдела"
            options={managerOptions}
            error={errors.managerId?.message}
            {...register('managerId')}
          />
        </div>

        <Textarea
          label="Описание и задачи департамента"
          placeholder="Основные зоны ответственности подразделения в структуре Jana Post..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? 'Сохранить изменения' : 'Создать отдел'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
