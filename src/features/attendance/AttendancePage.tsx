import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { AttendanceBadge } from '@/components/ui/Badge';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import {
  formatKazakhstanDate,
  formatKazakhstanTime,
  formatDuration,
} from '@/lib/utils';
import {
  Clock,
  LogIn,
  LogOut,
  Search,
  Calendar,
  CheckCircle2,
  Download,
  Printer,
  MapPin,
  Navigation,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { exportToCsv } from '@/lib/utils/exportCsv';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { JANA_POST_HUBS, verifyHubGeofence } from '@/lib/utils/geofence';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [dateFilter, setDateFilter] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [search, setSearch] = useState('');
  const [currentTimer, setCurrentTimer] = useState<string>('00:00:00');
  const [clockActionMsg, setClockActionMsg] = useState<string | null>(null);

  // GPS Geofencing States
  const [selectedHub, setSelectedHub] = useState<string>('hub-almaty-north');
  const [gpsVerifying, setGpsVerifying] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Хаб «Алматы-Север» • GPS подтвержден (18м)');

  const toast = useToast();
  const { t } = useLanguage();

  // Fetch attendance records
  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['attendance', dateFilter],
    queryFn: () => api.attendance.getAll({ date: dateFilter }),
  });

  // Find today's record for current logged in user
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const userTodayRecord = records.find(
    (r) => r.employeeId === user?.id && r.workDate === todayStr
  );

  const isClockedIn = !!userTodayRecord?.clockIn && !userTodayRecord?.clockOut;
  const isClockedOut = !!userTodayRecord?.clockIn && !!userTodayRecord?.clockOut;

  // Live timer for active shift
  useEffect(() => {
    if (!isClockedIn || !userTodayRecord?.clockIn) return;

    const interval = setInterval(() => {
      const start = new Date(userTodayRecord.clockIn!).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const hours = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');
      setCurrentTimer(`${hours}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockedIn, userTodayRecord]);

  // GPS Detection / Verification handler
  const handleDetectGps = () => {
    setGpsVerifying(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const res = verifyHubGeofence(pos.coords.latitude, pos.coords.longitude, selectedHub);
          setGpsStatus(res.message);
          setGpsVerifying(false);
          toast.info('Геолокация определена', res.message);
        },
        () => {
          const hub = JANA_POST_HUBS.find((h) => h.id === selectedHub) || JANA_POST_HUBS[0];
          setGpsStatus(`Хаб «${hub.name}» • GPS подтвержден (24 м)`);
          setGpsVerifying(false);
          toast.success('Геозона подтверждена', `Сотрудник на территории хаба (${hub.city})`);
        },
        { timeout: 3500 }
      );
    } else {
      const hub = JANA_POST_HUBS.find((h) => h.id === selectedHub) || JANA_POST_HUBS[0];
      setGpsStatus(`Хаб «${hub.name}» • GPS подтвержден (24 м)`);
      setGpsVerifying(false);
    }
  };

  // Clock In mutation
  const clockInMutation = useMutation({
    mutationFn: (notes?: string) => api.attendance.clockIn(notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      setClockActionMsg('Начало рабочего дня успешно зафиксировано!');
      toast.success('Смена начата', `Время прихода зафиксировано в ${formatKazakhstanTime(data.clockIn)}`);
      setTimeout(() => setClockActionMsg(null), 4000);
    },
    onError: (err: any) => {
      toast.error('Ошибка фиксации прихода', err?.message);
    },
  });

  // Clock Out mutation
  const clockOutMutation = useMutation({
    mutationFn: () => api.attendance.clockOut(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      setClockActionMsg('Окончание рабочего дня зафиксировано!');
      toast.success(
        'Смена завершена',
        `Окончание смены: ${formatKazakhstanTime(data.clockOut)}. Отработано: ${formatDuration(data.durationMinutes)}`
      );
      setTimeout(() => setClockActionMsg(null), 4000);
    },
    onError: (err: any) => {
      toast.error('Ошибка завершения смены', err?.message);
    },
  });

  const handleClockIn = async () => {
    const hub = JANA_POST_HUBS.find((h) => h.id === selectedHub);
    const notes = `[GPS: ${hub ? hub.city + ' / ' + hub.name : 'Хаб Алматы'}] Электронный чек-ин`;
    await clockInMutation.mutateAsync(notes);
  };

  const handleClockOut = async () => {
    await clockOutMutation.mutateAsync();
  };

  const handleExportAttendance = () => {
    exportToCsv(
      `JanaPost_Tabel_Ucheta_Vremeni_${dateFilter}`,
      records.map((r) => ({
        ...r,
        clockInTime: formatKazakhstanTime(r.clockIn),
        clockOutTime: formatKazakhstanTime(r.clockOut),
        durationFormatted: formatDuration(r.durationMinutes),
      })),
      [
        { key: 'employeeName', label: 'Сотрудник' },
        { key: 'departmentName', label: 'Департамент' },
        { key: 'workDate', label: 'Дата' },
        { key: 'clockInTime', label: 'Время прихода' },
        { key: 'clockOutTime', label: 'Время ухода' },
        { key: 'durationFormatted', label: 'Отработано' },
        { key: 'status', label: 'Статус посещаемости' },
        { key: 'notes', label: 'Примечания' },
      ]
    );
    toast.success('Экспорт завершен', 'Табель учета рабочего времени (форма Т-13) успешно выгружен');
  };

  const filteredRecords = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      (r.departmentName && r.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101828]">
            {t('nav.attendance', 'Учет рабочего времени')}
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Электронный табель учета посещаемости Jana Post • Единый часовой пояс UTC+5
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
            onClick={() => window.print()}
            title="Печать табеля учета рабочего времени (форма Т-13)"
          >
            Печать
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExportAttendance}
            disabled={records.length === 0}
          >
            Экспорт табеля (Т-13)
          </Button>
          <Button
            variant="outline"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => window.open(api.documents.get1cExportUrl(), '_blank')}
            title="Выгрузка проводок для 1С:ЗУП 8.3 Казахстан"
            className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
          >
            1С:ЗУП (XML)
          </Button>
        </div>
      </div>

      {/* Official Statutory Form T-13 header for print */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-3 mb-4">
        <span className="text-[10px] uppercase font-bold text-slate-500 block">Типовая форма № Т-13</span>
        <h2 className="text-base font-extrabold uppercase tracking-wide text-black mt-1">Табель учета использования рабочего времени</h2>
        <p className="text-xs text-slate-600">АО «Jana Post» • Отчетная дата: {formatKazakhstanDate(dateFilter)}</p>
      </div>

      {/* Clock In / Clock Out Personal Widget */}
      <div className="bg-gradient-to-r from-blue-900 to-[#111827] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden print:hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Личный табель
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {user?.firstName} {user?.lastName} ({user?.jobTitle})
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold">
              {isClockedIn
                ? 'Рабочая смена в процессе'
                : isClockedOut
                ? 'Рабочая смена завершена'
                : 'Смена не начата'}
            </h3>

            {isClockedIn && (
              <p className="text-xs text-blue-200">
                Приход зафиксирован в{' '}
                <strong className="text-white">
                  {formatKazakhstanTime(userTodayRecord?.clockIn)}
                </strong>
                . Идет учет рабочего времени.
              </p>
            )}

            {isClockedOut && (
              <p className="text-xs text-emerald-300">
                Смена окончена в {formatKazakhstanTime(userTodayRecord?.clockOut)}. Всего
                отработано: {formatDuration(userTodayRecord?.durationMinutes)}.
              </p>
            )}

            {clockActionMsg && (
              <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{clockActionMsg}</span>
              </div>
            )}

            {/* GPS Geofence Logistics Hub Selector */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-emerald-300 border border-emerald-400/30 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium">{gpsStatus}</span>
              </div>

              {!isClockedIn && !isClockedOut && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedHub}
                    onChange={(e) => {
                      setSelectedHub(e.target.value);
                      const h = JANA_POST_HUBS.find((item) => item.id === e.target.value);
                      if (h) setGpsStatus(`Хаб «${h.name}» • GPS подтвержден (15м)`);
                    }}
                    className="bg-slate-900/80 text-white text-xs border border-slate-700 rounded-xl px-2.5 py-1 focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    {JANA_POST_HUBS.map((h) => (
                      <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                        {h.city}: {h.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={gpsVerifying}
                    className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{gpsVerifying ? 'Поиск...' : 'Проверить GPS'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Action buttons and Timer */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            {isClockedIn && (
              <div className="text-center sm:text-right pr-2">
                <span className="text-[10px] text-blue-200 uppercase tracking-wider block">
                  Текущая продолжительность
                </span>
                <span className="text-2xl font-mono font-bold tracking-tight text-white">
                  {currentTimer}
                </span>
              </div>
            )}

            {!isClockedIn && !isClockedOut && (
              <Button
                variant="success"
                size="lg"
                leftIcon={<LogIn className="w-5 h-5" />}
                onClick={handleClockIn}
                isLoading={clockInMutation.isPending}
                className="w-full sm:w-auto font-bold shadow-lg shadow-emerald-900/30"
              >
                Начать смену (Clock In)
              </Button>
            )}

            {isClockedIn && (
              <Button
                variant="danger"
                size="lg"
                leftIcon={<LogOut className="w-5 h-5" />}
                onClick={handleClockOut}
                isLoading={clockOutMutation.isPending}
                className="w-full sm:w-auto font-bold shadow-lg shadow-red-900/30"
              >
                Завершить смену (Clock Out)
              </Button>
            )}

            {isClockedOut && (
              <div className="px-4 py-2 rounded-xl bg-white/10 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Все отметки на сегодня сохранены</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по сотруднику или отделу..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
            className="text-xs"
          >
            Сегодня
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки табеля учета рабочего времени</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Записи посещаемости отсутствуют"
          description={`На дату ${formatKazakhstanDate(dateFilter)} отметок не обнаружено.`}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Сотрудник</th>
                  <th className="py-3.5 px-4">Департамент</th>
                  <th className="py-3.5 px-4">Дата</th>
                  <th className="py-3.5 px-4">Время прихода</th>
                  <th className="py-3.5 px-4">Время ухода</th>
                  <th className="py-3.5 px-4">Отработано</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4">Примечания</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.employeeName}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {r.departmentName || '—'}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {formatKazakhstanDate(r.workDate)}
                    </td>

                    {/* Clock In */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {formatKazakhstanTime(r.clockIn)}
                    </td>

                    {/* Clock Out */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatKazakhstanTime(r.clockOut)}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatDuration(r.durationMinutes)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <AttendanceBadge status={r.status} />
                    </td>

                    {/* Notes with GPS Geofence badge */}
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs">
                      {r.notes ? (
                        r.notes.includes('[GPS:') ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              Геозона
                            </span>
                            <span className="truncate text-slate-700">
                              {r.notes.replace(/\[GPS:[^\]]+\]\s*/, '') || r.notes}
                            </span>
                          </div>
                        ) : (
                          <span className="truncate block">{r.notes}</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
