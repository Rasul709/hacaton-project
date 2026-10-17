import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatKazakhstanDate } from '@/lib/utils';
import {
  Bell,
  CheckCheck,
  CalendarDays,
  CheckSquare,
  Clock,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getAll(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.info('Уведомление прочитано');
    },
    onError: (err: any) => {
      toast.error('Ошибка', err?.message);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Все уведомления прочитаны', 'Счетчик новых оповещений обнулен');
    },
    onError: (err: any) => {
      toast.error('Ошибка', err?.message);
    },
  });

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'LEAVE':
        return <CalendarDays className="w-5 h-5 text-amber-600" />;
      case 'TASK':
        return <CheckSquare className="w-5 h-5 text-blue-600" />;
      case 'ATTENDANCE':
        return <Clock className="w-5 h-5 text-teal-600" />;
      default:
        return <Info className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#101828]">Уведомления и события</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {unreadCount} новых
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Оповещения по кадровым процессам, задачам и отпускам Jana Post
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
          >
            Отметить все как прочитанные
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Все ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Непрочитанные ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-red-200 text-center text-red-600">
          <p className="font-semibold">Ошибка загрузки уведомлений</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Уведомлений нет"
          description={
            filter === 'UNREAD'
              ? 'Все оповещения прочитаны!'
              : 'В системе пока нет записей уведомлений.'
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                !item.isRead ? 'bg-blue-50/30' : ''
              }`}
              onClick={() => {
                if (!item.isRead) markReadMutation.mutate(item.id);
                if (item.link) navigate(item.link);
              }}
            >
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatKazakhstanDate(item.createdAt, true)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{item.message}</p>
              </div>

              {!item.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
