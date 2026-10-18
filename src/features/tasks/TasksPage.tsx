import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TaskItem, TaskStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskPriorityBadge, TaskStatusBadge, HRWorkflowCategoryBadge } from '@/components/ui/Badge';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatKazakhstanDate, getKazakhstanDateString } from '@/lib/utils';
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
  UserPlus,
  UserMinus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { exportToCsv } from '@/lib/utils/exportCsv';

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', priorityFilter],
    queryFn: () =>
      api.tasks.getAll({
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
      toast.success('Чек-лист создан', `«${data.title}» назначен на ${data.assignedToName}`);
    },
    onError: (err: any) => {
      toast.error('Ошибка создания чек-листа', err?.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskItem> }) =>
      api.tasks.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.success('Чек-лист обновлен', `Параметры «${data.title}» изменены`);
    },
    onError: (err: any) => {
      toast.error('Ошибка обновления чек-листа', err?.message);
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
        'Статус процедуры обновлен',
        data.status === 'DONE'
          ? `Этап «${data.title}» успешно закрыт!`
          : `Этап переведен в статус «${data.status === 'IN_PROGRESS' ? 'В процессе' : 'К выполнению'}»`
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
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedToName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.targetEmployeeName || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || (t.category || 'ONBOARDING') === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const today = useMemo(() => getKazakhstanDateString(), []);

  // Summary counts
  const onboardingCount = tasks.filter(
    (t) => (t.category === 'ONBOARDING' || !t.category) && t.status !== 'DONE'
  ).length;
  const offboardingCount = tasks.filter(
    (t) => t.category === 'OFFBOARDING' && t.status !== 'DONE'
  ).length;
  const complianceCount = tasks.filter(
    (t) => t.category === 'COMPLIANCE' && t.status !== 'DONE'
  ).length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  const kanbanColumns: { status: TaskStatus; label: string; bg: string; border: string }[] = [
    { status: 'TODO', label: 'К выполнению', bg: 'bg-slate-50', border: 'border-slate-200' },
    { status: 'IN_PROGRESS', label: 'В процессе', bg: 'bg-blue-50/50', border: 'border-blue-200' },
    { status: 'DONE', label: 'Завершено', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
  ];

  const handleExportTasks = () => {
    exportToCsv(
      'JanaPost_Reestr_Kadrovih_Cheklistov',
      tasks.map((t) => ({
        ...t,
        categoryText:
          t.category === 'ONBOARDING'
            ? 'Онбординг'
            : t.category === 'OFFBOARDING'
            ? 'Оффбординг'
            : t.category === 'COMPLIANCE'
            ? 'Комплаенс'
            : 'Кадровый процесс',
        targetEmployee: t.targetEmployeeName || '—',
        dueDateFormatted: t.dueDate ? formatKazakhstanDate(t.dueDate) : 'Бессрочно',
        createdAtFormatted: formatKazakhstanDate(t.createdAt),
      })),
      [
        { key: 'categoryText', label: 'Категория' },
        { key: 'title', label: 'Название кадрового этапа' },
        { key: 'targetEmployee', label: 'Сотрудник' },
        { key: 'status', label: 'Статус' },
        { key: 'priority', label: 'Приоритет' },
        { key: 'assignedToName', label: 'Ответственный HR' },
        { key: 'dueDateFormatted', label: 'Срок выполнения' },
        { key: 'description', label: 'Описание и требования' },
      ]
    );
    toast.success('Экспорт завершен', 'Реестр кадровых чек-листов выгружен в Excel / CSV');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#101828]">Кадровые чек-листы и регламенты</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {tasks.length} процедур
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Контроль процедур онбординга (ТБ, приказ Т-1, ЕСУТД) и оффбординга (обходной лист, расчет ТК РК)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
              <span>Доска</span>
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
              <span>Чек-лист</span>
            </button>
          </div>

          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExportTasks}
            disabled={tasks.length === 0}
          >
            Экспорт
          </Button>

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
          >
            Создать чек-лист
          </Button>
        </div>
      </div>

      {/* Workflow Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setCategoryFilter(categoryFilter === 'ONBOARDING' ? 'ALL' : 'ONBOARDING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            categoryFilter === 'ONBOARDING'
              ? 'bg-blue-50/80 border-blue-400 shadow-xs'
              : 'bg-white border-[#E4E7EC] hover:border-blue-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Онбординг
            </span>
            <span className="text-2xl font-extrabold text-blue-700">{onboardingCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">в процессе адаптации</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setCategoryFilter(categoryFilter === 'OFFBOARDING' ? 'ALL' : 'OFFBOARDING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            categoryFilter === 'OFFBOARDING'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
              : 'bg-white border-[#E4E7EC] hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Оффбординг
            </span>
            <span className="text-2xl font-extrabold text-amber-700">{offboardingCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">обходные листы</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
            <UserMinus className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setCategoryFilter(categoryFilter === 'COMPLIANCE' ? 'ALL' : 'COMPLIANCE')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            categoryFilter === 'COMPLIANCE'
              ? 'bg-purple-50/80 border-purple-400 shadow-xs'
              : 'bg-white border-[#E4E7EC] hover:border-purple-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Комплаенс ТК РК
            </span>
            <span className="text-2xl font-extrabold text-purple-700">{complianceCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">аудит и охрана труда</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4E7EC] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Выполнено
            </span>
            <span className="text-2xl font-extrabold text-emerald-700">{doneCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">успешно закрыто</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'Все процедуры', value: 'ALL' },
            { label: 'Онбординг', value: 'ONBOARDING' },
            { label: 'Оффбординг', value: 'OFFBOARDING' },
            { label: 'Комплаенс', value: 'COMPLIANCE' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === tab.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Priority Selector */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию, сотруднику..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Все приоритеты</option>
            <option value="URGENT">Срочно</option>
            <option value="HIGH">Высокий</option>
            <option value="MEDIUM">Средний</option>
            <option value="LOW">Низкий</option>
          </select>
        </div>
      </div>

      {/* Content: Kanban Board or Table Checklist */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки кадровых чек-листов</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Кадровые чек-листы отсутствуют"
          description="По заданным критериям фильтрации чек-листов не найдено."
          actionText="Создать чек-лист"
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <HRWorkflowCategoryBadge category={t.category} />
                            <TaskPriorityBadge priority={t.priority} />
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Редактировать пункт"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {t.title}
                          </h4>
                          {t.targetEmployeeName && (
                            <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                              Сотрудник: {t.targetEmployeeName}
                            </p>
                          )}
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
                              <span>{col.status === 'TODO' ? 'В процесс' : 'Завершить этап'}</span>
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
        /* List View (Table Checklist) */
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Категория</th>
                  <th className="py-3.5 px-4">Кадровый этап</th>
                  <th className="py-3.5 px-4">Сотрудник</th>
                  <th className="py-3.5 px-4">Приоритет</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4">Ответственный</th>
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
                        <HRWorkflowCategoryBadge category={t.category} />
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-[11px] text-slate-500 max-w-md truncate">
                          {t.description}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        {t.targetEmployeeName || '—'}
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
                        <div className="flex items-center justify-end gap-2">
                          {t.status !== 'DONE' && (
                            <button
                              onClick={() => statusMutation.mutate({ id: t.id, status: 'DONE' })}
                              className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Отметить как выполненный"
                            >
                              Закрыть этап
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700"
                            title="Редактировать"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
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
