import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatKazakhstanDate } from '@/lib/utils';
import { LeaveStatusBadge, LeaveTypeBadge } from '@/components/ui/Badge';
import { LeaveRequestModal } from '@/features/leave/LeaveRequestModal';
import { useToast } from '@/components/ui/Toast';
import {
  Clock,
  Sparkles,
  GraduationCap,
  CreditCard,
  FileText,
  Palmtree,
  ArrowRight,
  Phone,
  Mail,
  UserCheck,
  Building,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const EmployeeDashboardView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch employee's leave / service requests
  const { data: myRequests = [] } = useQuery({
    queryKey: ['myLeaveRequests'],
    queryFn: () => api.leave.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.leave.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      toast.success('Заявление подано', 'Ваша кадровая заявка успешно отправлена на согласование');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('Ошибка подачи', err?.message);
    },
  });

  // Filter requests that belong to this employee (or demo fallback)
  const employeeRequests = myRequests.filter((request) => request.employeeId === user?.id).slice(0, 4);

  // Dynamic vacation balance according to Kazakhstan Labor Code (24 days)
  const userLeaves = myRequests.filter((r) => r.employeeId === user?.id);
  const usedAnnualDays = userLeaves
    .filter((r) => r.leaveType === 'ANNUAL' && r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.daysCount, 0);
  const totalQuota = 24;
  const availableDays = Math.max(0, totalQuota - usedAnnualDays);
  const plannedDays = userLeaves
    .filter((r) => r.leaveType === 'ANNUAL' && r.status === 'PENDING')
    .reduce((sum, r) => sum + r.daysCount, 0);
  const percentAvailable = Math.round((availableDays / totalQuota) * 100);

  // Employee details fallback
  const hireDate = '15 марта 2023 г.';
  const supervisor = {
    name: 'Нурлан Сериков',
    role: 'IT Director / Руководитель разработки',
    department: 'IT и разработка',
    email: 'nurlan.serikov@janapost.kz',
    phone: '+7 (705) 123-4567',
    status: 'В сети (онлайн)',
    statusColor: 'bg-emerald-500',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  };

  // Learning progress
  const assignedCourses = [
    {
      id: 'course-1',
      title: 'Онбординг в Jana Post: стандарты и ценности',
      status: 'В процессе',
      progress: 60,
      deadline: 'до 25 октября 2026',
      badge: 'Обязательный',
    },
    {
      id: 'course-2',
      title: 'Трудовые права и безопасность: ТК РК ст. 88',
      status: 'Назначен',
      progress: 0,
      deadline: 'до 10 ноября 2026',
      badge: 'Регуляторный',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Hero Card with Profile & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform skew-x-12" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.firstName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md bg-white"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white" title="Онлайн" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
                <span>Личный кабинет сотрудника</span>
                <span>•</span>
                <span>Табельный № {user?.employeeId || 'JP-00106'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-blue-100 mt-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Building className="w-3.5 h-3.5 opacity-80" /> {user?.departmentName || 'IT и разработка'}
                </span>
                <span>•</span>
                <span>{user?.jobTitle || 'Специалист'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 opacity-90">
                  <Calendar className="w-3.5 h-3.5 opacity-80" /> В штате с {hireDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              onClick={() => navigate('/ai-assistant')}
            >
              Спросить AI-ассистента
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white"
              leftIcon={<Palmtree className="w-4 h-4 text-emerald-300" />}
              onClick={() => setIsModalOpen(true)}
            >
              Подать заявку
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-white text-blue-800 hover:bg-blue-50 border-transparent font-bold shadow-md"
              leftIcon={<Clock className="w-4 h-4 text-blue-600" />}
              onClick={() => navigate('/attendance')}
            >
              Мой табель (Приход)
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid: Leave Balance + LMS + Supervisor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card A: Leave Balance according to ТК РК ст. 88 */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                ТК РК ст. 88
              </span>
              <Palmtree className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">Баланс ежегодного отпуска</h3>
            <p className="text-xs text-[#667085] mt-0.5">Оплачиваемый трудовой отпуск</p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{availableDays}</span>
              <span className="text-sm font-semibold text-slate-500">из 24 дней доступно</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentAvailable}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Использовано</span>
                <span className="font-bold text-slate-800 text-sm">{usedAnnualDays} дн.</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Запланировано</span>
                <span className="font-bold text-blue-600 text-sm">{plannedDays} дн.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
          >
            <span>Запросить отпуск</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card B: Assigned Learning (Jana Academy) */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                Jana Academy
              </span>
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">Назначенное обучение</h3>
            <p className="text-xs text-[#667085] mt-0.5">LMS контур адаптации и развития</p>

            <div className="mt-3 space-y-3">
              {assignedCourses.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                      {c.badge}
                    </span>
                    <span className="text-[11px] text-slate-500">{c.deadline}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-600">
                    <span>{c.status}</span>
                    <span className="font-semibold">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/academy')}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
          >
            <span>Перейти в Академию</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card C: Immediate Supervisor Widget */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                Руководитель
              </span>
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">Мой руководитель</h3>
            <p className="text-xs text-[#667085] mt-0.5">Согласующий кадровые заявки</p>

            <div className="mt-4 flex items-center gap-3.5">
              <img
                src={supervisor.avatar}
                alt={supervisor.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-100"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">{supervisor.name}</h4>
                <p className="text-xs text-slate-500 truncate">{supervisor.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${supervisor.statusColor}`} />
                  <span className="text-[11px] font-medium text-slate-600">{supervisor.status}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <a
                href={`mailto:${supervisor.email}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{supervisor.email}</span>
              </a>
              <a
                href={`tel:${supervisor.phone}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{supervisor.phone}</span>
              </a>
            </div>
          </div>

          <button
            onClick={() => navigate('/tasks')}
            className="mt-5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
          >
            <span>Поставить вопрос / Задачу</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Fast HR Services Grid: Vacation, Advance, Certificate, AI FAQ */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#101828] mb-1">
          Кадровые сервисы в 1 клик
        </h3>
        <p className="text-xs text-[#667085] mb-4">
          Подавайте заявления без бумажной волокиты с автоматическим согласованием
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Service 1: Vacation */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Palmtree className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
              Заявление на отпуск
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Оплачиваемый (ст. 88 ТК РК), без содержания или учебный отпуск
            </p>
          </div>

          {/* Service 2: Advance */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
              Запросить аванс (₸)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Межрасчетная выплата до 50% оклада на 15-е число месяца
            </p>
          </div>

          {/* Service 3: Work Certificate */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700">
              Справка с места работы
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Для посольств, банков или eGov с цифровой печатью HR
            </p>
          </div>

          {/* Service 4: AI Advisor */}
          <div
            onClick={() => navigate('/ai-assistant')}
            className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <h4 className="text-sm font-bold text-indigo-950 group-hover:text-indigo-700">
              AI HR-Ассистент
            </h4>
            <p className="text-xs text-indigo-700/80 mt-1">
              Мгновенные ответы по ТК РК, регламентам, ДМС и отпускам
            </p>
          </div>
        </div>
      </div>

      {/* 4. My Recent Requests Table Preview */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Мои недавние кадровые заявки</h3>
            <p className="text-xs text-[#667085]">История обращений и текущие статусы согласования</p>
          </div>
          <button
            onClick={() => navigate('/leave')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Все заявки</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-[#667085] text-xs uppercase font-semibold border-b border-[#E4E7EC]">
              <tr>
                <th className="py-3 px-4">Тип заявки</th>
                <th className="py-3 px-4">Период / Детали</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4">Дата подачи</th>
                <th className="py-3 px-4 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {employeeRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <LeaveTypeBadge type={req.leaveType} />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700">
                    <span>
                      {formatKazakhstanDate(req.startDate)} — {formatKazakhstanDate(req.endDate)} ({req.daysCount} дн.)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <LeaveStatusBadge status={req.status} />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatKazakhstanDate(req.submittedAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate('/leave')}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave / Advance Request Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
