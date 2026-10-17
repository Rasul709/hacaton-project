import React, { useState } from 'react';
import { LeaveRequest } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LeaveTypeBadge } from '@/components/ui/Badge';
import { formatKazakhstanDate, getAttachmentUrl } from '@/lib/utils';
import { Check, X, FileText, ExternalLink } from 'lucide-react';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  mode: 'approve' | 'reject';
  onConfirm: (id: string, comment: string) => Promise<void>;
  isLoading?: boolean;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  mode,
  onConfirm,
  isLoading = false,
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  const isApprove = mode === 'approve';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApprove && !comment.trim()) {
      setError('Для отклонения заявки необходимо указать причину отказа');
      return;
    }
    setError(null);
    await onConfirm(request.id, comment);
    setComment('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApprove ? 'Согласование отпуска' : 'Отклонение заявления на отпуск'}
      description={`Заявитель: ${request.employeeName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request details brief */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Тип отпуска:</span>
            <LeaveTypeBadge type={request.leaveType} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Сроки:</span>
            <span className="font-semibold text-slate-800">
              {formatKazakhstanDate(request.startDate)} — {formatKazakhstanDate(request.endDate)} ({request.daysCount} дн.)
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Причина сотрудника:</span>
            <p className="mt-0.5 text-slate-700 italic bg-white p-2 rounded-lg border border-slate-100">
              «{request.reason}»
            </p>
          </div>
          {request.attachmentUrl && (
            <div className="flex items-center justify-between p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-lg text-xs mt-2">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-blue-900 truncate">
                  {request.attachmentName || 'Подтверждающий документ'}
                </span>
              </div>
              <a
                href={getAttachmentUrl(request.attachmentUrl)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors shrink-0 ml-2"
              >
                <span>Просмотреть</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        <Textarea
          label={isApprove ? 'Комментарий руководителя (необязательно)' : 'Причина отклонения заявления *'}
          placeholder={
            isApprove
              ? 'Согласовано с замещением, хорошего отдыха'
              : 'Укажите причину отказа (например: совпадение графика дежурств, производственная необходимость)...'
          }
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (error) setError(null);
          }}
          error={error || undefined}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant={isApprove ? 'success' : 'danger'}
            size="sm"
            leftIcon={isApprove ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            isLoading={isLoading}
          >
            {isApprove ? 'Одобрить отпуск' : 'Отклонить заявку'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
