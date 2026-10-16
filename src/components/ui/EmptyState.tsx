import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[#E4E7EC] bg-white">
      <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-[#101828]">{title}</h4>
      <p className="text-sm text-[#667085] max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] p-4 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-lg w-full mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 border-b border-slate-100 last:border-none">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-slate-100 rounded"
              style={{ width: `${Math.max(15, 90 / cols)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
