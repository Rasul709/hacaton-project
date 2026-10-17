import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskItem, Employee } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getKazakhstanDateString } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(3, 'Введите название задачи'),
  description: z.string().min(5, 'Укажите подробное описание задачи'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  assignedToId: z.string().min(1, 'Выберите исполнителя задачи'),
  dueDate: z.string().min(1, 'Укажите срок исполнения (дедлайн)'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues & { assignedToName: string }) => Promise<void>;
  task?: TaskItem | null;
  employees: Employee[];
  isLoading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  employees,
  isLoading = false,
}) => {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      assignedToId: employees[0]?.id || '',
      dueDate: getKazakhstanDateString(new Date(Date.now() + 3 * 86400000)),
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedToId: task.assignedToId,
        dueDate: task.dueDate,
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assignedToId: employees[0]?.id || '',
        dueDate: getKazakhstanDateString(new Date(Date.now() + 3 * 86400000)),
      });
    }
  }, [task, employees, reset, isOpen]);

  const handleFormSubmit = async (values: TaskFormValues) => {
    const assignee = employees.find((e) => e.id === values.assignedToId);
    await onSubmit({
      ...values,
      assignedToName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Сотрудник',
    });
    onClose();
  };

  const priorityOptions = [
    { label: 'Срочно (Urgent)', value: 'URGENT' },
    { label: 'Высокий (High)', value: 'HIGH' },
    { label: 'Средний (Medium)', value: 'MEDIUM' },
    { label: 'Низкий (Low)', value: 'LOW' },
  ];

  const statusOptions = [
    { label: 'К выполнению (To Do)', value: 'TODO' },
    { label: 'В работе (In Progress)', value: 'IN_PROGRESS' },
    { label: 'Завершено (Done)', value: 'DONE' },
    { label: 'Отменено (Cancelled)', value: 'CANCELLED' },
  ];

  const assigneeOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName} — ${e.jobTitle} (${e.departmentName})`,
    value: e.id,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Редактировать задачу' : 'Поставить новую задачу'}
      description="Управление рабочими поручениями и дедлайнами в Jana Post"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Заголовок задачи"
          placeholder="Например: Аудит оборудования на складе Алматы"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Приоритет"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <Select
            label="Статус"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Select
          label="Исполнитель"
          options={assigneeOptions}
          error={errors.assignedToId?.message}
          {...register('assignedToId')}
        />

        <Input
          label="Крайний срок (Дедлайн)"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Textarea
          label="Описание задачи и ожидаемый результат"
          placeholder="Детали поручения, чек-лист или критерии приемки..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? 'Сохранить изменения' : 'Создать задачу'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
