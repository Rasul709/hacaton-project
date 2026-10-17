import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Department } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { DepartmentModal } from './DepartmentModal';
import {
  Building2,
  Plus,
  Users,
  Search,
  Edit2,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { exportToCsv } from '@/lib/utils/exportCsv';

export const DepartmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [viewEmployeesDept, setViewEmployeesDept] = useState<Department | null>(null);

  // Fetch departments
  const { data: departments = [], isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.departments.getAll(),
  });

  // Fetch employees for manager selection & dept members
  const { data: employeeResult } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => api.employees.getAll({ limit: 100 }),
  });
  const allEmployees = employeeResult?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.departments.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.success('Департамент создан', `Отдел «${data.name}» успешно добавлен`);
      setIsModalOpen(false);
      setSelectedDept(null);
    },
    onError: (err: any) => {
      toast.error('Ошибка создания', err?.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      api.departments.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Департамент обновлен', `Данные «${data.name}» сохранены`);
      setIsModalOpen(false);
      setSelectedDept(null);
    },
    onError: (err: any) => {
      toast.error('Ошибка сохранения', err?.message);
    },
  });

  const handleSave = async (values: any) => {
    const manager = allEmployees.find((e) => e.id === values.managerId);
    const payload = {
      ...values,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : undefined,
    };

    if (selectedDept) {
      await updateMutation.mutateAsync({ id: selectedDept.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const filtered = departments.filter(
    (d) =>
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCsv(
      'JanaPost_Otdely_I_Struktura',
      departments,
      [
        { key: 'code', label: 'Код отдела' },
        { key: 'name', label: 'Наименование департамента' },
        { key: 'managerName', label: 'Руководитель' },
        { key: 'employeeCount', label: 'Всего сотрудников' },
        { key: 'activeEmployeesCount', label: 'Активных сотрудников' },
        { key: 'description', label: 'Описание функций' },
      ]
    );
    toast.success('Экспорт завершен', 'Структура департаментов выгружена в файл CSV/Excel');
  };

  const deptMembers = viewEmployeesDept
    ? allEmployees.filter((e) => e.departmentId === viewEmployeesDept.id)
    : [];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#101828]">Организационная структура</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {departments.length} отделов
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Департаменты компании Jana Post, штатная численность и руководители
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExport}
            disabled={departments.length === 0}
          >
            Экспорт отделов
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedDept(null);
              setIsModalOpen(true);
            }}
          >
            Создать департамент
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-3 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или коду отдела..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки департаментов</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Департаменты не найдены"
          description="По вашему запросу не найдено ни одного департамента."
          actionText="Очистить поиск"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Code badge & Edit */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold tracking-wider font-mono border border-blue-100">
                    {dept.code}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDept(dept);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-[#667085] mt-1 line-clamp-2">
                  {dept.description}
                </p>

                {/* Manager */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Руководитель
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {dept.managerName || 'Не назначен'}
                  </p>
                </div>
              </div>

              {/* Bottom statistics & View Employees */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>
                    <strong className="text-slate-900">{dept.employeeCount}</strong> сотрудников (
                    {dept.activeEmployeesCount} активных)
                  </span>
                </div>

                <button
                  onClick={() => setViewEmployeesDept(dept)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Посмотреть сотрудников"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        department={selectedDept}
        employees={allEmployees}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Department Employees Modal */}
      <Modal
        isOpen={!!viewEmployeesDept}
        onClose={() => setViewEmployeesDept(null)}
        title={viewEmployeesDept ? `Сотрудники отдела «${viewEmployeesDept.name}»` : ''}
        description={`Всего числится: ${deptMembers.length} человек`}
        maxWidth="lg"
      >
        <div className="space-y-3">
          {deptMembers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              В данном департаменте пока нет зарегистрированных сотрудников
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {deptMembers.map((emp) => (
                <div
                  key={emp.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">{emp.jobTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-500 block">{emp.employeeId}</span>
                    <span className="text-[11px] text-slate-400">{emp.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setViewEmployeesDept(null)}>
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
