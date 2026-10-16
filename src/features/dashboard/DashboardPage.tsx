import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { MetricCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatKazakhstanDate } from '@/lib/utils';
import {
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  Clock,
  CheckSquare,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const LEAVE_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#16A34A',
  REJECTED: '#DC2626',
};

const LEAVE_LABELS: Record<string, string> = {
  PENDING: 'На рассмотрении',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: () => api.dashboard.getOverview(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-2xl border border-slate-200" />
          <div className="h-72 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="font-semibold">Не удалось загрузить показатели дашборда</p>
        <p className="text-xs text-slate-500 mt-1">Проверьте подключение к API или переключитесь в Демо-режим</p>
      </div>
    );
  }

  const leaveChartData = dashboard.leaveDistribution.map((item) => ({
    name: LEAVE_LABELS[item.status] || item.status,
    value: item.count,
    color: LEAVE_COLORS[item.status] || '#64748B',
  }));

  return (
    <div className="space-y-6 text-left">
      {/* Header Greeting & Operational Summary */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <span>Операционная сводка</span>
            <span>•</span>
            <span>{formatKazakhstanDate(new Date())}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#101828] mt-1">
            С возвращением, {user?.firstName}! 👋
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            Компания Jana Post работает в штатном режиме. Сегодня на смене {dashboard.attendanceTodayCount} из {dashboard.activeEmployees} активных сотрудников.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Clock className="w-4 h-4 text-blue-600" />}
            onClick={() => navigate('/attendance')}
          >
            Табель
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CalendarDays className="w-4 h-4 text-emerald-600" />}
            onClick={() => navigate('/leave')}
          >
            Заявка на отпуск
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/tasks')}
          >
            Новая задача
          </Button>
        </div>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          label="Всего сотрудников"
          value={dashboard.totalEmployees}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ value: '+4%', isPositive: true, label: 'в этом мес.' }}
          onClick={() => navigate('/employees')}
        />
        <MetricCard
          label="Активных в штате"
          value={dashboard.activeEmployees}
          icon={UserCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => navigate('/employees')}
        />
        <MetricCard
          label="Департаментов"
          value={dashboard.departmentsCount}
          icon={Building2}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => navigate('/departments')}
        />
        <MetricCard
          label="Заявок на отпуск"
          value={dashboard.pendingLeavesCount}
          icon={CalendarDays}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ value: 'Требуют ревью' }}
          onClick={() => navigate('/leave')}
        />
        <MetricCard
          label="Явка сегодня"
          value={dashboard.attendanceTodayCount}
          icon={Clock}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          onClick={() => navigate('/attendance')}
        />
        <MetricCard
          label="Задач в работе"
          value={dashboard.tasksInProgressCount}
          icon={CheckSquare}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          onClick={() => navigate('/tasks')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trends */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#101828]">
                Динамика посещаемости за неделю
              </h3>
              <p className="text-xs text-[#667085]">
                Количество сотрудников вовремя, с опозданием и отсутствующих
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Вовремя
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Опоздания
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.weeklyAttendance}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[80, 105]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Вовремя"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#presentGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="late"
                  name="Опоздания"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#lateGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave distribution donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#101828]">
              Статусы отпусков и отгулов
            </h3>
            <p className="text-xs text-[#667085]">
              Текущее распределение заявлений
            </p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leaveChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(val) => <span className="text-xs text-slate-600">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <button
            onClick={() => navigate('/leave')}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-2 border-t border-slate-100"
          >
            <span>Перейти к согласованию заявок</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Employees by Dept + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Employees by department bar chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#101828]">
                Численность по департаментам
              </h3>
              <p className="text-xs text-[#667085]">
                Распределение штата компании Jana Post
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.employeesByDepartment}>
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Сотрудников"
                  fill="#2563EB"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activity stream */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#101828]">
                Последние события в системе
              </h3>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-[#667085] mb-4">
              Лента активности отдела кадров и сотрудников
            </p>

            <div className="space-y-3.5">
              {dashboard.recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {act.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#101828]">
                      <span className="font-bold">{act.user}</span>{' '}
                      <span className="text-[#667085]">{act.action}</span>{' '}
                      <span className="font-semibold text-slate-800">«{act.target}»</span>
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Все действия логируются в журнал аудита Jana Post Enterprise
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
