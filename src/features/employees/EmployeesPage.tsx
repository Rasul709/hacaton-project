import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Employee } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatKazakhstanDate } from '@/lib/utils';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeDetailsModal } from './EmployeeDetailsModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { exportToCsv } from '@/lib/utils/exportCsv';

export const EmployeesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters state
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deactivateEmployee, setDeactivateEmployee] = useState<Employee | null>(null);

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.departments.getAll(),
  });

  // Fetch employees paginated
  const {
    data: employeeResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employees', page, limit, search, departmentId, status],
    queryFn: () =>
      api.employees.getAll({
        page,
        limit,
        search,
        departmentId: departmentId === 'ALL' ? undefined : departmentId,
        status: status === 'ALL' ? undefined : status,
      }),
  });

  const toast = useToast();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Employee, 'id' | 'employeeId'>) => api.employees.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Сотрудник зачислен в штат', `${data.firstName} ${data.lastName} успешно добавлен в систему`);
    },
    onError: (err: any) => {
      toast.error('Ошибка добавления', err?.message || 'Не удалось добавить сотрудника');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      api.employees.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.success('Профиль обновлен', `Данные ${data.firstName} ${data.lastName} сохранены`);
    },
    onError: (err: any) => {
      toast.error('Ошибка сохранения', err?.message || 'Не удалось обновить профиль');
    },
  });

  // Toggle status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: 'ACTIVE' | 'INACTIVE' }) =>
      api.employees.setStatus(id, newStatus),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.info(
        data.status === 'ACTIVE' ? 'Сотрудник восстановлен' : 'Сотрудник деактивирован',
        `${data.firstName} ${data.lastName} переведен в статус ${data.status}`
      );
      setDeactivateEmployee(null);
    },
    onError: (err: any) => {
      toast.error('Ошибка изменения статуса', err?.message);
    },
  });

  const employees = employeeResult?.data || [];
  const total = employeeResult?.total || 0;
  const totalPages = employeeResult?.totalPages || 1;

  const handleExport = async () => {
    try {
      const allRes = await api.employees.getAll({ limit: 1000 });
      const exportList = allRes.data && allRes.data.length > 0 ? allRes.data : employees;
      exportToCsv('JanaPost_Shtat_Sotrudnikov', exportList, [
        { key: 'employeeId', label: 'Табельный номер' },
        { key: 'lastName', label: 'Фамилия' },
        { key: 'firstName', label: 'Имя' },
        { key: 'departmentName', label: 'Департамент' },
        { key: 'jobTitle', label: 'Должность' },
        { key: 'email', label: 'Корпоративный Email' },
        { key: 'phone', label: 'Телефон' },
        { key: 'status', label: 'Статус' },
        { key: 'startDate', label: 'Дата приема' },
      ]);
      toast.success(
        'Экспорт завершен',
        `Штатное расписание (${exportList.length} сотрудников) выгружено в Excel / CSV`
      );
    } catch {
      exportToCsv('JanaPost_Shtat_Sotrudnikov', employees, [
        { key: 'employeeId', label: 'Табельный номер' },
        { key: 'lastName', label: 'Фамилия' },
        { key: 'firstName', label: 'Имя' },
        { key: 'departmentName', label: 'Департамент' },
        { key: 'jobTitle', label: 'Должность' },
        { key: 'email', label: 'Корпоративный Email' },
        { key: 'phone', label: 'Телефон' },
        { key: 'status', label: 'Статус' },
        { key: 'startDate', label: 'Дата приема' },
      ]);
      toast.success('Экспорт завершен', 'Текущая страница штата выгружена в Excel / CSV');
    }
  };

  const handleSaveEmployee = async (values: any) => {
    const dept = departments.find((d) => d.id === values.departmentId);
    const payload = {
      ...values,
      departmentName: dept?.name || 'Департамент',
    };

    if (selectedEmployee) {
      await updateMutation.mutateAsync({ id: selectedEmployee.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleToggleStatus = async () => {
    if (!deactivateEmployee) return;
    const targetStatus = deactivateEmployee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await statusMutation.mutateAsync({
      id: deactivateEmployee.id,
      newStatus: targetStatus,
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#101828]">Штат сотрудников</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {total} чел.
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Кадровый реестр компании Jana Post: личные дела, должности и статусы
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExport}
            disabled={employees.length === 0}
          >
            Экспорт в CSV
          </Button>
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setSelectedEmployee(null);
              setIsAddEditOpen(true);
            }}
          >
            Добавить сотрудника
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск по ФИО, должности, email или табельному..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Все отделы</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Все статусы</option>
            <option value="ACTIVE">Только активные</option>
            <option value="INACTIVE">Неактивные</option>
          </select>

          {(search || departmentId !== 'ALL' || status !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setDepartmentId('ALL');
                setStatus('ALL');
                setPage(1);
              }}
              className="text-xs text-slate-500"
            >
              Сбросить
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки списка сотрудников</p>
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Сотрудники не найдены"
          description="По заданным фильтрам или поисковому запросу ничего не найдено."
          actionText="Сбросить фильтры"
          onAction={() => {
            setSearch('');
            setDepartmentId('ALL');
            setStatus('ALL');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Сотрудник</th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Департамент</th>
                  <th className="py-3.5 px-4">Должность</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4">В штате с</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Employee avatar & name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {emp.avatarUrl ? (
                            <img
                              src={emp.avatarUrl}
                              alt={emp.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {emp.firstName[0]}
                              {emp.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate sm:hidden">
                            {emp.jobTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {emp.employeeId}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {emp.departmentName}
                    </td>

                    {/* Job Title */}
                    <td className="py-3.5 px-4 text-slate-800">
                      {emp.jobTitle}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {emp.email}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} />
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatKazakhstanDate(emp.startDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Просмотр профиля"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsAddEditOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeactivateEmployee(emp)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={
                            emp.status === 'ACTIVE'
                              ? 'Деактивировать сотрудника'
                              : 'Восстановить в штате'
                          }
                        >
                          {emp.status === 'ACTIVE' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-[#E4E7EC] text-xs">
              <span className="text-slate-500">
                Страница <span className="font-bold text-slate-800">{page}</span> из{' '}
                <span className="font-bold text-slate-800">{totalPages}</span> (Всего: {total})
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSubmit={handleSaveEmployee}
        employee={selectedEmployee}
        departments={departments}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Profile Drawer/Modal */}
      <EmployeeDetailsModal
        isOpen={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        employee={viewEmployee}
        onEdit={(emp) => {
          setSelectedEmployee(emp);
          setIsAddEditOpen(true);
        }}
      />

      {/* Deactivate / Reactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deactivateEmployee}
        onClose={() => setDeactivateEmployee(null)}
        onConfirm={handleToggleStatus}
        title={
          deactivateEmployee?.status === 'ACTIVE'
            ? 'Деактивация сотрудника'
            : 'Восстановление сотрудника'
        }
        message={
          deactivateEmployee?.status === 'ACTIVE'
            ? `Вы уверены, что хотите перевести сотрудника ${deactivateEmployee?.firstName} ${deactivateEmployee?.lastName} в неактивный статус? Доступ к корпоративным сервисам Jana Post будет заблокирован.`
            : `Восстановить активность сотрудника ${deactivateEmployee?.firstName} ${deactivateEmployee?.lastName} в штате?`
        }
        confirmText={
          deactivateEmployee?.status === 'ACTIVE' ? 'Деактивировать' : 'Восстановить'
        }
        variant={deactivateEmployee?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};
