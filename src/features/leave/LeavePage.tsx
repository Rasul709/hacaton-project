import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { LeaveRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { LeaveStatusBadge, LeaveTypeBadge } from '@/components/ui/Badge';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatKazakhstanDate } from '@/lib/utils';
import { LeaveRequestModal } from './LeaveRequestModal';
import { LeaveReviewModal } from './LeaveReviewModal';
import {
  CalendarDays,
  Plus,
  Search,
  Check,
  X,
  RotateCcw,
  Clock,
  CheckCircle2,
  Palmtree,
  Download,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { exportToCsv } from '@/lib/utils/exportCsv';

export const LeavePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<{
    request: LeaveRequest;
    mode: 'approve' | 'reject';
  } | null>(null);

  // Check reviewer privileges
  const canReview =
    user?.role === 'ADMIN' ||
    user?.role === 'HR_MANAGER' ||
    user?.role === 'DEPARTMENT_HEAD';

  // Fetch leave requests
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['leaveRequests', statusFilter],
    queryFn: () =>
      api.leave.getAll({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  });

  const toast = useToast();

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.leave.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Заявление подано', `Запрос на ${data.daysCount} дн. отправлен на согласование`);
    },
    onError: (err: any) => {
      toast.error('Ошибка подачи заявления', err?.message);
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.leave.approve(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Заявление одобрено', `Отпуск сотрудника ${data.employeeName} согласован`);
    },
    onError: (err: any) => {
      toast.error('Ошибка согласования', err?.message);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      api.leave.reject(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.info('Заявление отклонено', `Запрос сотрудника ${data.employeeName} отклонен`);
    },
    onError: (err: any) => {
      toast.error('Ошибка отклонения', err?.message);
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.leave.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.info('Заявление отозвано', 'Ваша заявка на отпуск была отменена');
    },
    onError: (err: any) => {
      toast.error('Ошибка отзыва', err?.message);
    },
  });

  const handleReviewConfirm = async (id: string, comment: string) => {
    if (reviewRequest?.mode === 'approve') {
      await approveMutation.mutateAsync({ id, comment });
    } else {
      await rejectMutation.mutateAsync({ id, comment });
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.leaveType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Kazakhstan Labor Code (ТК РК ст. 88): оплачиваемый трудовой отпуск — не менее 24 календарных дней
  const ANNUAL_QUOTA = 24;

  // Calculate used vacation days from approved requests
  const relevantApprovedLeaves = requests.filter((r) => {
    if (r.status !== 'APPROVED') return false;
    // For regular employees, show their personal balance; for HR/Admins, show corporate stats
    return user?.role === 'EMPLOYEE' ? r.employeeId === user.id : true;
  });

  const usedAnnualDays = relevantApprovedLeaves
    .filter((r) => r.leaveType === 'ANNUAL')
    .reduce((sum, r) => sum + r.daysCount, 0);

  const usedSickDays = relevantApprovedLeaves
    .filter((r) => r.leaveType === 'SICK')
    .reduce((sum, r) => sum + r.daysCount, 0);

  const availableAnnualDays = Math.max(0, ANNUAL_QUOTA - usedAnnualDays);
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  const handleExport = () => {
    exportToCsv(
      'JanaPost_Reestr_Otpuskov_I_Zayavleniy',
      requests.map((r) => ({
        ...r,
        formattedStart: formatKazakhstanDate(r.startDate),
        formattedEnd: formatKazakhstanDate(r.endDate),
        formattedSubmitted: formatKazakhstanDate(r.submittedAt),
      })),
      [
        { key: 'employeeName', label: 'Сотрудник' },
        { key: 'leaveType', label: 'Тип отпуска' },
        { key: 'formattedStart', label: 'Дата начала' },
        { key: 'formattedEnd', label: 'Дата окончания' },
        { key: 'daysCount', label: 'Количество дней' },
        { key: 'status', label: 'Статус заявления' },
        { key: 'reason', label: 'Обоснование / Причина' },
        { key: 'formattedSubmitted', label: 'Дата подачи' },
        { key: 'reviewerName', label: 'Согласующий руководитель' },
      ]
    );
    toast.success('Экспорт завершен', 'Реестр заявлений на отпуск успешно выгружен в формате Excel/CSV');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#101828]">Мои заявки и HR-сервисы</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {pendingCount} на согласовании
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Оформление электронных заявок на отпуск (ТК РК ст. 88), аванс по зарплате и справки с места работы
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExport}
            disabled={requests.length === 0}
          >
            Экспорт реестра
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRequestModalOpen(true)}
          >
            Подать заявление
          </Button>
        </div>
      </div>

      {/* Labor Code of Kazakhstan (ТК РК) Vacation Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Баланс отпуска (ТК РК ст. 88)
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-blue-600">{availableAnnualDays}</span>
                <span className="text-xs text-slate-500">из {ANNUAL_QUOTA} дней доступно</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Palmtree className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (availableAnnualDays / ANNUAL_QUOTA) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Использовано в 2026 году
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-800">{usedAnnualDays}</span>
                <span className="text-xs text-slate-500">дн. отпуска ({usedSickDays} дн. больничных)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (usedAnnualDays / ANNUAL_QUOTA) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Заявки на рассмотрении
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-amber-600">{pendingCount}</span>
                <span className="text-xs text-slate-500">требуют резолюции</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pendingCount > 0 ? 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'Все заявления', value: 'ALL' },
            { label: 'На рассмотрении', value: 'PENDING' },
            { label: 'Одобренные', value: 'APPROVED' },
            { label: 'Отклоненные', value: 'REJECTED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side: Type selector + Search */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Все типы заявок</option>
            <option value="ANNUAL">🏖️ Ежегодный отпуск (ТК РК ст. 88)</option>
            <option value="SALARY_ADVANCE">💰 Аванс по зарплате</option>
            <option value="WORK_CERTIFICATE">📄 Справка с места работы</option>
            <option value="SICK">🏥 Больничный лист</option>
            <option value="UNPAID">⏳ Без содержания</option>
            <option value="STUDY">🎓 Учебный отпуск</option>
            <option value="MATERNITY">👶 Декретный отпуск</option>
          </select>

          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО или причине..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки заявлений на отпуск</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Заявлений не найдено"
          description="По заданным фильтрам заявлений на отпуск не обнаружено."
          actionText="Подать заявление"
          onAction={() => setIsRequestModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Сотрудник</th>
                  <th className="py-3.5 px-4">Тип отпуска</th>
                  <th className="py-3.5 px-4">Период отсутствия</th>
                  <th className="py-3.5 px-4">Дней</th>
                  <th className="py-3.5 px-4">Причина</th>
                  <th className="py-3.5 px-4">Подано</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4">Ревьюер</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {req.employeeName}
                    </td>

                    {/* Leave Type */}
                    <td className="py-3.5 px-4">
                      <LeaveTypeBadge type={req.leaveType} />
                    </td>

                    {/* Period */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {req.leaveType === 'SALARY_ADVANCE' ? (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {req.amount ? `${req.amount.toLocaleString()} ₸` : '150 000 ₸'}
                        </span>
                      ) : req.leaveType === 'WORK_CERTIFICATE' ? (
                        <span className="text-blue-700 font-medium">Электронная справка</span>
                      ) : (
                        `${formatKazakhstanDate(req.startDate)} — ${formatKazakhstanDate(req.endDate)}`
                      )}
                    </td>

                    {/* Days */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {req.leaveType === 'SALARY_ADVANCE'
                        ? '15-е число'
                        : req.leaveType === 'WORK_CERTIFICATE'
                        ? '1 раб. день'
                        : `${req.daysCount} дн.`}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>

                    {/* Submitted At */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatKazakhstanDate(req.submittedAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <LeaveStatusBadge status={req.status} />
                    </td>

                    {/* Reviewer / Comment */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.reviewerName ? (
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800">{req.reviewerName}</span>
                          {req.reviewComment && (
                            <p className="text-slate-400 truncate max-w-[140px]" title={req.reviewComment}>
                              {req.reviewComment}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {canReview && (
                            <>
                              <button
                                onClick={() => setReviewRequest({ request: req, mode: 'approve' })}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Одобрить заявление"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReviewRequest({ request: req, mode: 'reject' })}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="Отклонить заявление"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {req.employeeId === user?.id && (
                            <button
                              onClick={() => cancelMutation.mutate(req.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Отозвать заявление"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Request Form Modal */}
      <LeaveRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
        isLoading={createMutation.isPending}
      />

      {/* Review Modal (Approve / Reject with comment) */}
      <LeaveReviewModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest?.request || null}
        mode={reviewRequest?.mode || 'approve'}
        onConfirm={handleReviewConfirm}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
};
