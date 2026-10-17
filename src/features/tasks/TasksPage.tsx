import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TaskItem, TaskStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatKazakhstanDate } from '@/lib/utils';
import { TaskModal } from './TaskModal';
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  List,
  Calendar,
  User,
  ArrowRight,
  Edit2,
  Download,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { exportToCsv } from '@/lib/utils/exportCsv';

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', statusFilter, priorityFilter],
    queryFn: () =>
      api.tasks.getAll({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
      }),
  });

  // Fetch employees for assignee selection
  const { data: employeeResult } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => api.employees.getAll({ limit: 100 }),
  });
  const employees = employeeResult?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.tasks.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Задача создана', `«${data.title}» назначена на ${data.assignedToName}`);
    },
    onError: (err: any) => {
      toast.error('Ошибка создания задачи', err?.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskItem> }) =>
      api.tasks.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.success('Задача обновлена', `Параметры «${data.title}» изменены`);
    },
    onError: (err: any) => {
      toast.error('Ошибка обновления задачи', err?.message);
    },
  });

  // Status transition mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.tasks.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.info(
        'Статус задачи обновлен',
        data.status === 'DONE'
          ? `Задача «${data.title}» успешно завершена!`
          : `Задача переведена в «${data.status === 'IN_PROGRESS' ? 'В работе' : 'К выполнению'}»`
      );
    },
    onError: (err: any) => {
      toast.error('Ошибка изменения статуса', err?.message);
    },
  });

  const handleSave = async (values: any) => {
    if (selectedTask) {
      await updateMutation.mutateAsync({ id: selectedTask.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const kanbanColumns: { status: TaskStatus; label: string; bg: string; border: string }[] = [
    { status: 'TODO', label: 'К выполнению', bg: 'bg-slate-50', border: 'border-slate-200' },
    { status: 'IN_PROGRESS', label: 'В работе', bg: 'bg-blue-50/50', border: 'border-blue-200' },
    { status: 'DONE', label: 'Завершено', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
  ];

  const handleExportTasks = () => {
    const priorityLabels: Record<string, string> = {
      CRITICAL: 'Критический',
      HIGH: 'Высокий',
      MEDIUM: 'Средний',
      LOW: 'Низкий',
    };
    const statusLabels: Record<string, string> = {
      TODO: 'К выполнению',
      IN_PROGRESS: 'В работе',
      DONE: 'Завершено',
    };

    exportToCsv(
      'JanaPost_Reestr_Zadach_I_Porucheniy',
      tasks.map((t) => ({
        ...t,
        statusRussian: statusLabels[t.status] || t.status,
        priorityRussian: priorityLabels[t.priority] || t.priority,
        dueDateFormatted: t.dueDate ? formatKazakhstanDate(t.dueDate) : 'Бессрочно',
        createdAtFormatted: formatKazakhstanDate(t.createdAt),
      })),
      [
        { key: 'title', label: 'Название задачи' },
        { key: 'statusRussian', label: 'Текущий статус' },
        { key: 'priorityRussian', label: 'Приоритет' },
        { key: 'assignedToName', label: 'Ответственный сотрудник' },
        { key: 'dueDateFormatted', label: 'Срок выполнения (дедлайн)' },
        { key: 'createdAtFormatted', label: 'Дата постановки' },
        { key: 'description', label: 'Детальное описание' },
      ]
    );
    toast.success('Экспорт завершен', 'Реестр задач успешно выгружен в Excel / CSV');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#101828]">Задачи и поручения</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {tasks.length} задач
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Координация внутренних задач отделов логистики, IT и HR Jana Post
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View switcher */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Канбан</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Список</span>
            </button>
          </div>

          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExportTasks}
            disabled={tasks.length === 0}
          >
            Экспорт задач
          </Button>

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
          >
            Новая задача
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию задачи, исполнителю..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Все приоритеты</option>
            <option value="URGENT">Срочно</option>
            <option value="HIGH">Высокий</option>
            <option value="MEDIUM">Средний</option>
            <option value="LOW">Низкий</option>
          </select>

          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Все статусы</option>
              <option value="TODO">К выполнению</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Завершено</option>
            </select>
          )}
        </div>
      </div>

      {/* Content: Kanban or List */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки задач</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Задачи отсутствуют"
          description="По заданным критериям фильтрации задач не найдено."
          actionText="Создать задачу"
          onAction={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 shadow-xs">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => {
                    const isOverdue = t.dueDate < today && t.status !== 'DONE';
                    return (
                      <div
                        key={t.id}
                        className="bg-white rounded-xl p-4 border border-[#E4E7EC] shadow-xs hover:shadow-md transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <TaskPriorityBadge priority={t.priority} />
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Редактировать задачу"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {t.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {t.description}
                          </p>
                        </div>

                        {/* Footer with assignee and deadline */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate max-w-[140px]">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{t.assignedToName}</span>
                          </span>

                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              isOverdue ? 'text-red-600' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{formatKazakhstanDate(t.dueDate)}</span>
                            {isOverdue && <span className="text-[9px] font-bold">(!)</span>}
                          </span>
                        </div>

                        {/* Status Shift Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          {col.status !== 'TODO' && (
                            <button
                              onClick={() =>
                                statusMutation.mutate({
                                  id: t.id,
                                  status: col.status === 'DONE' ? 'IN_PROGRESS' : 'TODO',
                                })
                              }
                              className="text-[10px] text-slate-500 hover:text-slate-800 font-medium py-1 px-2 rounded hover:bg-slate-100"
                            >
                              ← Назад
                            </button>
                          )}
                          {col.status !== 'DONE' && (
                            <button
                              onClick={() =>
                                statusMutation.mutate({
                                  id: t.id,
                                  status: col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE',
                                })
                              }
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold py-1 px-2 rounded hover:bg-blue-50 ml-auto flex items-center gap-1"
                            >
                              <span>{col.status === 'TODO' ? 'В работу' : 'Завершить'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Table) */
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Задача</th>
                  <th className="py-3.5 px-4">Приоритет</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4">Исполнитель</th>
                  <th className="py-3.5 px-4">Дедлайн</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredTasks.map((t) => {
                  const isOverdue = t.dueDate < today && t.status !== 'DONE';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-[11px] text-slate-500 max-w-md truncate">
                          {t.description}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <TaskPriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <TaskStatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {t.assignedToName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            isOverdue ? 'text-red-600' : 'text-slate-600'
                          }`}
                        >
                          {formatKazakhstanDate(t.dueDate)}
                        </span>
                        {isOverdue && (
                          <span className="block text-[10px] text-red-500 font-bold">
                            Просрочено
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTask(t);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        task={selectedTask}
        employees={employees}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
