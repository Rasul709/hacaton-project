import React, { useMemo, useState } from 'react';
import { LeaveRequest } from '@/types';
import { formatKazakhstanDate } from '@/lib/utils';
import { Palmtree, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface VacationGanttChartProps {
  requests: LeaveRequest[];
  year?: number;
}

const MONTHS_RU = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
];

export const VacationGanttChart: React.FC<VacationGanttChartProps> = ({
  requests,
  year = 2026,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(year);
  const [hoveredRequest, setHoveredRequest] = useState<LeaveRequest | null>(null);

  // Group approved and pending vacation/leaves by employee
  const employeeRows = useMemo(() => {
    const map = new Map<string, { employeeName: string; leaves: LeaveRequest[] }>();

    requests.forEach((req) => {
      // Filter by selected year
      const startYear = new Date(req.startDate).getFullYear();
      const endYear = new Date(req.endDate).getFullYear();
      if (startYear !== selectedYear && endYear !== selectedYear) return;

      const existing = map.get(req.employeeId) || {
        employeeName: req.employeeName,
        leaves: [],
      };
      existing.leaves.push(req);
      map.set(req.employeeId, existing);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName)
    );
  }, [requests, selectedYear]);

  // Total days in selected year (365 or 366)
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const totalDays = isLeapYear(selectedYear) ? 366 : 365;

  const getDayOfYear = (d: Date): number => {
    const start = new Date(selectedYear, 0, 1);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calculate percentage offset and width for a leave bar
  const getBarStyle = (req: LeaveRequest) => {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);

    const startClamped = start.getFullYear() < selectedYear ? new Date(selectedYear, 0, 1) : start;
    const endClamped = end.getFullYear() > selectedYear ? new Date(selectedYear, 11, 31) : end;

    const startDay = Math.max(1, getDayOfYear(startClamped));
    const endDay = Math.min(totalDays, getDayOfYear(endClamped));

    const leftPercent = ((startDay - 1) / totalDays) * 100;
    const widthPercent = Math.max(1.5, ((endDay - startDay + 1) / totalDays) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const getBarColor = (req: LeaveRequest) => {
    if (req.status === 'APPROVED') {
      if (req.leaveType === 'ANNUAL') return 'bg-blue-600 border-blue-700 text-white shadow-xs';
      if (req.leaveType === 'SICK') return 'bg-amber-600 border-amber-700 text-white';
      return 'bg-emerald-600 border-emerald-700 text-white';
    }
    if (req.status === 'PENDING') {
      return 'bg-amber-400 border-dashed border-amber-500 text-slate-900';
    }
    return 'bg-slate-400 border-slate-500 text-white opacity-40';
  };

  // Current day marker (for 2026)
  const today = new Date();
  const showTodayMarker = today.getFullYear() === selectedYear;
  const todayLeft = showTodayMarker ? `${((getDayOfYear(today) - 1) / totalDays) * 100}%` : null;

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs space-y-4">
      {/* Header & Year Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Palmtree className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              График отпусков (ст. 93 ТК РК)
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Таймлайн {selectedYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Календарная диаграмма распределения отпусков сотрудников Jana Post
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600 mr-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
              Ежегодный
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-amber-400 inline-block" />
              На согласовании
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
              Другой
            </span>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="Предыдущий год"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold px-3 text-slate-800">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="Следующий год"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {employeeRows.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          На {selectedYear} год запланированных отпусков не найдено.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Months Header */}
            <div className="grid grid-cols-12 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
              <div className="col-span-3 text-left pl-2">Сотрудник</div>
              <div className="col-span-9 grid grid-cols-12 divide-x divide-slate-100">
                {MONTHS_RU.map((m, idx) => (
                  <div key={idx} className="py-0.5">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Rows */}
            <div className="divide-y divide-slate-100 mt-1 relative">
              {/* Today line */}
              {todayLeft && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500/60 z-20 pointer-events-none"
                  style={{ left: `calc(25% + (0.75 * ${todayLeft}))` }}
                  title="Сегодня"
                >
                  <span className="absolute -top-3 -translate-x-1/2 text-[9px] font-bold bg-red-500 text-white px-1 rounded-xs">
                    Сегодня
                  </span>
                </div>
              )}

              {employeeRows.map((row) => (
                <div
                  key={row.employeeName}
                  className="grid grid-cols-12 items-center py-2.5 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Employee Name */}
                  <div className="col-span-3 pr-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {row.employeeName.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {row.employeeName}
                    </span>
                  </div>

                  {/* Gantt Bar Area */}
                  <div className="col-span-9 relative h-8 bg-slate-50/60 rounded-xl overflow-hidden border border-slate-100">
                    {/* Month grid lines */}
                    <div className="absolute inset-0 grid grid-cols-12 divide-x divide-slate-200/50 pointer-events-none">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} />
                      ))}
                    </div>

                    {/* Bars */}
                    {row.leaves.map((req) => {
                      const style = getBarStyle(req);
                      const color = getBarColor(req);
                      return (
                        <div
                          key={req.id}
                          style={style}
                          onMouseEnter={() => setHoveredRequest(req)}
                          onMouseLeave={() => setHoveredRequest(null)}
                          className={`absolute top-1 bottom-1 rounded-lg border text-[10px] font-semibold flex items-center px-1.5 cursor-pointer truncate transition-all hover:scale-[1.02] hover:z-30 ${color}`}
                          title={`${req.employeeName}: ${formatKazakhstanDate(req.startDate)} — ${formatKazakhstanDate(req.endDate)} (${req.daysCount} дн.)`}
                        >
                          {req.status === 'APPROVED' ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0 mr-1 opacity-80" />
                          ) : (
                            <Clock className="w-3 h-3 shrink-0 mr-1 opacity-80" />
                          )}
                          <span className="truncate">
                            {req.daysCount} дн. {req.reason}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hover Info Card */}
      {hoveredRequest && (
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{hoveredRequest.employeeName}</span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-800 font-medium">
              {formatKazakhstanDate(hoveredRequest.startDate)} — {formatKazakhstanDate(hoveredRequest.endDate)} ({hoveredRequest.daysCount} календарных дней)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-600">Статус:</span>
            <span className={`font-bold ${hoveredRequest.status === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {hoveredRequest.status === 'APPROVED' ? 'Согласован (Приказ Т-6 подписан)' : 'На рассмотрении руководителя'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
