import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Employee, Department } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'Введите имя сотрудника'),
  lastName: z.string().min(2, 'Введите фамилию сотрудника'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(5, 'Введите номер телефона'),
  jobTitle: z.string().min(2, 'Укажите должность'),
  departmentId: z.string().min(1, 'Выберите департамент'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  startDate: z.string().min(1, 'Укажите дату начала работы'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  employee?: Employee | null;
  departments: Department[];
  isLoading?: boolean;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employee,
  departments,
  isLoading = false,
}) => {
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '+7 ',
      jobTitle: '',
      departmentId: departments[0]?.id || '',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      address: '',
      emergencyContact: '',
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        jobTitle: employee.jobTitle,
        departmentId: employee.departmentId,
        status: employee.status,
        startDate: employee.startDate,
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+7 ',
        jobTitle: '',
        departmentId: departments[0]?.id || '',
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        address: '',
        emergencyContact: '',
      });
    }
  }, [employee, departments, reset, isOpen]);

  const handleFormSubmit = async (values: EmployeeFormValues) => {
    await onSubmit(values);
    onClose();
  };

  const deptOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const statusOptions = [
    { label: 'Активен (В штате)', value: 'ACTIVE' },
    { label: 'Неактивен', value: 'INACTIVE' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
      description={
        isEditing
          ? `Изменение данных сотрудника ${employee.firstName} ${employee.lastName}`
          : 'Заполните учетные данные для зачисления в штат Jana Post'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Имя"
            placeholder="Айгерим"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Фамилия"
            placeholder="Смагулова"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Корпоративный Email"
            type="email"
            placeholder="a.smagulova@janapost.kz"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Телефон"
            placeholder="+7 (701) 000-00-00"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Должность"
            placeholder="Специалист по логистике"
            error={errors.jobTitle?.message}
            {...register('jobTitle')}
          />
          <Select
            label="Департамент"
            options={deptOptions}
            error={errors.departmentId?.message}
            {...register('departmentId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Дата начала работы"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Select
            label="Статус трудоустройства"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Input
          label="Фактический адрес проживания"
          placeholder="г. Алматы, пр. Достык, 160"
          error={errors.address?.message}
          {...register('address')}
        />

        <Input
          label="Экстренный контакт"
          placeholder="+7 (777) 123-4567 (Супруг / Родственник)"
          error={errors.emergencyContact?.message}
          {...register('emergencyContact')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? 'Сохранить изменения' : 'Зачислить в штат'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
