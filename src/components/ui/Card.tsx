import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hover = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-5 md:p-6 transition-all duration-200',
        hover && 'hover:shadow-md hover:border-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-[#2563EB]',
  iconBg = 'bg-[#EFF6FF]',
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs transition-all duration-200 text-left',
        onClick && 'cursor-pointer hover:border-[#2563EB]/40 hover:shadow-md active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
          {label}
        </span>
        <div className={cn('p-2.5 rounded-xl shrink-0 flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#101828]">
          {value}
        </span>
        {trend && (
          <div
            className={cn(
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md',
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            <span>{trend.value}</span>
            {trend.label && <span className="ml-1 text-[11px] font-normal text-slate-500">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
