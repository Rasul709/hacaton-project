import React from 'react';
import { cn } from '@/lib/utils';
import {
  AttendanceStatus,
  EmploymentStatus,
  LeaveStatus,
  LeaveType,
  TaskPriority,
  TaskStatus,
} from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dots = {
    default: 'bg-slate-400',
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-medium select-none shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dots[variant])} />}
      {children}
    </span>
  );
};

// Specialized Domain Badges:
export const StatusBadge: React.FC<{ status: EmploymentStatus | string }> = ({ status }) => {
  if (status === 'ACTIVE') {
    return <Badge variant="success" dot>Активен</Badge>;
  }
  return <Badge variant="neutral" dot>Неактивен</Badge>;
};

export const AttendanceBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  switch (status) {
    case 'PRESENT':
      return <Badge variant="success" dot>Присутствует</Badge>;
    case 'LATE':
      return <Badge variant="warning" dot>Опоздание</Badge>;
    case 'HALF_DAY':
      return <Badge variant="info" dot>Неполный день</Badge>;
    case 'ABSENT':
      return <Badge variant="danger" dot>Отсутствует</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const LeaveStatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="warning" dot>На рассмотрении</Badge>;
    case 'APPROVED':
      return <Badge variant="success" dot>Одобрено</Badge>;
    case 'REJECTED':
      return <Badge variant="danger" dot>Отклонено</Badge>;
    case 'CANCELLED':
      return <Badge variant="neutral">Отозвано</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const LeaveTypeBadge: React.FC<{ type: LeaveType }> = ({ type }) => {
  switch (type) {
    case 'ANNUAL':
      return <Badge variant="info">Ежегодный отпуск</Badge>;
    case 'SICK':
      return <Badge variant="danger">Больничный лист</Badge>;
    case 'UNPAID':
      return <Badge variant="neutral">Без содержания</Badge>;
    case 'MATERNITY':
      return <Badge variant="purple">Декретный отпуск</Badge>;
    case 'STUDY':
      return <Badge variant="warning">Учебный отпуск</Badge>;
    default:
      return <Badge variant="neutral">{type}</Badge>;
  }
};

export const TaskPriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="danger" dot>Срочно</Badge>;
    case 'HIGH':
      return <Badge variant="warning" dot>Высокий</Badge>;
    case 'MEDIUM':
      return <Badge variant="info">Средний</Badge>;
    case 'LOW':
      return <Badge variant="neutral">Низкий</Badge>;
    default:
      return <Badge variant="neutral">{priority}</Badge>;
  }
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'TODO':
      return <Badge variant="neutral">К выполнению</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="info" dot>В работе</Badge>;
    case 'DONE':
      return <Badge variant="success" dot>Завершено</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">Отменено</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
