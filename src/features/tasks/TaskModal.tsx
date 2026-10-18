import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskItem, Employee, HRWorkflowCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getKazakhstanDateString } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(3, 'Введите название кадрового этапа / задачи'),
  description: z.string().min(5, 'Укажите подробные инструкции или нормативные требования'),
  category: z.enum(['ONBOARDING', 'OFFBOARDING', 'COMPLIANCE', 'GENERAL']),
  targetEmployeeName: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  assignedToId: z.string().min(1, 'Выберите ответственного сотрудника'),
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
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'ONBOARDING',
      targetEmployeeName: '',
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
        category: (task.category as any) || 'ONBOARDING',
        targetEmployeeName: task.targetEmployeeName || '',
        priority: task.priority,
        status: task.status,
        assignedToId: task.assignedToId,
        dueDate: task.dueDate,
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'ONBOARDING',
        targetEmployeeName: '',
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

  const applyTemplate = (category: HRWorkflowCategory, title: string, desc: string) => {
    setValue('category', category);
    setValue('title', title);
    setValue('description', desc);
  };

  const categoryOptions = [
    { label: '🚀 Онбординг (Адаптация нового сотрудника)', value: 'ONBOARDING' },
    { label: '🚪 Оффбординг (Увольнение и обходной лист)', value: 'OFFBOARDING' },
    { label: '⚖️ Кадровый комплаенс и аудит ТК РК', value: 'COMPLIANCE' },
    { label: '📌 Общее кадровое поручение', value: 'GENERAL' },
  ];

  const priorityOptions = [
    { label: 'Срочно (Urgent)', value: 'URGENT' },
    { label: 'Высокий (High)', value: 'HIGH' },
    { label: 'Средний (Medium)', value: 'MEDIUM' },
    { label: 'Низкий (Low)', value: 'LOW' },
  ];

  const statusOptions = [
    { label: 'К выполнению (To Do)', value: 'TODO' },
    { label: 'В процессе (In Progress)', value: 'IN_PROGRESS' },
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
      title={isEditing ? 'Редактировать пункт чек-листа' : 'Создать кадровый чек-лист'}
      description="Процессы онбординга, увольнения и соблюдения Трудового кодекса РК"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Quick HR Workflow Presets */}
        {!isEditing && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Быстрые шаблоны кадровых процедур:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    'ONBOARDING',
                    'Регистрация ТД и приказа Т-1 в ЕСУТД Enbek.kz',
                    'Проверить 12-значный ИИН сотрудника, подписать приказ о приеме на работу (Т-1) и зарегистрировать договор в государственной системе ЕСУТД.'
                  )
                }
                className="text-[11px] font-medium px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                + ТД в ЕСУТД
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    'ONBOARDING',
                    'Инструктаж по технике безопасности и ПДД (ст. 182 ТК РК)',
                    'Провести вводный инструктаж по безопасности и охране труда для курьеров и водителей. Зафиксировать подпись в журнале учета.'
                  )
                }
                className="text-[11px] font-medium px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                + Инструктаж ТБ
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    'OFFBOARDING',
                    'Подписание обходного листа и сдача мат. ценностей',
                    'Оффбординг: сдача служебного бейджа, топливной карты, терминала курьера и ключей от помещений хаба.'
                  )
                }
                className="text-[11px] font-medium px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
              >
                + Обходной лист
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    'COMPLIANCE',
                    'Сверка табеля Т-13 перед закрытием зарплатной ведомости',
                    'Проверить отметки Clock In / Out, ночные смены и праздничные часы (ст. 109 ТК РК) перед выгрузкой в 1С:ЗУП.'
                  )
                }
                className="text-[11px] font-medium px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                + Сверка табеля Т-13
              </button>
            </div>
          </div>
        )}

        <Select
          label="Категория кадровой процедуры"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />

        <Input
          label="Название кадрового этапа / задачи"
          placeholder="Например: Выдать форменную одежду и ТСД курьеру"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Сотрудник (на кого оформляется чек-лист)"
          placeholder="Например: Азамат Ибраев (водитель-курьер)"
          error={errors.targetEmployeeName?.message}
          {...register('targetEmployeeName')}
        />

        <Textarea
          label="Подробные инструкции / Нормативные требования"
          placeholder="Укажите перечень действий, необходимые формы приказов или статьи ТК РК..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Приоритет"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />

          <Select
            label="Статус выполнения"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Ответственный исполнитель"
            options={assigneeOptions}
            error={errors.assignedToId?.message}
            {...register('assignedToId')}
          />

          <Input
            label="Срок исполнения (дедлайн)"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? 'Сохранить изменения' : 'Создать пункт чек-листа'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
